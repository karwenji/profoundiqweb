const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?'
    ).get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let hashedPassword = user.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    db.prepare(
      'UPDATE users SET name = ?, email = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(name || user.name, email || user.email, hashedPassword, req.user.id);

    const updated = db.prepare(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const users = db.prepare(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    ).all();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role (super_admin only)
router.put('/:id/role', authenticateToken, requireRole('super_admin'), (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['student', 'instructor', 'admin', 'super_admin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const result = db.prepare(
      'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(role, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = db.prepare(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?'
    ).get(req.params.id);

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete user (super_admin only)
router.delete('/:id', authenticateToken, requireRole('super_admin'), (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
