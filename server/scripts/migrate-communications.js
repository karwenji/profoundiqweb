const db = require('../database');
const { v4: uuidv4 } = require('uuid');

try {
  const existing = db.prepare("SELECT COUNT(*) as count FROM conversations").get();
  if (existing.count > 0) {
    console.log('Conversations already migrated, skipping.');
    process.exit(0);
  }
} catch (e) {
  console.error('Error checking conversations table:', e.message);
}

const unthreaded = db.prepare(`
  SELECT id, sender_id, recipient_id, subject, created_at
  FROM messages
  WHERE parent_id IS NULL
  ORDER BY created_at ASC
`).all();

const conversationMap = new Map();
const insertConvo = db.prepare(`
  INSERT INTO conversations (id, type, subject, created_by, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);
const updateMsg = db.prepare(`
  UPDATE messages SET conversation_id = ? WHERE id = ?
`);

for (const row of unthreaded) {
  const key = [row.sender_id, row.recipient_id].sort().join(':');
  let convoId = conversationMap.get(key);
  if (!convoId) {
    convoId = uuidv4();
    const type = row.sender_id === row.recipient_id ? 'support' : 'direct';
    insertConvo.run(convoId, type, row.subject || 'Direct Message', row.sender_id, row.created_at, row.created_at);
    conversationMap.set(key, convoId);
  }
  updateMsg.run(convoId, row.id);
}

const allMessages = db.prepare('SELECT id, parent_id FROM messages').all();
const parentToConvo = new Map();
for (const row of allMessages) {
  if (row.parent_id) {
    const parentConvo = parentToConvo.get(row.parent_id);
    if (parentConvo) {
      parentToConvo.set(row.id, parentConvo);
      updateMsg.run(parentConvo, row.id);
    }
  }
}

const threadedMessages = db.prepare('SELECT id, parent_id FROM messages WHERE parent_id IS NOT NULL').all();
for (const row of threadedMessages) {
  const parentConvo = parentToConvo.get(row.parent_id);
  if (parentConvo && !parentConvo.has(row.id)) {
    updateMsg.run(parentConvo, row.id);
  }
}

db.prepare('UPDATE conversations SET updated_at = (SELECT MAX(created_at) FROM messages WHERE conversation_id = conversations.id)').run();

console.log(`Migrated ${unthreaded.length} threads into ${conversationMap.size} conversations.`);
process.exit(0);
