const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const messageLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req),
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictMessageLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req),
  message: { success: false, error: 'Rate limit exceeded. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { messageLimiter, strictMessageLimiter };
