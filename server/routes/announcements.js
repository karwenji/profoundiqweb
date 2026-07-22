const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { requireRole } = require('../middleware/auth');
const { requireAnyPermission } = require('../middleware/permissions');

// GET /api/announcements - Get announcements for current user
router.get('/', auth, (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    const announcements = db.prepare(`
      SELECT a.*, u.name as created_by_name
      FROM announcements a
      JOIN users u ON u.id = a.created_by
      WHERE a.is_active = 1
        AND (
          a.target_roles IS NULL
          OR a.target_roles = ''
          OR a.target_roles LIKE ?
          OR a.target_course_id IN (
            SELECT course_id FROM enrollments WHERE user_id = ?
          )
        )
      ORDER BY a.created_at DESC
      LIMIT 50
    `).all(`%${userRole}%`, userId);

    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
  }
});

// POST /api/announcements - Create announcement (admin/super_admin only)
router.post('/', auth, requireRole('admin', 'super_admin'), requireAnyPermission('system_settings', 'manage_users'), (req, res) => {
  try {
    const { title, body, target_roles, target_course_id, priority } = req.body;
    const created_by = req.user.id;

    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required' });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO announcements (id, title, body, target_roles, target_course_id, priority, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, body, target_roles || null, target_course_id || null, priority || 'normal', created_by);

    const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to create announcement' });
  }
});

// GET /api/announcements/all - Get all announcements (admin/super_admin only)
router.get('/all', auth, requireRole('admin', 'super_admin'), requireAnyPermission('system_settings', 'manage_users'), (req, res) => {
  try {
    const announcements = db.prepare(`
      SELECT a.*, u.name as created_by_name
      FROM announcements a
      JOIN users u ON u.id = a.created_by
      ORDER BY a.created_at DESC
      LIMIT 100
    `).all();

    res.json({ success: true, data: announcements });
  } catch (error) {
    console.error('Error fetching all announcements:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
  }
});

// PATCH /api/announcements/:id - Update announcement (admin/super_admin only)
router.patch('/:id', auth, requireRole('admin', 'super_admin'), requireAnyPermission('system_settings', 'manage_users'), (req, res) => {
  try {
    const { title, body, target_roles, target_course_id, priority, is_active } = req.body;

    const existing = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    db.prepare(`
      UPDATE announcements
      SET title = ?, body = ?, target_roles = ?, target_course_id = ?, priority = ?, is_active = ?
      WHERE id = ?
    `).run(
      title ?? existing.title,
      body ?? existing.body,
      target_roles ?? existing.target_roles,
      target_course_id ?? existing.target_course_id,
      priority ?? existing.priority,
      is_active ?? existing.is_active,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to update announcement' });
  }
});

// DELETE /api/announcements/:id - Delete announcement (admin/super_admin only)
router.delete('/:id', auth, requireRole('admin', 'super_admin'), requireAnyPermission('system_settings', 'manage_users'), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to delete announcement' });
  }
});

module.exports = router;
