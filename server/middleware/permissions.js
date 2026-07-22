const { hasPermission } = require('../lib/roles');

function requirePermission(permissionId) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const roleId = req.user.role || 'student';
    if (!hasPermission(roleId, permissionId)) {
      return res.status(403).json({ error: 'Missing required permission', required: permissionId });
    }
    next();
  };
}

function requireAnyPermission(...permissionIds) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const roleId = req.user.role || 'student';
    const hasAny = permissionIds.some(permId => hasPermission(roleId, permId));
    if (!hasAny) {
      return res.status(403).json({ error: 'Missing required permissions', required: permissionIds });
    }
    next();
  };
}

module.exports = { requirePermission, requireAnyPermission };
