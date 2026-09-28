"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
const uploadsDir = path_1.default.resolve(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const uniqueName = `${Date.now()}-${(0, uuid_1.v4)().slice(0, 8)}${ext}`;
        cb(null, uniqueName);
    }
});
function formatBytes(bytes, decimals = 1) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 1024 * 1024 * 1024 } // 1 GB for videos & media
});
router.post('/', (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File is too large. Maximum size is 1GB.' });
            }
            return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
        }
        else if (err) {
            return res.status(500).json({ success: false, message: err.message || 'File upload failed.' });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({
            success: true,
            message: 'File uploaded successfully.',
            url: fileUrl,
            filename: req.file.filename,
            original_name: req.file.originalname,
            size: req.file.size,
            formatted_size: formatBytes(req.file.size),
            mimetype: req.file.mimetype
        });
    });
});
exports.default = router;
