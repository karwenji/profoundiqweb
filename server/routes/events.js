const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const clients = new Set();

// GET /api/events/stream - Server-Sent Events endpoint
router.get('/stream', auth, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  clients.add({ send, userId: req.user.id });

  req.on('close', () => {
    clients.delete({ send, userId: req.user.id });
  });
});

function broadcast(event, data) {
  for (const client of clients) {
    try {
      client.send(event, data);
    } catch (e) {
      clients.delete(client);
    }
  }
}

module.exports = { router, broadcast };
