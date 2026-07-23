const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'routes');
const files = ['analytics.js', 'gamification.js', 'progress.js', 'curriculum.js'];
for (const f of files) {
  const full = path.join(dir, f);
  let c = fs.readFileSync(full, 'utf8');
  c = c.replace(/const authenticateToken = require\(['"]..\/middleware\/authenticateToken['"]\);/g, "const { authenticateToken } = require('../middleware/auth');");
  c = c.replace(/\bauthenticateTokenenticateToken\b/g, 'authenticateToken');
  fs.writeFileSync(full, c);
  console.log('Fixed', f);
}
