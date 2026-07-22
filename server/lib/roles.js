const permissions = [
  { id: 'manage_users', name: 'Manage Users', category: 'User Management' },
  { id: 'manage_roles', name: 'Manage Roles', category: 'User Management' },
  { id: 'system_settings', name: 'System Settings', category: 'System' },
  { id: 'view_analytics', name: 'View Analytics', category: 'Analytics' },
  { id: 'audit_logs', name: 'Audit Logs', category: 'System' },
  { id: 'manage_courses', name: 'Manage Courses', category: 'Course Management' },
  { id: 'manage_instructors', name: 'Manage Instructors', category: 'User Management' },
  { id: 'view_reports', name: 'View Reports', category: 'Analytics' },
  { id: 'student_management', name: 'Student Management', category: 'User Management' },
  { id: 'create_courses', name: 'Create Courses', category: 'Course Management' },
  { id: 'edit_own_courses', name: 'Edit Own Courses', category: 'Course Management' },
  { id: 'view_students', name: 'View Students', category: 'User Management' },
  { id: 'send_messages', name: 'Send Messages', category: 'Communication' },
  { id: 'enroll_courses', name: 'Enroll in Courses', category: 'Learning' },
  { id: 'view_progress', name: 'View Progress', category: 'Learning' },
  { id: 'download_certificates', name: 'Download Certificates', category: 'Learning' },
  { id: 'access_billing', name: 'Access Billing', category: 'Billing' },
];

const roles = {
  super_admin: ['manage_users', 'manage_roles', 'system_settings', 'view_analytics', 'audit_logs'],
  admin: ['manage_courses', 'manage_instructors', 'view_reports', 'student_management'],
  instructor: ['create_courses', 'edit_own_courses', 'view_students', 'send_messages'],
  student: ['enroll_courses', 'view_progress', 'download_certificates', 'access_billing'],
};

function getRolePermissions(roleId) {
  return roles[roleId] ? [...roles[roleId]] : [];
}

function hasPermission(roleId, permissionId) {
  return getRolePermissions(roleId).includes(permissionId);
}

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

module.exports = {
  permissions,
  roles,
  getRolePermissions,
  hasPermission,
  requirePermission,
  requireAnyPermission,
};
