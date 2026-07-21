export type UserRole = 'super_admin' | 'admin' | 'instructor' | 'student';

export interface CoursePricing {
  NGN?: number;
  KES?: number;
  USD?: number;
  EUR?: number;
  GBP?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId?: string;
  price: number; // Default price (for backwards compatibility)
  originalPrice?: number;
  pricing?: CoursePricing; // Multi-currency pricing
  image: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  rating: number;
  students: number;
  lessons: number;
  curriculum: Lesson[];
  features: string[];
  status?: 'draft' | 'published' | 'archived' | 'pending';
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isFree: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  enrolledCourses: string[];
  createdAt: string;
  phone?: string;
  bio?: string;
}

export interface CartItem {
  courseId: string;
  title: string;
  price: number;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}