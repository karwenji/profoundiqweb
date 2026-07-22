const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const { requirePermission, requireAnyPermission } = require('../middleware/permissions');
const { v4: uuidv4 } = require('uuid');

function getCourseModules(courseId) {
  return db.prepare('SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index ASC').all(courseId);
}

function getLessonsByModule(moduleId) {
  return db.prepare('SELECT * FROM lessons WHERE module_id = ? ORDER BY order_index ASC').all(moduleId);
}

function getPagesByLesson(lessonId) {
  return db.prepare('SELECT * FROM lesson_pages WHERE lesson_id = ? ORDER BY page_number ASC').all(lessonId);
}

// GET /api/courses/:id/curriculum - Full curriculum tree
router.get('/:id/curriculum', auth, (req, res) => {
  try {
    const courseId = req.params.id;
    const modules = getCourseModules(courseId);
    const modulesWithLessons = modules.map(m => ({
      ...m,
      lessons: getLessonsByModule(m.id).map(l => ({
        ...l,
        pages: getPagesByLesson(l.id)
      }))
    }));
    res.json({ success: true, data: modulesWithLessons });
  } catch (err) {
    console.error('Get curriculum error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch curriculum' });
  }
});

// POST /api/courses/:id/curriculum - Create module/lesson/page
router.post('/:id/curriculum', auth, requireAnyPermission('manage_courses', 'create_courses'), (req, res) => {
  try {
    const courseId = req.params.id;
    const { action, data, moduleId, lessonId } = req.body;

    if (action === 'create_module') {
      const id = uuidv4();
      const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM course_modules WHERE course_id = ?').get(courseId);
      db.prepare(`
        INSERT INTO course_modules (id, course_id, title, description, order_index, unlock_rule, prerequisites, is_published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, courseId, data.title, data.description || '', (maxOrder?.max || 0) + 1, data.unlockRule || 'sequential', JSON.stringify(data.prerequisites || []), data.isPublished ? 1 : 0);
      const module = db.prepare('SELECT * FROM course_modules WHERE id = ?').get(id);
      return res.status(201).json({ success: true, data: { ...module, prerequisites: JSON.parse(module.prerequisites || '[]') } });
    }

    if (action === 'create_lesson' && moduleId) {
      const id = uuidv4();
      const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM lessons WHERE module_id = ?').get(moduleId);
      db.prepare(`
        INSERT INTO lessons (id, module_id, course_id, title, description, order_index, duration_minutes, content_type, is_free, total_pages, xp_reward, quiz_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, moduleId, courseId, data.title, data.description || '', (maxOrder?.max || 0) + 1, data.durationMinutes || 10, data.contentType || 'text', data.isFree ? 1 : 0, data.totalPages || 1, data.xpReward || 20, data.quizId || null);
      const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);
      return res.status(201).json({ success: true, data: { ...lesson, is_free: !!lesson.is_free } });
    }

    if (action === 'create_page' && lessonId) {
      const id = uuidv4();
      const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(lessonId);
      if (!lesson) return res.status(404).json({ success: false, error: 'Lesson not found' });
      const pageNumber = data.pageNumber || 1;
      db.prepare(`
        INSERT INTO lesson_pages (id, lesson_id, module_id, course_id, page_number, content, content_type, media_url, min_dwell_seconds)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, lessonId, lesson.module_id, courseId, pageNumber, data.content || '', data.contentType || 'text', data.mediaUrl || null, data.minDwellSeconds || 30);
      const page = db.prepare('SELECT * FROM lesson_pages WHERE id = ?').get(id);
      return res.status(201).json({ success: true, data: page });
    }

    res.status(400).json({ success: false, error: 'Invalid action' });
  } catch (err) {
    console.error('Create curriculum item error:', err);
    res.status(500).json({ success: false, error: 'Failed to create curriculum item' });
  }
});

// PUT /api/courses/:id/curriculum - Update module/lesson/page
router.put('/:id/curriculum', auth, requireAnyPermission('manage_courses', 'edit_own_courses'), (req, res) => {
  try {
    const courseId = req.params.id;
    const { action, data, moduleId, lessonId, pageId } = req.body;

    if (action === 'update_module' && moduleId) {
      db.prepare(`
        UPDATE course_modules SET title = ?, description = ?, order_index = ?, unlock_rule = ?, prerequisites = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND course_id = ?
      `).run(data.title, data.description || '', data.order ?? 0, data.unlockRule || 'sequential', JSON.stringify(data.prerequisites || []), data.isPublished ? 1 : 0, moduleId, courseId);
      const module = db.prepare('SELECT * FROM course_modules WHERE id = ?').get(moduleId);
      return res.json({ success: true, data: { ...module, prerequisites: JSON.parse(module.prerequisites || '[]') } });
    }

    if (action === 'update_lesson' && lessonId) {
      db.prepare(`
        UPDATE lessons SET title = ?, description = ?, order_index = ?, duration_minutes = ?, content_type = ?, is_free = ?, total_pages = ?, xp_reward = ?, quiz_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND course_id = ?
      `).run(data.title, data.description || '', data.order ?? 0, data.durationMinutes ?? 10, data.contentType || 'text', data.isFree ? 1 : 0, data.totalPages || 1, data.xpReward ?? 20, data.quizId || null, lessonId, courseId);
      const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(lessonId);
      return res.json({ success: true, data: { ...lesson, is_free: !!lesson.is_free } });
    }

    if (action === 'update_page' && pageId) {
      db.prepare(`
        UPDATE lesson_pages SET content = ?, content_type = ?, media_url = ?, min_dwell_seconds = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND course_id = ?
      `).run(data.content || '', data.contentType || 'text', data.mediaUrl || null, data.minDwellSeconds ?? 30, pageId, courseId);
      const page = db.prepare('SELECT * FROM lesson_pages WHERE id = ?').get(pageId);
      return res.json({ success: true, data: page });
    }

    res.status(400).json({ success: false, error: 'Invalid action' });
  } catch (err) {
    console.error('Update curriculum item error:', err);
    res.status(500).json({ success: false, error: 'Failed to update curriculum item' });
  }
});

// DELETE /api/courses/:id/curriculum
router.delete('/:id/curriculum', auth, requireAnyPermission('manage_courses', 'edit_own_courses'), (req, res) => {
  try {
    const courseId = req.params.id;
    const { action, moduleId, lessonId, pageId } = req.body;

    if (action === 'delete_module' && moduleId) {
      db.prepare('DELETE FROM course_modules WHERE id = ? AND course_id = ?').run(moduleId, courseId);
      return res.json({ success: true });
    }

    if (action === 'delete_lesson' && lessonId) {
      db.prepare('DELETE FROM lessons WHERE id = ? AND course_id = ?').run(lessonId, courseId);
      return res.json({ success: true });
    }

    if (action === 'delete_page' && pageId) {
      db.prepare('DELETE FROM lesson_pages WHERE id = ? AND course_id = ?').run(pageId, courseId);
      return res.json({ success: true });
    }

    res.status(400).json({ success: false, error: 'Invalid action' });
  } catch (err) {
    console.error('Delete curriculum item error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete curriculum item' });
  }
});

module.exports = router;
