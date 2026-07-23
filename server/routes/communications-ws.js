const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { broadcast } = require('./events');

const wss = new WebSocket.Server({ noServer: true });

const clients = new Map();

function authenticateToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const token = url.searchParams.get('token');
  const decoded = authenticateToken(token);
  if (!decoded) {
    ws.close(4001, 'Unauthorized');
    return;
  }

  const session = { userId: decoded.id, subscriptions: new Set() };
  clients.set(ws, session);

  ws.on('message', (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }
    handleClientMessage(ws, session, msg);
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

function handleClientMessage(ws, session, msg) {
  switch (msg.type) {
    case 'subscribe_conversation':
      session.subscriptions.add(`conversation:${msg.conversationId}`);
      break;
    case 'unsubscribe_conversation':
      session.subscriptions.delete(`conversation:${msg.conversationId}`);
      break;
    case 'typing_start':
      broadcastToConversation(msg.conversationId, {
        type: 'user_typing',
        userId: session.userId,
        conversationId: msg.conversationId,
      }, ws);
      break;
    case 'typing_stop':
      broadcastToConversation(msg.conversationId, {
        type: 'user_stop_typing',
        userId: session.userId,
        conversationId: msg.conversationId,
      }, ws);
      break;
    default:
      break;
  }
}

function broadcastToConversation(conversationId, data, excludeWs) {
  for (const [ws, session] of clients) {
    if (session.subscriptions.has(`conversation:${conversationId}`) && ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }
}

function broadcastToUser(userId, data) {
  for (const [ws, session] of clients) {
    if (session.userId === userId && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }
}

function broadcastToAll(data) {
  for (const [ws] of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }
}

module.exports = {
  wss,
  broadcastToConversation,
  broadcastToUser,
  broadcastToAll,
};
