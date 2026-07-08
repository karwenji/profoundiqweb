// Shared in-memory user storage for authentication and user management
// In production, replace this with a real database

export type UserRole = 'super_admin' | 'admin' | 'instructor' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
  isActive: boolean;
}

export const users: User[] = [
  // Default super admin account
  {
    id: 'sa-001',
    name: 'Stephen Mwihaki',
    email: 'superadmin@profoundiqconsulting.com',
    password: 'admin123', // In production, use hashed password
    role: 'super_admin',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  // Default admin account
  {
    id: 'ad-001',
    name: 'Admin User',
    email: 'admin@profoundiqconsulting.com',
    password: 'admin123',
    role: 'admin',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  // Default instructor account
  {
    id: 'ins-001',
    name: 'Dr. Sarah Johnson',
    email: 'sarah@profoundiqconsulting.com',
    password: 'instructor123',
    role: 'instructor',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  // Default student account
  {
    id: 'st-001',
    name: 'John Student',
    email: 'student@profoundiqconsulting.com',
    password: 'student123',
    role: 'student',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

export function findUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email);
}

export function findUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

export function createUser(user: Omit<User, 'id' | 'createdAt'>): User {
  const newUser: User = {
    ...user,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  users.push(newUser);
  return newUser;
}

export function getAllUsers(): User[] {
  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    isActive: u.isActive,
  }));
}

export function updateUserRole(userId: string, newRole: UserRole): User | undefined {
  const user = users.find(u => u.id === userId);
  if (user) {
    user.role = newRole;
  }
  return user;
}

export function deactivateUser(userId: string): boolean {
  const user = users.find(u => u.id === userId);
  if (user) {
    user.isActive = false;
    return true;
  }
  return false;
}

export function activateUser(userId: string): boolean {
  const user = users.find(u => u.id === userId);
  if (user) {
    user.isActive = true;
    return true;
  }
  return false;
}
