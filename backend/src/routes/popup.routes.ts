import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, execute } from '../db/database.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { PopupModel } from '../models/index.js';
import { isMongoConnected } from '../db/mongodb.js';

const router = Router();

// ==========================================
// 1. PUBLIC POPUP ENDPOINTS
// ==========================================

// Get active popups for visitors/students
router.get('/active', async (_req, res: Response) => {
  try {
    const now = new Date().toISOString();
    const rows = query(`
      SELECT * FROM popups
      WHERE is_active = 1
        AND (start_date IS NULL OR start_date = '' OR start_date <= ?)
        AND (end_date IS NULL OR end_date = '' OR end_date >= ?)
      ORDER BY priority DESC, created_at DESC
    `, [now, now]);

    const formatted = rows.map(r => ({
      ...r,
      is_active: Boolean(r.is_active),
      trigger_value: Number(r.trigger_value || 3),
      priority: Number(r.priority || 1),
      views_count: Number(r.views_count || 0),
      clicks_count: Number(r.clicks_count || 0)
    }));

    res.json({ success: true, popups: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch active popups.' });
  }
});

// Track Impression (View)
router.post('/:id/impression', async (req, res: Response) => {
  try {
    const { id } = req.params;
    execute('UPDATE popups SET views_count = views_count + 1 WHERE id = ?', [id]);
    if (isMongoConnected()) {
      await PopupModel.findOneAndUpdate({ id }, { $inc: { views_count: 1 } }).catch(() => {});
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

// Track Click (CTA Button)
router.post('/:id/click', async (req, res: Response) => {
  try {
    const { id } = req.params;
    execute('UPDATE popups SET clicks_count = clicks_count + 1 WHERE id = ?', [id]);
    if (isMongoConnected()) {
      await PopupModel.findOneAndUpdate({ id }, { $inc: { clicks_count: 1 } }).catch(() => {});
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

// ==========================================
// 2. ADMIN POPUP MANAGEMENT ENDPOINTS
// ==========================================

// List all popups with analytics
router.get('/admin', authenticateToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const rows = query('SELECT * FROM popups ORDER BY priority DESC, created_at DESC');
    const popups = rows.map(r => {
      const views = Number(r.views_count || 0);
      const clicks = Number(r.clicks_count || 0);
      const ctr = views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0;

      return {
        ...r,
        is_active: Boolean(r.is_active),
        trigger_value: Number(r.trigger_value || 3),
        priority: Number(r.priority || 1),
        views_count: views,
        clicks_count: clicks,
        ctr: `${ctr}%`
      };
    });

    res.json({ success: true, popups });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch popups.' });
  }
});

// Create new popup
router.post('/admin', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      type = 'custom',
      image_url = '',
      cta_text = 'Learn More',
      cta_url = '/courses',
      badge_text = '',
      bg_color = '#ffffff',
      text_color = '#0f172a',
      layout = 'modal',
      animation = 'fade',
      trigger_type = 'delay',
      trigger_value = 3,
      target_page = 'all',
      target_audience = 'all',
      frequency = 'once_per_session',
      priority = 1,
      start_date = '',
      end_date = '',
      is_active = true
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Popup title is required.' });
      return;
    }

    const id = `pop-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();
    const activeInt = is_active ? 1 : 0;

    execute(`
      INSERT INTO popups (
        id, title, description, type, image_url, cta_text, cta_url, badge_text,
        bg_color, text_color, layout, animation, trigger_type, trigger_value,
        target_page, target_audience, frequency, priority, start_date, end_date,
        is_active, views_count, clicks_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
    `, [
      id, title.trim(), description || '', type, image_url || '', cta_text || 'Learn More',
      cta_url || '/courses', badge_text || '', bg_color || '#ffffff', text_color || '#0f172a',
      layout || 'modal', animation || 'fade', trigger_type || 'delay', Number(trigger_value || 3),
      target_page || 'all', target_audience || 'all', frequency || 'once_per_session',
      Number(priority || 1), start_date || '', end_date || '', activeInt, now, now
    ]);

    if (isMongoConnected()) {
      await PopupModel.create({
        id,
        title: title.trim(),
        description: description || '',
        type,
        image_url: image_url || '',
        cta_text: cta_text || 'Learn More',
        cta_url: cta_url || '/courses',
        badge_text: badge_text || '',
        bg_color: bg_color || '#ffffff',
        text_color: text_color || '#0f172a',
        layout,
        animation,
        trigger_type,
        trigger_value: Number(trigger_value || 3),
        target_page,
        target_audience,
        frequency,
        priority: Number(priority || 1),
        start_date: start_date || '',
        end_date: end_date || '',
        is_active: Boolean(is_active),
        views_count: 0,
        clicks_count: 0
      }).catch(e => console.error('Mongo popup create error:', e));
    }

    const created = queryOne('SELECT * FROM popups WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'Popup created successfully.', popup: created });
  } catch (error: any) {
    console.error('Create popup error:', error);
    res.status(500).json({ success: false, message: 'Failed to create popup.' });
  }
});

// Update popup
router.put('/admin/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = queryOne('SELECT id FROM popups WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Popup not found.' });
      return;
    }

    const {
      title,
      description,
      type,
      image_url,
      cta_text,
      cta_url,
      badge_text,
      bg_color,
      text_color,
      layout,
      animation,
      trigger_type,
      trigger_value,
      target_page,
      target_audience,
      frequency,
      priority,
      start_date,
      end_date,
      is_active
    } = req.body;

    const now = new Date().toISOString();
    const activeInt = is_active !== undefined ? (is_active ? 1 : 0) : undefined;

    execute(`
      UPDATE popups SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        type = COALESCE(?, type),
        image_url = COALESCE(?, image_url),
        cta_text = COALESCE(?, cta_text),
        cta_url = COALESCE(?, cta_url),
        badge_text = COALESCE(?, badge_text),
        bg_color = COALESCE(?, bg_color),
        text_color = COALESCE(?, text_color),
        layout = COALESCE(?, layout),
        animation = COALESCE(?, animation),
        trigger_type = COALESCE(?, trigger_type),
        trigger_value = COALESCE(?, trigger_value),
        target_page = COALESCE(?, target_page),
        target_audience = COALESCE(?, target_audience),
        frequency = COALESCE(?, frequency),
        priority = COALESCE(?, priority),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        is_active = COALESCE(?, is_active),
        updated_at = ?
      WHERE id = ?
    `, [
      title, description, type, image_url, cta_text, cta_url, badge_text,
      bg_color, text_color, layout, animation, trigger_type,
      trigger_value !== undefined ? Number(trigger_value) : null,
      target_page, target_audience, frequency,
      priority !== undefined ? Number(priority) : null,
      start_date, end_date, activeInt, now, id
    ]);

    if (isMongoConnected()) {
      const updateData: any = { updated_at: new Date() };
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (type !== undefined) updateData.type = type;
      if (image_url !== undefined) updateData.image_url = image_url;
      if (cta_text !== undefined) updateData.cta_text = cta_text;
      if (cta_url !== undefined) updateData.cta_url = cta_url;
      if (badge_text !== undefined) updateData.badge_text = badge_text;
      if (bg_color !== undefined) updateData.bg_color = bg_color;
      if (text_color !== undefined) updateData.text_color = text_color;
      if (layout !== undefined) updateData.layout = layout;
      if (animation !== undefined) updateData.animation = animation;
      if (trigger_type !== undefined) updateData.trigger_type = trigger_type;
      if (trigger_value !== undefined) updateData.trigger_value = Number(trigger_value);
      if (target_page !== undefined) updateData.target_page = target_page;
      if (target_audience !== undefined) updateData.target_audience = target_audience;
      if (frequency !== undefined) updateData.frequency = frequency;
      if (priority !== undefined) updateData.priority = Number(priority);
      if (start_date !== undefined) updateData.start_date = start_date;
      if (end_date !== undefined) updateData.end_date = end_date;
      if (is_active !== undefined) updateData.is_active = Boolean(is_active);

      await PopupModel.findOneAndUpdate({ id }, updateData).catch(e => console.error('Mongo popup update error:', e));
    }

    const updated = queryOne('SELECT * FROM popups WHERE id = ?', [id]);
    res.json({ success: true, message: 'Popup updated successfully.', popup: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update popup.' });
  }
});

// Toggle active status
router.put('/admin/:id/toggle', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = queryOne('SELECT is_active FROM popups WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Popup not found.' });
      return;
    }

    const nextActive = existing.is_active ? 0 : 1;
    execute('UPDATE popups SET is_active = ?, updated_at = ? WHERE id = ?', [nextActive, new Date().toISOString(), id]);

    if (isMongoConnected()) {
      await PopupModel.findOneAndUpdate({ id }, { is_active: Boolean(nextActive) }).catch(() => {});
    }

    res.json({ success: true, message: `Popup is now ${nextActive ? 'Active' : 'Inactive'}.`, is_active: Boolean(nextActive) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to toggle popup status.' });
  }
});

// Delete popup
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    execute('DELETE FROM popups WHERE id = ?', [id]);
    if (isMongoConnected()) {
      await PopupModel.deleteOne({ id }).catch(() => {});
    }
    res.json({ success: true, message: 'Popup deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete popup.' });
  }
});

export default router;
