"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const database_js_1 = require("../db/database.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Student Registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
            return;
        }
        const existingUser = (0, database_js_1.queryOne)('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
        if (existingUser) {
            res.status(400).json({ success: false, message: 'An account with this email already exists.' });
            return;
        }
        const salt = bcryptjs_1.default.genSaltSync(10);
        const passwordHash = bcryptjs_1.default.hashSync(password, salt);
        const userId = `usr-${(0, uuid_1.v4)().slice(0, 8)}`;
        const now = new Date().toISOString();
        const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=059669,06b6d4,3b82f6`;
        (0, database_js_1.execute)(`
      INSERT INTO users (id, name, email, password, role, avatar, headline, bio, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'student', ?, '', '', 'active', ?, ?)
    `, [userId, name.trim(), email.trim().toLowerCase(), passwordHash, avatar, now, now]);
        const token = (0, auth_js_1.generateToken)({ id: userId, email: email.trim().toLowerCase(), role: 'student', name: name.trim() });
        res.status(201).json({
            success: true,
            message: 'Account registered successfully.',
            token,
            user: {
                id: userId,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                role: 'student',
                avatar,
                headline: '',
                bio: '',
                status: 'active'
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});
// Student Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required.' });
            return;
        }
        const user = (0, database_js_1.queryOne)(`
      SELECT id, name, email, password, role, avatar, headline, bio, status
      FROM users WHERE LOWER(email) = LOWER(?)
    `, [email.trim()]);
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
            return;
        }
        if (user.status === 'suspended') {
            res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
            return;
        }
        const isMatch = bcryptjs_1.default.compareSync(password, user.password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
            return;
        }
        const token = (0, auth_js_1.generateToken)({ id: user.id, email: user.email, role: user.role, name: user.name });
        res.json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                headline: user.headline,
                bio: user.bio,
                status: user.status
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});
// Admin Login
router.post('/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required.' });
            return;
        }
        const user = (0, database_js_1.queryOne)(`
      SELECT id, name, email, password, role, avatar, headline, bio, status
      FROM users WHERE LOWER(email) = LOWER(?)
    `, [email.trim()]);
        if (!user || user.role !== 'admin') {
            res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
            return;
        }
        const isMatch = bcryptjs_1.default.compareSync(password, user.password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
            return;
        }
        const token = (0, auth_js_1.generateToken)({ id: user.id, email: user.email, role: 'admin', name: user.name });
        res.json({
            success: true,
            message: 'Admin authentication successful.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    }
    catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Server error during admin login.' });
    }
});
// Get Current User Profile
router.get('/me', auth_js_1.authenticateToken, async (req, res) => {
    try {
        const user = (0, database_js_1.queryOne)(`
      SELECT id, name, email, role, avatar, headline, bio, status, created_at
      FROM users WHERE id = ?
    `, [req.user.id]);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        res.json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
    }
});
// Update Profile
router.put('/profile', auth_js_1.authenticateToken, async (req, res) => {
    try {
        const { name, headline, bio, avatar } = req.body;
        const now = new Date().toISOString();
        (0, database_js_1.execute)(`
      UPDATE users 
      SET name = COALESCE(?, name),
          headline = COALESCE(?, headline),
          bio = COALESCE(?, bio),
          avatar = COALESCE(?, avatar),
          updated_at = ?
      WHERE id = ?
    `, [name, headline, bio, avatar, now, req.user.id]);
        const updatedUser = (0, database_js_1.queryOne)(`
      SELECT id, name, email, role, avatar, headline, bio, status, created_at
      FROM users WHERE id = ?
    `, [req.user.id]);
        res.json({ success: true, message: 'Profile updated successfully.', user: updatedUser });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
});
// Change Password
router.put('/change-password', auth_js_1.authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ success: false, message: 'Current password and new password are required.' });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
            return;
        }
        const user = (0, database_js_1.queryOne)('SELECT password FROM users WHERE id = ?', [req.user.id]);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        const isMatch = bcryptjs_1.default.compareSync(currentPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ success: false, message: 'Current password does not match.' });
            return;
        }
        const salt = bcryptjs_1.default.genSaltSync(10);
        const newHash = bcryptjs_1.default.hashSync(newPassword, salt);
        const now = new Date().toISOString();
        (0, database_js_1.execute)('UPDATE users SET password = ?, updated_at = ? WHERE id = ?', [newHash, now, req.user.id]);
        res.json({ success: true, message: 'Password updated successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update password.' });
    }
});
// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: 'Email is required.' });
            return;
        }
        const user = (0, database_js_1.queryOne)('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
        // Always return success for privacy
        res.json({
            success: true,
            message: 'If an account exists with this email, password reset instructions have been sent.',
            resetToken: user ? `rst_${(0, uuid_1.v4)()}` : null
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error processing request.' });
    }
});
// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            res.status(400).json({ success: false, message: 'Email and new password are required.' });
            return;
        }
        const salt = bcryptjs_1.default.genSaltSync(10);
        const newHash = bcryptjs_1.default.hashSync(newPassword, salt);
        const now = new Date().toISOString();
        (0, database_js_1.execute)('UPDATE users SET password = ?, updated_at = ? WHERE LOWER(email) = LOWER(?)', [newHash, now, email.trim()]);
        res.json({ success: true, message: 'Your password has been successfully reset. You can now login.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to reset password.' });
    }
});
exports.default = router;
