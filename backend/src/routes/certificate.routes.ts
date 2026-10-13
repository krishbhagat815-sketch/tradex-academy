import { Router, Response } from 'express';
import { CertificateModel, CourseModel, UserModel } from '../models/index.js';

const router = Router();

// Verify & View Certificate by unique code
router.get('/:code', async (req, res: Response) => {
  try {
    const { code } = req.params;

    const cert = await CertificateModel.findOne({
      certificate_code: { $regex: new RegExp(`^${code.trim()}$`, 'i') }
    }).lean();

    if (!cert) {
      res.status(404).json({ success: false, message: 'Certificate not found or invalid.' });
      return;
    }

    const course = await CourseModel.findOne({ id: cert.course_id }).lean();
    const user = await UserModel.findOne({ id: cert.user_id }).lean();

    res.json({
      success: true,
      certificate: {
        ...cert,
        course_thumbnail: course?.thumbnail || '',
        course_duration: course?.duration || '',
        student_avatar: user?.avatar || ''
      }
    });
  } catch (error: any) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify certificate.' });
  }
});

export default router;
