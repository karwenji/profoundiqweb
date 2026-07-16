const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all published courses
router.get('/', (req, res) => {
  try {
    const courses = db.prepare(`
      SELECT c.*, u.name as instructor_name 
      FROM courses c 
      JOIN users u ON c.instructor_id = u.id 
      WHERE c.published = 1 
      ORDER BY c.created_at DESC
    `).all();
    res.json({ success: true, data: courses });
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get single course
router.get('/:id', (req, res) => {
  try {
    const course = db.prepare(`
      SELECT c.*, u.name as instructor_name 
      FROM courses c 
      JOIN users u ON c.instructor_id = u.id 
      WHERE c.id = ?
    `).get(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ success: true, data: course });
  } catch (err) {
    console.error('Get course error:', err);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Create course (instructor/admin only)
router.post('/', authenticateToken, requireRole('instructor', 'admin', 'super_admin'), (req, res) => {
  try {
    const { title, description, price, currency, category, thumbnail } = req.body;
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO courses (id, title, description, instructor_id, price, currency, category, thumbnail)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, description || '', req.user.id, price || 0, currency || 'KES', category || '', thumbnail || '');
    
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update course
router.put('/:id', authenticateToken, requireRole('instructor', 'admin', 'super_admin'), (req, res) => {
  try {
    const { title, description, price, currency, category, thumbnail, published } = req.body;
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Instructors can only edit their own courses
    if (req.user.role === 'instructor' && course.instructor_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    db.prepare(`
      UPDATE courses SET title = ?, description = ?, price = ?, currency = ?, 
      category = ?, thumbnail = ?, published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title || course.title,
      description !== undefined ? description : course.description,
      price !== undefined ? price : course.price,
      currency || course.currency,
      category !== undefined ? category : course.category,
      thumbnail !== undefined ? thumbnail : course.thumbnail,
      published !== undefined ? published : course.published,
      req.params.id
    );
    
    const updated = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete course
router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

module.exports = router;
