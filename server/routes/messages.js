const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { requirePermission, requireAnyPermission } = require('../middleware/permissions');
const { broadcastToUser, broadcastToConversation } = require('./communications-ws');
const { broadcast } = require('./events');

// GET /api/messages - Get conversations list
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = db.prepare(`
      SELECT 
        c.id,
        c.type,
        c.subject,
        c.created_by,
        c.created_at,
        c.updated_at,
        (
          SELECT u.name FROM users u 
          WHERE u.id = COALESCE(
            (SELECT m2.sender_id FROM messages m2 WHERE m2.conversation_id = c.id AND m2.sender_id != ? ORDER BY m2.created_at ASC LIMIT 1),
            c.created_by
          )
        ) as other_user_name,
        (
          SELECT u.role FROM users u 
          WHERE u.id = COALESCE(
            (SELECT m2.sender_id FROM messages m2 WHERE m2.conversation_id = c.id AND m2.sender_id != ? ORDER BY m2.created_at ASC LIMIT 1),
            c.created_by
          )
        ) as other_user_role,
        (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
        (SELECT COUNT(*) FROM messages m2 
         WHERE m2.conversation_id = c.id 
         AND m2.sender_id != ? 
         AND m2.is_read = 0
         AND m2.deleted_at IS NULL) as unread_count
      FROM conversations c
      WHERE c.created_by = ? OR ? IN (
        SELECT sender_id FROM messages WHERE conversation_id = c.id
        UNION
        SELECT recipient_id FROM messages WHERE conversation_id = c.id
      )
      ORDER BY c.updated_at DESC
    `).all(userId, userId, userId, userId, userId);

    res.json({ success: true, data: conversations || [] });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
});

// GET /api/messages/thread/:conversationId - Get thread by conversation
router.get('/thread/:conversationId', authenticateToken, (req, res) => {
  try {
    const { conversationId } = req.params;
    const myId = req.user.id;

    const convo = db.prepare('SELECT created_by, type FROM conversations WHERE id = ?').get(conversationId);
    if (!convo) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const isParticipant = convo.type === 'direct'
      ? true
      : db.prepare(`
          SELECT 1 FROM messages 
          WHERE conversation_id = ? AND (sender_id = ? OR recipient_id = ?) 
          LIMIT 1
        `).get(conversationId, myId, myId);

    if (!isParticipant && convo.created_by !== myId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messages = db.prepare(`
      SELECT m.*, 
        s.name as sender_name, s.role as sender_role,
        r.name as recipient_name
      FROM messages m
      JOIN users s ON s.id = m.sender_id
      JOIN users r ON r.id = m.recipient_id
      WHERE m.conversation_id = ? AND m.deleted_at IS NULL
      ORDER BY m.created_at ASC
    `).all(conversationId);

    db.prepare(`
      UPDATE messages SET is_read = 1 
      WHERE conversation_id = ? AND sender_id != ? AND is_read = 0
    `).run(conversationId, myId);

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// GET /api/messages/:userId - Get thread with specific user (legacy)
router.get('/:userId', authenticateToken, (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = req.params.userId;

    const conversation = db.prepare(`
      SELECT id FROM conversations 
      WHERE created_by = ? AND type = 'direct' 
      AND id IN (
        SELECT conversation_id FROM messages WHERE sender_id = ? AND recipient_id = ?
        UNION
        SELECT conversation_id FROM messages WHERE sender_id = ? AND recipient_id = ?
      )
      LIMIT 1
    `).get(myId, myId, otherId, otherId, myId);

    if (conversation) {
      req.params.conversationId = conversation.id;
      return router.handle(req, res, () => {});
    }

    const messages = db.prepare(`
      SELECT m.*, 
        s.name as sender_name, s.role as sender_role,
        r.name as recipient_name
      FROM messages m
      JOIN users s ON s.id = m.sender_id
      JOIN users r ON r.id = m.recipient_id
      WHERE ((m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?))
        AND m.deleted_at IS NULL
      ORDER BY m.created_at ASC
    `).all(myId, otherId, otherId, myId);

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
router.post('/', authenticateToken, requirePermission('send_messages'), (req, res) => {
  try {
    const { conversation_id, recipient_id, recipient_ids, group_role, group_course_id, subject, body } = req.body;
    const sender_id = req.user.id;

    if (!body || (!conversation_id && !recipient_id && !recipient_ids && !group_role && !group_course_id)) {
      return res.status(400).json({ success: false, message: 'Message body and at least one recipient are required' });
    }

    let targets = [];
    let convoId = conversation_id;

    if (!convoId) {
      if (recipient_id) {
        targets.push(recipient_id);
      } else if (recipient_ids && recipient_ids.length > 0) {
        targets = [...recipient_ids];
      } else if (group_role) {
        const groupUsers = db.prepare('SELECT id FROM users WHERE role = ? AND id != ?').all(group_role, sender_id);
        targets = groupUsers.map((u) => u.id);
      } else if (group_course_id) {
        const enrolled = db.prepare('SELECT user_id FROM enrollments WHERE course_id = ? AND user_id != ?').all(group_course_id, sender_id);
        targets = enrolled.map((e) => e.user_id);
      }

      if (targets.length === 0) {
        return res.status(400).json({ success: false, message: 'No recipients specified' });
      }

      const type = group_role || group_course_id ? 'group' : 'direct';
      convoId = uuidv4();
      db.prepare(`
        INSERT INTO conversations (id, type, subject, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(convoId, type, subject || 'New Message', sender_id, new Date().toISOString(), new Date().toISOString());
    }

    const senderName = req.user.name;
    const tx = db.transaction(() => {
      const msgId = uuidv4();
      const firstTarget = targets[0] || recipient_id || sender_id;
      db.prepare(`
        INSERT INTO messages (id, conversation_id, sender_id, recipient_id, subject, body, status)
        VALUES (?, ?, ?, ?, ?, ?, 'sent')
      `).run(msgId, convoId, sender_id, firstTarget, subject || 'New Message', body);

      db.prepare(`
        UPDATE conversations SET updated_at = ? WHERE id = ?
      `).run(new Date().toISOString(), convoId);

      for (const rid of targets) {
        const notifId = uuidv4();
        db.prepare(`
          INSERT INTO notifications (id, user_id, type, title, message, link, category)
          VALUES (?, ?, 'message', ?, ?, '/dashboard/messages', 'messages')
        `).run(notifId, rid, `New message from ${senderName}`, body.substring(0, 100));
      }

      return db.prepare('SELECT * FROM messages WHERE id = ?').get(msgId);
    });

    const message = tx();

    for (const rid of targets) {
      broadcastToUser(rid, { type: 'new_message', data: message });
    }
    broadcast('new_message', message);
    broadcastToConversation(convoId, { type: 'new_message', data: message });

    res.status(201).json({ success: true, data: message, conversation: { id: convoId } });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// POST /api/messages/bulk - Send bulk message
router.post('/bulk', authenticateToken, requirePermission('send_messages'), (req, res) => {
  try {
    const { recipient_ids, group_role, group_course_id, subject, body } = req.body;
    const sender_id = req.user.id;

    if (!body) {
      return res.status(400).json({ success: false, message: 'Message body is required' });
    }

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
      targets = [...new Set([...targets, ...groupUsers.map((u) => u.id)])];
    }

    if (targets.length === 0) {
      return res.status(400).json({ success: false, message: 'No recipients specified' });
    }

    if (targets.length > 1 && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only admins can send bulk messages' });
    }

    const convoId = uuidv4();
    const type = group_role || group_course_id ? 'group' : 'direct';
    db.prepare(`
      INSERT INTO conversations (id, type, subject, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(convoId, type, subject || 'New Message', sender_id, new Date().toISOString(), new Date().toISOString());

    const msgSubject = subject || 'New Message';
    const senderName = req.user.name;

    const tx = db.transaction(() => {
      const sent = [];
      for (const recipientId of targets) {
        const msgId = uuidv4();
        db.prepare(`
          INSERT INTO messages (id, conversation_id, sender_id, recipient_id, subject, body, status)
          VALUES (?, ?, ?, ?, ?, ?, 'sent')
        `).run(msgId, convoId, sender_id, recipientId, msgSubject, body);

        const notifId = uuidv4();
        db.prepare(`
          INSERT INTO notifications (id, user_id, type, title, message, link, category)
          VALUES (?, ?, 'message', ?, ?, '/dashboard/messages', 'messages')
        `).run(notifId, recipientId, `New message from ${senderName}`, body.substring(0, 100));

        sent.push({ id: msgId, recipient_id: recipientId });
      }
      return sent;
    });

    const sent = tx();

    for (const rid of targets) {
      broadcastToUser(rid, { type: 'new_message', data: { conversation_id: convoId } });
    }
    broadcast('new_message', { conversation_id: convoId });
    broadcastToConversation(convoId, { type: 'new_message', data: { conversation_id: convoId } });

    res.status(201).json({
      success: true,
      data: { sent_count: sent.length, messages: sent, conversation: { id: convoId } },
    });
  } catch (error) {
    console.error('Error sending bulk message:', error);
    res.status(500).json({ success: false, message: 'Failed to send messages' });
  }
});

// PATCH /api/messages/:id/read - Mark message as read
router.patch('/:id/read', authenticateToken, (req, res) => {
  try {
    db.prepare('UPDATE messages SET is_read = 1 WHERE id = ? AND recipient_id = ?')
      .run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

// PATCH /api/messages/:id/delivered - Mark message as delivered
router.patch('/:id/delivered', authenticateToken, (req, res) => {
  try {
    db.prepare(`UPDATE messages SET status = 'delivered' WHERE id = ? AND recipient_id = ?`)
      .run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark as delivered' });
  }
});

// DELETE /api/messages/:id - Soft-delete a message
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    db.prepare(`UPDATE messages SET deleted_at = ?, deleted_by = ? WHERE id = ? AND (sender_id = ? OR recipient_id = ?)`)
      .run(new Date().toISOString(), req.user.id, req.params.id, req.user.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
});

// GET /api/messages/search - Full-text search
router.get('/search', authenticateToken, (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });
    const results = db.prepare(`
      SELECT m.*, s.name as sender_name, r.name as recipient_name, c.type as conversation_type
      FROM messages_fts fts
      JOIN messages m ON m.rowid = fts.rowid
      JOIN users s ON s.id = m.sender_id
      JOIN users r ON r.id = m.recipient_id
      JOIN conversations c ON c.id = m.conversation_id
      WHERE (fts.body MATCH ? OR fts.subject MATCH ?)
        AND (m.sender_id = ? OR m.recipient_id = ?)
        AND m.deleted_at IS NULL
      ORDER BY m.created_at DESC
      LIMIT 50
    `).all(q, q, req.user.id, req.user.id);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to search messages' });
  }
});

// GET /api/messages/users - Get users by group for recipient picker
router.get('/users', authenticateToken, requirePermission('send_messages'), (req, res) => {
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
router.get('/courses', authenticateToken, requireAnyPermission('send_messages', 'view_students'), (req, res) => {
  try {
    let query = 'SELECT id, title FROM courses';
    const params = [];

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

// GET /api/messages/unread/count - Get unread count
router.get('/unread/count', authenticateToken, (req, res) => {
  try {
    const result = db.prepare(
      'SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND is_read = 0 AND deleted_at IS NULL'
    ).get(req.user.id);
    res.json({ success: true, data: { count: result.count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
  }
});

module.exports = router;
