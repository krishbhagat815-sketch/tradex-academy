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

// Public Settings (including WhatsApp configuration)
router.get('/settings', async (_req, res: Response) => {
  try {
    const row = await SiteContentModel.findOne({ key: 'settings' }).lean();
    let settings = {
      platformName: 'The Safe Trading Academy',
      supportEmail: 'support@tradex.com',
      supportPhone: '+91 7435961016',
      currencySymbol: '₹',
      whatsapp_enabled: true,
      whatsapp_number: '917435961016',
      whatsapp_default_message: 'Hello, I would like to know more about your courses.'
    };
    if (row?.value) {
      try {
        const parsed = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
        settings = { ...settings, ...parsed };
      } catch {}
    }
    res.json({ success: true, settings });
  } catch (error: any) {
    console.error('Fetch settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
});

export default router;
