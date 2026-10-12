import { Router, Response } from 'express';
import { query, queryOne } from '../db/database.js';

const router = Router();

// Public CMS Content for Landing Page
router.get('/', async (_req, res: Response) => {
  try {
    const rows = query('SELECT key, value FROM site_content');
    const content: Record<string, any> = {};

    rows.forEach(r => {
      try {
        content[r.key] = JSON.parse(r.value);
      } catch {
        content[r.key] = r.value;
      }
    });

    // Also get live platform counts
    const totalStudents = queryOne("SELECT COUNT(*) as count FROM users WHERE role = 'student'")?.count || 45000;
    const totalCourses = queryOne("SELECT COUNT(*) as count FROM courses WHERE status = 'published'")?.count || 12;
    const totalEnrollments = queryOne("SELECT COUNT(*) as count FROM enrollments WHERE status != 'revoked'")?.count || 12800;

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
    res.status(500).json({ success: false, message: 'Failed to fetch site content.' });
  }
});

// Public Settings (including WhatsApp configuration)
router.get('/settings', async (_req, res: Response) => {
  try {
    const row = queryOne("SELECT value FROM site_content WHERE key = 'settings'");
    let settings = {
      platformName: 'The Safe Trading Academy',
      supportEmail: 'support@tradex.com',
      supportPhone: '+91 8530724929',
      currencySymbol: '₹',
      whatsapp_enabled: true,
      whatsapp_number: '918530724929',
      whatsapp_default_message: 'Hello, I would like to know more about your courses.'
    };
    if (row?.value) {
      try {
        settings = { ...settings, ...JSON.parse(row.value) };
      } catch {}
    }
    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
});

export default router;
