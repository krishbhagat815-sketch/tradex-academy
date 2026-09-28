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
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const course_routes_js_1 = __importDefault(require("./routes/course.routes.js"));
const student_routes_js_1 = __importDefault(require("./routes/student.routes.js"));
const checkout_routes_js_1 = __importDefault(require("./routes/checkout.routes.js"));
const review_routes_js_1 = __importDefault(require("./routes/review.routes.js"));
const category_routes_js_1 = __importDefault(require("./routes/category.routes.js"));
const instructor_routes_js_1 = __importDefault(require("./routes/instructor.routes.js"));
const certificate_routes_js_1 = __importDefault(require("./routes/certificate.routes.js"));
const content_routes_js_1 = __importDefault(require("./routes/content.routes.js"));
const admin_routes_js_1 = __importDefault(require("./routes/admin.routes.js"));
const upload_routes_js_1 = __importDefault(require("./routes/upload.routes.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
}));
app.use(express_1.default.json({ limit: '20mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '20mb' }));
// Static file serving for uploads
const uploadsDir = path_1.default.resolve(process.cwd(), 'uploads');
app.use('/uploads', express_1.default.static(uploadsDir));
// Health Check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'TradeX Academy API Server'
    });
});
// Route registration
app.use('/api/auth', auth_routes_js_1.default);
app.use('/api/courses', course_routes_js_1.default);
app.use('/api/student', student_routes_js_1.default);
app.use('/api/checkout', checkout_routes_js_1.default);
app.use('/api/reviews', review_routes_js_1.default);
app.use('/api/categories', category_routes_js_1.default);
app.use('/api/instructors', instructor_routes_js_1.default);
app.use('/api/certificates', certificate_routes_js_1.default);
app.use('/api/content', content_routes_js_1.default);
app.use('/api/admin', admin_routes_js_1.default);
app.use('/api/upload', upload_routes_js_1.default);
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
        await (0, database_js_1.getDb)();
        await (0, schema_js_1.initSchema)();
        // Check if courses exist; if not, seed automatically
        const courseCount = (0, database_js_1.queryOne)('SELECT COUNT(*) as count FROM courses')?.count || 0;
        if (courseCount === 0) {
            console.log('No courses found in database. Auto-seeding initial data...');
            await (0, seed_js_1.runSeed)();
        }
        app.listen(PORT, () => {
            console.log(`🚀 TradeX Academy Backend running on http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
startServer();
