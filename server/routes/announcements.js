const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { requireAnyPermission } = require('../middleware/permissions');

// GET /api/announcements - Get announcements for current user
router.get('/', authenticateToken, (req, res) => {
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
router.post('/', authenticateToken, requireRole('admin', 'super_admin'), requireAnyPermission('system_settings', 'manage_users'), (req, res) => {
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
    `).run(id, title, body, target_roles ? JSON.stringify(target_roles) : null, target_course_id || null, priority || 'normal', created_by);

    res.status(201).json({ success: true, data: { id } });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to create announcement' });
  }
});

// DELETE /api/announcements/:id - Delete announcement
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    db.prepare('UPDATE announcements SET is_active = 0 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete announcement' });
  }
});

module.exports = router;
