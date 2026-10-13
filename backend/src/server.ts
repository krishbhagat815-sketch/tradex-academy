import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { connectMongoDB, isMongoConnected } from './db/mongodb.js';

import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js';
import studentRoutes from './routes/student.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import categoryRoutes from './routes/category.routes.js';
import instructorRoutes from './routes/instructor.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import contentRoutes from './routes/content.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import popupRoutes from './routes/popup.routes.js';
import counselingRoutes from './routes/counseling.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  credentials: true
}));

// Body parser with rawBody capture for Razorpay webhook verification
app.use(express.json({
  limit: '20mb',
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static file serving for uploads
const uploadsDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health Check & Database Status
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'The Safe Trading & TradeX Academy API Server',
    database: {
      type: 'MongoDB Atlas',
      mongodb: isMongoConnected() ? 'connected (Atlas)' : 'disconnected',
      status: isMongoConnected() ? 'healthy' : 'degraded'
    }
  });
});

// Root welcome route
app.get('/', (_req, res) => {
  res.send(`
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 30px; background: #0f172a; color: #f8fafc; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.4); text-align: center;">
      <h1 style="color: #10b981; margin-bottom: 8px;">🚀 The Safe Trading API</h1>
      <p style="color: #94a3b8; font-size: 16px;">Backend server is live and running successfully!</p>
      <div style="background: #1e293b; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left;">
        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #4ade80;">Active (200 OK)</span></p>
        <p style="margin: 5px 0;"><strong>Database:</strong> <span style="color: ${isMongoConnected() ? '#4ade80' : '#ef4444'};">${isMongoConnected() ? 'MongoDB Atlas (Connected)' : 'MongoDB Atlas (Disconnected)'}</span></p>
        <p style="margin: 5px 0;"><strong>Razorpay Payments:</strong> <span style="color: #4ade80;">Integrated & Active</span></p>
        <p style="margin: 5px 0;"><strong>Health Endpoint:</strong> <a href="/api/health" style="color: #38bdf8;">/api/health</a></p>
      </div>
    </div>
  `);
});

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/popups', popupRoutes);
app.use('/api/counseling', counselingRoutes);

// Direct root endpoint support (e.g. /api/my-courses)
app.use('/api', paymentRoutes);

// Error Handling Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error.'
  });
});

async function startServer() {
  try {
    // Connect to MongoDB Atlas (sole database)
    const mongoConnected = await connectMongoDB();
    if (!mongoConnected) {
      console.warn('⚠️ Server starting with pending MongoDB connection...');
    }

    app.listen(PORT, () => {
      console.log(`🚀 The Safe Trading Backend running on http://localhost:${PORT}`);
      console.log(`🍃 Database: MongoDB Atlas (${isMongoConnected() ? 'Connected' : 'Pending'})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
