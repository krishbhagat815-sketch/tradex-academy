"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_js_1 = require("./db/database.js");
const schema_js_1 = require("./db/schema.js");
const seed_js_1 = require("./seed/seed.js");
const mongodb_js_1 = require("./db/mongodb.js");
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const course_routes_js_1 = __importDefault(require("./routes/course.routes.js"));
const student_routes_js_1 = __importDefault(require("./routes/student.routes.js"));
const checkout_routes_js_1 = __importDefault(require("./routes/checkout.routes.js"));
const payment_routes_js_1 = __importDefault(require("./routes/payment.routes.js"));
const review_routes_js_1 = __importDefault(require("./routes/review.routes.js"));
const category_routes_js_1 = __importDefault(require("./routes/category.routes.js"));
const instructor_routes_js_1 = __importDefault(require("./routes/instructor.routes.js"));
const certificate_routes_js_1 = __importDefault(require("./routes/certificate.routes.js"));
const content_routes_js_1 = __importDefault(require("./routes/content.routes.js"));
const admin_routes_js_1 = __importDefault(require("./routes/admin.routes.js"));
const upload_routes_js_1 = __importDefault(require("./routes/upload.routes.js"));
const popup_routes_js_1 = __importDefault(require("./routes/popup.routes.js"));
const counseling_routes_js_1 = __importDefault(require("./routes/counseling.routes.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
}));
// Body parser with rawBody capture for Razorpay webhook verification
app.use(express_1.default.json({
    limit: '20mb',
    verify: (req, _res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use(express_1.default.urlencoded({ extended: true, limit: '20mb' }));
// Static file serving for uploads
const uploadsDir = path_1.default.resolve(process.cwd(), 'uploads');
app.use('/uploads', express_1.default.static(uploadsDir));
// Health Check & Database Status
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'The Safe Trading & TradeX Academy API Server',
        database: {
            sqlite: 'active',
            mongodb: (0, mongodb_js_1.isMongoConnected)() ? 'connected (Atlas)' : 'disconnected / fallback'
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
        <p style="margin: 5px 0;"><strong>MongoDB Atlas:</strong> <span style="color: ${(0, mongodb_js_1.isMongoConnected)() ? '#4ade80' : '#f59e0b'};">${(0, mongodb_js_1.isMongoConnected)() ? 'Connected' : 'Fallback / Not configured'}</span></p>
        <p style="margin: 5px 0;"><strong>Razorpay Payments:</strong> <span style="color: #4ade80;">Integrated & Active</span></p>
        <p style="margin: 5px 0;"><strong>Health Endpoint:</strong> <a href="/api/health" style="color: #38bdf8;">/api/health</a></p>
      </div>
    </div>
  `);
});
// Route registration
app.use('/api/auth', auth_routes_js_1.default);
app.use('/api/courses', course_routes_js_1.default);
app.use('/api/student', student_routes_js_1.default);
app.use('/api/payments', payment_routes_js_1.default);
app.use('/api/checkout', checkout_routes_js_1.default);
app.use('/api/reviews', review_routes_js_1.default);
app.use('/api/categories', category_routes_js_1.default);
app.use('/api/instructors', instructor_routes_js_1.default);
app.use('/api/certificates', certificate_routes_js_1.default);
app.use('/api/content', content_routes_js_1.default);
app.use('/api/admin', admin_routes_js_1.default);
app.use('/api/upload', upload_routes_js_1.default);
app.use('/api/popups', popup_routes_js_1.default);
app.use('/api/counseling', counseling_routes_js_1.default);
// Direct root endpoint support (e.g. /api/my-courses)
app.use('/api', payment_routes_js_1.default);
// Error Handling Middleware
app.use((err, _req, res, _next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error.'
    });
});
async function startServer() {
    try {
        // 1. Initialize SQLite storage
        await (0, database_js_1.getDb)();
        await (0, schema_js_1.initSchema)();
        // 2. Connect to MongoDB Atlas (if MONGODB_URI is provided)
        await (0, mongodb_js_1.connectMongoDB)();
        // Check if initial Gujarati trading courses exist; if not, seed automatically
        const gujjuCourse = (0, database_js_1.queryOne)("SELECT id FROM courses WHERE slug = 'stock-market-basics-for-beginners-gujarati'");
        if (!gujjuCourse) {
            console.log('Gujarati Trading courses not found in database. Auto-seeding initial data...');
            await (0, seed_js_1.runSeed)();
        }
        app.listen(PORT, () => {
            console.log(`🚀 The Safe Trading Backend running on http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
startServer();
