import { Router, Response } from 'express';
import { queryOne } from '../db/database.js';

const router = Router();

// Verify & View Certificate by unique code
router.get('/:code', async (req, res: Response) => {
  try {
    const { code } = req.params;

    const cert = queryOne(`
      SELECT 
        c.*,
        crs.thumbnail as course_thumbnail, crs.duration as course_duration,
        u.avatar as student_avatar
      FROM certificates c
      JOIN courses crs ON c.course_id = crs.id
      JOIN users u ON c.user_id = u.id
      WHERE UPPER(c.certificate_code) = UPPER(?)
    `, [code.trim()]);

    if (!cert) {
      res.status(404).json({ success: false, message: 'Certificate not found or invalid.' });
      return;
    }

    res.json({
      success: true,
      certificate: cert
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to verify certificate.' });
  }
});

export default router;
