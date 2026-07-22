const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { requirePermission } = require('../middleware/permissions');

// GET /api/messages - Get conversations list
router.get('/', auth, (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = db.prepare(`
      SELECT 
        m.id as last_message_id,
        CASE WHEN m.sender_id = ? THEN m.recipient_id ELSE m.sender_id END as other_user_id,
        u.name as other_user_name,
        u.role as other_user_role,
        m.subject,
        m.body as last_message,
        m.created_at as last_message_at,
        m.is_read,
        (SELECT COUNT(*) FROM messages m2 
         WHERE (m2.sender_id = CASE WHEN m.sender_id = ? THEN m.recipient_id ELSE m.sender_id END)
         AND m2.recipient_id = ? AND m2.is_read = 0) as unread_count
      FROM messages m
      JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.recipient_id ELSE m.sender_id END
      WHERE m.sender_id = ? OR m.recipient_id = ?
      AND m.parent_id IS NULL
      ORDER BY m.created_at DESC
    `).all(userId, userId, userId, userId, userId, userId);

    // Deduplicate by conversation partner, keeping most recent
    const seen = new Set();
    const unique = [];
    for (const conv of conversations) {
      if (!seen.has(conv.other_user_id)) {
        seen.add(conv.other_user_id);
        unique.push(conv);
      }
    }

    res.json({ success: true, data: unique });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
});

// GET /api/messages/:userId - Get thread with specific user
router.get('/:userId', auth, (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = req.params.userId;

    const messages = db.prepare(`
      SELECT m.*, 
        s.name as sender_name, s.role as sender_role,
        r.name as recipient_name
      FROM messages m
      JOIN users s ON s.id = m.sender_id
      JOIN users r ON r.id = m.recipient_id
      WHERE (m.sender_id = ? AND m.recipient_id = ?)
         OR (m.sender_id = ? AND m.recipient_id = ?)
      ORDER BY m.created_at ASC
    `).all(myId, otherId, otherId, myId);

    // Mark received messages as read
    db.prepare(`
      UPDATE messages SET is_read = 1 
      WHERE sender_id = ? AND recipient_id = ? AND is_read = 0
    `).run(otherId, myId);

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// POST /api/messages - Send a message
router.post('/', auth, requirePermission('send_messages'), (req, res) => {
  try {
    const { recipient_id, subject, body, parent_id } = req.body;
    const sender_id = req.user.id;

    if (!recipient_id || !body) {
      return res.status(400).json({ success: false, message: 'Recipient and body are required' });
    }

    const id = uuidv4();
    const msgSubject = subject || 'New Message';

    db.prepare(`
      INSERT INTO messages (id, sender_id, recipient_id, subject, body, parent_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, sender_id, recipient_id, msgSubject, body, parent_id || null);

    // Create notification for recipient
    const notifId = uuidv4();
    const senderName = req.user.name;
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, link)
      VALUES (?, ?, 'message', ?, ?, '/dashboard/messages')
    `).run(notifId, recipient_id, `New message from ${senderName}`, body.substring(0, 100));

    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// PATCH /api/messages/:id/read - Mark message as read
router.patch('/:id/read', auth, (req, res) => {
  try {
    db.prepare('UPDATE messages SET is_read = 1 WHERE id = ? AND recipient_id = ?')
      .run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', auth, (req, res) => {
  try {
    db.prepare('DELETE FROM messages WHERE id = ? AND (sender_id = ? OR recipient_id = ?)')
      .run(req.params.id, req.user.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
});

// GET /api/messages/users - Get users by group for recipient picker
router.get('/users', auth, requirePermission('send_messages'), (req, res) => {
  try {
    const { role, course_id, search } = req.query;
    let query = 'SELECT id, name, email, role FROM users WHERE 1=1';
    const params = [];

    if (role && role !== 'all') {
      query += ' AND role = ?';
      params.push(role);
    }

    if (course_id) {
      query += ' AND id IN (SELECT user_id FROM enrollments WHERE course_id = ?)';
      params.push(course_id);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Exclude the sender
    query += ' AND id != ?';
    params.push(req.user.id);

    query += ' ORDER BY name ASC LIMIT 100';

    const users = db.prepare(query).all(...params);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// GET /api/messages/courses - Get courses for course-based group selection
router.get('/courses', auth, requireAnyPermission('send_messages', 'view_students'), (req, res) => {
  try {
    let query = 'SELECT id, title FROM courses';
    const params = [];

    // Instructors see their own courses, admins/super_admins see all
    if (req.user.role === 'instructor') {
      query += ' WHERE instructor_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY title ASC';
    const courses = db.prepare(query).all(...params);
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
});

// POST /api/messages/bulk - Send message to multiple recipients or a group
router.post('/bulk', auth, requirePermission('send_messages'), (req, res) => {
  try {
    const { recipient_ids, group_role, group_course_id, subject, body } = req.body;
    const sender_id = req.user.id;

    if (!body) {
      return res.status(400).json({ success: false, message: 'Message body is required' });
    }

    // Resolve recipients from group filters if provided
    let targets = recipient_ids || [];

    if (group_role || group_course_id) {
      let query = 'SELECT id FROM users WHERE id != ?';
      const params = [sender_id];

      if (group_role && group_role !== 'all') {
        query += ' AND role = ?';
        params.push(group_role);
      }

      if (group_course_id) {
        query += ' AND id IN (SELECT user_id FROM enrollments WHERE course_id = ?)';
        params.push(group_course_id);
      }

      const groupUsers = db.prepare(query).all(...params);
      targets = [...new Set([...targets, ...groupUsers.map(u => u.id)])];
    }

    if (targets.length === 0) {
      return res.status(400).json({ success: false, message: 'No recipients specified' });
    }

    // Permission check: only admin/super_admin can send bulk messages
    if (targets.length > 1 && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only admins can send bulk messages' });
    }

    const msgSubject = subject || 'New Message';
    const sent = [];
    const insertMsg = db.prepare(
      'INSERT INTO messages (id, sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?, ?)'
    );
    const insertNotif = db.prepare(
      'INSERT INTO notifications (id, user_id, type, title, message, link) VALUES (?, ?, \'message\', ?, ?, \'/dashboard/messages\')'
    );

    const senderName = req.user.name;

    const transaction = db.transaction(() => {
      for (const recipientId of targets) {
        const msgId = uuidv4();
        insertMsg.run(msgId, sender_id, recipientId, msgSubject, body);

        const notifId = uuidv4();
        insertNotif.run(notifId, recipientId, `New message from ${senderName}`, body.substring(0, 100));

        sent.push({ id: msgId, recipient_id: recipientId });
      }
    });

    transaction();

    res.status(201).json({
      success: true,
      data: { sent_count: sent.length, messages: sent },
    });
  } catch (error) {
    console.error('Error sending bulk message:', error);
    res.status(500).json({ success: false, message: 'Failed to send messages' });
  }
});

// GET /api/messages/unread/count - Get unread count
router.get('/unread/count', auth, (req, res) => {
  try {
    const result = db.prepare(
      'SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND is_read = 0'
    ).get(req.user.id);
    res.json({ success: true, data: { count: result.count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
  }
});

module.exports = router;
