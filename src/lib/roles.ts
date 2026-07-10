// Shared in-memory role and permission storage
// In production, replace this with a real database

export interface Permission {
  id: string
  name: string
  category: string
  description?: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  isDefault?: boolean
}

export const allPermissions: Permission[] = [
  { id: 'manage_users', name: 'Manage Users', category: 'User Management', description: 'Create, edit, and delete users' },
  { id: 'manage_roles', name: 'Manage Roles', category: 'User Management', description: 'Create and modify role permissions' },
  { id: 'system_settings', name: 'System Settings', category: 'System', description: 'Configure system-wide settings' },
  { id: 'view_analytics', name: 'View Analytics', category: 'Analytics', description: 'Access analytics dashboard' },
  { id: 'audit_logs', name: 'Audit Logs', category: 'System', description: 'View system audit logs' },
  { id: 'manage_courses', name: 'Manage Courses', category: 'Course Management', description: 'Create, edit, and delete all courses' },
  { id: 'manage_instructors', name: 'Manage Instructors', category: 'User Management', description: 'Manage instructor accounts' },
  { id: 'view_reports', name: 'View Reports', category: 'Analytics', description: 'Access reports and insights' },
  { id: 'student_management', name: 'Student Management', category: 'User Management', description: 'Manage student accounts' },
  { id: 'create_courses', name: 'Create Courses', category: 'Course Management', description: 'Create new courses' },
  { id: 'edit_own_courses', name: 'Edit Own Courses', category: 'Course Management', description: 'Edit courses they created' },
  { id: 'view_students', name: 'View Students', category: 'User Management', description: 'View student information' },
  { id: 'send_messages', name: 'Send Messages', category: 'Communication', description: 'Send messages to students' },
  { id: 'enroll_courses', name: 'Enroll in Courses', category: 'Learning', description: 'Enroll in available courses' },
  { id: 'view_progress', name: 'View Progress', category: 'Learning', description: 'Track learning progress' },
  { id: 'download_certificates', name: 'Download Certificates', category: 'Learning', description: 'Download course certificates' },
  { id: 'access_billing', name: 'Access Billing', category: 'Billing', description: 'View billing information' },
]

export const roles: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full system access and control',
    permissions: ['manage_users', 'manage_roles', 'system_settings', 'view_analytics', 'audit_logs'],
    isDefault: true,
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Course and user management',
    permissions: ['manage_courses', 'manage_instructors', 'view_reports', 'student_management'],
    isDefault: true,
  },
  {
    id: 'instructor',
    name: 'Instructor',
    description: 'Course creation and student management',
    permissions: ['create_courses', 'edit_own_courses', 'view_students', 'send_messages'],
    isDefault: true,
  },
  {
    id: 'student',
    name: 'Student',
    description: 'Learning and course enrollment',
    permissions: ['enroll_courses', 'view_progress', 'download_certificates', 'access_billing'],
    isDefault: true,
  },
]

export function getAllRoles(): Role[] {
  return roles.map(r => ({ ...r }))
}

export function getRoleById(id: string): Role | undefined {
  return roles.find(r => r.id === id)
}

export function updateRolePermissions(roleId: string, permissions: string[]): Role | undefined {
  const role = roles.find(r => r.id === roleId)
  if (role) {
    role.permissions = permissions
    return { ...role }
  }
  return undefined
}

export function createRole(role: Omit<Role, 'id'>): Role {
  const newRole: Role = {
    ...role,
    id: `role_${Date.now()}`,
    isDefault: false,
  }
  roles.push(newRole)
  return { ...newRole }
}

export function deleteRole(roleId: string): boolean {
  const roleIndex = roles.findIndex(r => r.id === roleId)
  if (roleIndex >= 0 && !roles[roleIndex].isDefault) {
    roles.splice(roleIndex, 1)
    return true
  }
  return false
}

export function getAllPermissions(): Permission[] {
  return [...allPermissions]
}

export function getPermissionsByCategory(): { [key: string]: Permission[] } {
  const grouped: { [key: string]: Permission[] } = {}
  allPermissions.forEach(perm => {
    if (!grouped[perm.category]) {
      grouped[perm.category] = []
    }
    grouped[perm.category].push(perm)
  })
  return grouped
}
