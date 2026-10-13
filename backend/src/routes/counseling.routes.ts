import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { CounselingBookingModel } from '../models/index.js';

const router = Router();

// Public: Get Counseling Types & Available Time Slots
router.get('/types', (_req, res: Response) => {
  const counselingTypes = [
    {
      id: 'mentorship-1on1',
      title: '1-on-1 Trading Mentorship & Strategy Review',
      description: 'Comprehensive 60-minute deep dive into your trading style, price action setups, and entry/exit strategy with our head mentor.',
      duration: '60 Mins',
      price: 'Free Demo / Paid Package',
      recommendedFor: 'Active traders looking to become consistently profitable'
    },
    {
      id: 'risk-portfolio-audit',
      title: 'Risk Management & Portfolio Counseling',
      description: 'Review capital allocation, position sizing, risk-to-reward metrics, and drawdown management to eliminate big trading losses.',
      duration: '45 Mins',
      price: 'Mentorship',
      recommendedFor: 'Traders suffering from inconsistency, emotional trading, or large drawdowns'
    },
    {
      id: 'beginner-guidance',
      title: 'Beginner Stock Market Counseling & Roadmap',
      description: 'Personalized step-by-step guidance on Demat account setup, charting tools, market fundamentals, and which trading segment to start with.',
      duration: '45 Mins',
      price: 'Free Guidance',
      recommendedFor: 'Complete beginners starting their stock market journey in Gujarat & India'
    },
    {
      id: 'options-expiry-consult',
      title: 'Options Trading & Nifty Expiry Counseling',
      description: 'Specific consultation on option Greeks, open interest analysis, non-directional adjustment strategies, and expiry day trading.',
      duration: '60 Mins',
      price: 'Specialized',
      recommendedFor: 'Intermediate traders trading Index & Stock Options'
    },
    {
      id: 'algo-automation',
      title: 'Algo Trading & Strategy Automation Consultation',
      description: 'Consultation on converting discretionary rules into algorithmic rule-based execution, broker API bridges, and VPS deployment.',
      duration: '60 Mins',
      price: 'Technical',
      recommendedFor: 'Tech-savvy traders and busy professionals seeking automated execution'
    }
  ];

  const availableSlots = [
    '10:00 AM - 11:00 AM',
    '11:30 AM - 12:30 PM',
    '02:00 PM - 03:00 PM',
    '04:00 PM - 05:00 PM',
    '06:30 PM - 07:30 PM',
    '08:00 PM - 09:00 PM'
  ];

  res.json({
    success: true,
    counselingTypes,
    availableSlots
  });
});

// Public / Authenticated: Book a Counseling Session
router.post('/book', async (req: AuthRequest, res: Response) => {
  try {
    const {
      client_name,
      client_email,
      client_phone,
      counseling_type,
      topic,
      preferred_date,
      preferred_time_slot,
      experience_level,
      notes
    } = req.body;

    if (!client_name || !client_email || !client_phone || !counseling_type || !preferred_date || !preferred_time_slot) {
      res.status(400).json({
        success: false,
        message: 'Please provide full name, email, phone number, session type, date, and preferred time slot.'
      });
      return;
    }

    const bookingId = `bkg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const userId = req.user?.id || null;
    const now = new Date();

    const newBooking = await CounselingBookingModel.create({
      id: bookingId,
      user_id: userId,
      client_name: client_name.trim(),
      client_email: client_email.trim().toLowerCase(),
      client_phone: client_phone.trim(),
      counseling_type,
      topic: topic || '',
      preferred_date,
      preferred_time_slot,
      experience_level: experience_level || 'Beginner',
      notes: notes || '',
      status: 'pending',
      meeting_link: '',
      admin_notes: '',
      created_at: now,
      updated_at: now
    });

    res.status(201).json({
      success: true,
      message: 'Your counseling session has been successfully booked! Our mentoring team will verify the slot and send you the session link.',
      booking: newBooking
    });
  } catch (error: any) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to submit booking.'
    });
  }
});

// Authenticated Student: Get My Bookings
router.get('/my-bookings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const queryConditions: any[] = [];
    if (userId) queryConditions.push({ user_id: userId });
    if (userEmail) queryConditions.push({ client_email: userEmail.toLowerCase() });

    const bookings = await CounselingBookingModel.find(
      queryConditions.length > 0 ? { $or: queryConditions } : { user_id: userId }
    )
      .sort({ created_at: -1 })
      .lean();

    res.json({
      success: true,
      bookings
    });
  } catch (error: any) {
    console.error('Fetch student bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load bookings.'
    });
  }
});

export default router;
