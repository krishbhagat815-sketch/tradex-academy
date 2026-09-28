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
