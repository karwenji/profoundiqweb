const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

const clients = new Set();

router.get('/stream', authenticateToken, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const client = { send: sendEvent, userId: req.user.id };
  clients.add(client);

  req.on('close', () => {
    clients.delete(client);
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

