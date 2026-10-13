import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, generateToken, AuthRequest } from '../middleware/auth.js';
import { UserModel } from '../models/index.js';

const router = Router();

// Student Registration
router.post('/register', async (req, res: Response) => {
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

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await UserModel.findOne({ email: cleanEmail });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = `usr-${uuidv4().slice(0, 8)}`;
    const now = new Date();

    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=059669,06b6d4,3b82f6`;

    const newUser = await UserModel.create({
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      password: passwordHash,
      role: 'student',
      avatar,
      headline: '',
      bio: '',
      status: 'active',
      created_at: now,
      updated_at: now
    });

    const token = generateToken({ id: userId, email: cleanEmail, role: 'student', name: name.trim() });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        headline: newUser.headline,
        bio: newUser.bio,
        status: newUser.status
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Student Login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: cleanEmail });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.password || '');
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });

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
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Admin Login
router.post('/admin-login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: cleanEmail });

    if (!user || user.role !== 'admin') {
      res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.password || '');
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: 'admin', name: user.name });

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
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error during admin login.' });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserModel.findOne({ id: req.user!.id }).select('-password').lean();

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Fetch me error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
});

// Update Profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, headline, bio, avatar } = req.body;
    const updateData: any = { updated_at: new Date() };
    if (name) updateData.name = name.trim();
    if (headline !== undefined) updateData.headline = headline;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await UserModel.findOneAndUpdate(
      { id: req.user!.id },
      updateData,
      { new: true }
    ).select('-password').lean();

    res.json({ success: true, message: 'Profile updated successfully.', user: updatedUser });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// Change Password
router.put('/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
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

    const user = await UserModel.findOne({ id: req.user!.id });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password || '');
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password does not match.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(newPassword, salt);
    user.updated_at = new Date();
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required.' });
      return;
    }

    const user = await UserModel.findOne({ email: email.trim().toLowerCase() });
    res.json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.',
      resetToken: user ? `rst_${uuidv4()}` : null
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error processing request.' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      res.status(400).json({ success: false, message: 'Email and new password are required.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);

    await UserModel.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { password: newHash, updated_at: new Date() }
    );

    res.json({ success: true, message: 'Your password has been successfully reset. You can now login.' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
});

export default router;
