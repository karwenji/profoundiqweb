export type UserRole = 'super_admin' | 'admin' | 'instructor' | 'student';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId?: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  rating: number;
  students: number;
  lessons: number;
  curriculum: Lesson[];
  features: string[];
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