import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { getDb, queryOne } from './db/database.js';
import { initSchema } from './db/schema.js';
import { runSeed } from './seed/seed.js';

import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js';
import studentRoutes from './routes/student.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';
import reviewRoutes from './routes/review.routes.js';
import categoryRoutes from './routes/category.routes.js';
import instructorRoutes from './routes/instructor.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import contentRoutes from './routes/content.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static file serving for uploads
const uploadsDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TradeX Academy API Server'
  });
});

// Root welcome route
app.get('/', (_req, res) => {
  res.send(`
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 30px; background: #0f172a; color: #f8fafc; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.4); text-align: center;">
      <h1 style="color: #38bdf8; margin-bottom: 8px;">🚀 TradeX Academy API</h1>
      <p style="color: #94a3b8; font-size: 16px;">Backend server is live and running successfully on Render!</p>
      <div style="background: #1e293b; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left;">
        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #4ade80;">Active (200 OK)</span></p>
        <p style="margin: 5px 0;"><strong>Health Endpoint:</strong> <a href="/api/health" style="color: #38bdf8;">/api/health</a></p>
      </div>
      <p style="color: #64748b; font-size: 13px;">Next: Deploy the frontend static sites to connect with this API.</p>
    </div>
  `);
});

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

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
    await getDb();
    await initSchema();

    // Check if courses exist; if not, seed automatically
    const courseCount = queryOne('SELECT COUNT(*) as count FROM courses')?.count || 0;
    if (courseCount === 0) {
      console.log('No courses found in database. Auto-seeding initial data...');
      await runSeed();
    }

    app.listen(PORT, () => {
      console.log(`🚀 TradeX Academy Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
