// Shared in-memory user storage for authentication and user management
// In production, replace this with a real database

export type UserRole = 'super_admin' | 'admin' | 'instructor' | 'student';

export interface User {
  id: string;
  uniqueId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
  isActive: boolean;
  phone?: string;
  bio?: string;
  avatar?: string;
}

export const users: User[] = [
  // Default super admin account
  {
    id: 'sa-001',
    uniqueId: 'PIQ-SA-001',
    name: 'Stephen Mwihaki',
    email: 'superadmin@profoundiqconsulting.com',
    password: 'admin123', // In production, use hashed password
    role: 'super_admin',
    createdAt: new Date().toISOString(),
    isActive: true,
    phone: '+254 700 000 000',
    bio: 'Platform administrator and consultant.',
  },
  // Default admin account
  {
    id: 'ad-001',
    uniqueId: 'PIQ-AD-001',
    name: 'Admin User',
    email: 'admin@profoundiqconsulting.com',
    password: 'admin123',
    role: 'admin',
    createdAt: new Date().toISOString(),
    isActive: true,
    phone: '+254 711 000 000',
    bio: 'Operations manager overseeing daily platform activities.',
  },
  // Default instructor account
  {
    id: 'ins-001',
    uniqueId: 'PIQ-INS-001',
    name: 'Dr. Sarah Johnson',
    email: 'sarah@profoundiqconsulting.com',
    password: 'instructor123',
    role: 'instructor',
    createdAt: new Date().toISOString(),
    isActive: true,
    phone: '+254 722 000 000',
    bio: 'Senior instructor with expertise in professional development and leadership training.',
  },
  // Default student account
  {
    id: 'st-001',
    uniqueId: 'PIQ-ST-001',
    name: 'John Student',
    email: 'student@profoundiqconsulting.com',
    password: 'student123',
    role: 'student',
    createdAt: new Date().toISOString(),
    isActive: true,
    phone: '+254 733 000 000',
    bio: 'Passionate learner focused on professional development and career growth.',
  },
];

export function findUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email);
}

export function findUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

function generateUniqueId(role: UserRole): string {
  const prefix = role === 'super_admin' ? 'SA' : role === 'admin' ? 'AD' : role === 'instructor' ? 'INS' : 'ST';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PIQ-${prefix}-${timestamp}${random}`;
}

export function createUser(user: Omit<User, 'id' | 'uniqueId' | 'createdAt' | 'isActive'>): User {
  const newUser: User = {
    ...user,
    id: crypto.randomUUID(),
    uniqueId: generateUniqueId(user.role),
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  users.push(newUser);
  return newUser;
}

export function getAllUsers(): Omit<User, 'password'>[] {
  return users.map(u => ({
    id: u.id,
    uniqueId: u.uniqueId,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    isActive: u.isActive,
    phone: u.phone,
    bio: u.bio,
    avatar: u.avatar,
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

export function updateUser(userId: string, updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'bio' | 'avatar' | 'password'>>): User | undefined {
  const user = users.find(u => u.id === userId);
  if (user) {
    Object.assign(user, updates);
    return { ...user };
  }
  return undefined;
}
