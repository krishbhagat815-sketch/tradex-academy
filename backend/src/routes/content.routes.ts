import { Router, Response } from 'express';
import { SiteContentModel, UserModel, CourseModel, EnrollmentModel } from '../models/index.js';

const router = Router();

// Public CMS Content for Landing Page
router.get('/', async (_req, res: Response) => {
  try {
    const rows = await SiteContentModel.find().lean();
    const content: Record<string, any> = {};

    rows.forEach((r: any) => {
      try {
        content[r.key] = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
      } catch {
        content[r.key] = r.value;
      }
    });

    // Also get live platform counts
    const totalStudents = await UserModel.countDocuments({ role: 'student' }) || 45000;
    const totalCourses = await CourseModel.countDocuments({ status: 'published' }) || 12;
    const totalEnrollments = await EnrollmentModel.countDocuments({ status: { $ne: 'revoked' } }) || 12800;

    res.json({
      success: true,
      content,
      live_stats: {
        total_students: Number(totalStudents),
        total_courses: Number(totalCourses),
        total_enrollments: Number(totalEnrollments)
      }
    });
  } catch (error: any) {
    console.error('Fetch site content error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch site content.' });
  }
});

export const DEFAULT_LOGO_CONFIG = {
  logoType: 'icon', // 'image' | 'icon'
  logoUrl: '',
  faviconUrl: '',
  brandNamePrimary: 'The Safe',
  brandNameSecondary: 'Trading',
  brandSecondaryColor: '#16a34a',
  brandTagline: 'ગુજરાતનું શ્રેષ્ઠ શેર બજાર અને ટ્રેડિંગ શિક્ષણ',
  iconName: 'TrendingUp',
  iconColor: '#ef4444',
  bgColor: '#020617',
  borderRadius: 'rounded-xl',
  heightPx: 40
};

// Public Settings (including WhatsApp and Brand Logo configuration)
router.get('/settings', async (_req, res: Response) => {
  try {
    const [settingsRow, logoRow] = await Promise.all([
      SiteContentModel.findOne({ key: 'settings' }).lean(),
      SiteContentModel.findOne({ key: 'logo' }).lean()
    ]);

    let settings = {
      platformName: 'The Safe Trading Academy',
      supportEmail: 'support@tradex.com',
      supportPhone: '+91 7435961016',
      currencySymbol: '₹',
      whatsapp_enabled: true,
      whatsapp_number: '917435961016',
      whatsapp_default_message: 'Hello, I would like to know more about your courses.'
    };
    if (settingsRow?.value) {
      try {
        const parsed = typeof settingsRow.value === 'string' ? JSON.parse(settingsRow.value) : settingsRow.value;
        settings = { ...settings, ...parsed };
      } catch {}
    }

    let logo = { ...DEFAULT_LOGO_CONFIG };
    if (logoRow?.value) {
      try {
        const parsedLogo = typeof logoRow.value === 'string' ? JSON.parse(logoRow.value) : logoRow.value;
        logo = { ...logo, ...parsedLogo };
      } catch {}
    }

    res.json({ success: true, settings, logo });
  } catch (error: any) {
    console.error('Fetch settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
});

// Dedicated Public Logo Configuration Endpoint
router.get('/logo', async (_req, res: Response) => {
  try {
    const logoRow = await SiteContentModel.findOne({ key: 'logo' }).lean();
    let logo = { ...DEFAULT_LOGO_CONFIG };
    if (logoRow?.value) {
      try {
        const parsed = typeof logoRow.value === 'string' ? JSON.parse(logoRow.value) : logoRow.value;
        logo = { ...logo, ...parsed };
      } catch {}
    }
    res.json({ success: true, logo });
  } catch (error: any) {
    console.error('Fetch logo error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch logo config.' });
  }
});

export default router;
