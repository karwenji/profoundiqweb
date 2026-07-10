// Analytics data for dashboards
// Syncs with actual system data from users and courses

import { users } from './users'
import { courses } from '@/data/courses'

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalCourses: number
  activeCourses: number
  totalRevenue: number
  monthlyRevenue: number
  totalEnrollments: number
  completionRate: number
  newStudentsThisMonth: number
  newInstructorsThisMonth: number
}

export interface SuperAdminStats extends DashboardStats {
  totalAdmins: number
  systemUptime: number
  pendingApprovals: number
}

export interface AdminStats extends DashboardStats {
  pendingCourses: number
  totalInstructors: number
  activeInstructors: number
}

export interface InstructorStats {
  totalCourses: number
  activeCourses: number
  totalStudents: number
  totalRevenue: number
  monthlyRevenue: number
  averageRating: number
  completionRate: number
}

export interface StudentStats {
  enrolledCourses: number
  completedCourses: number
  inProgressCourses: number
  certificatesEarned: number
  totalSpent: number
  learningHours: number
}

// Calculate real-time stats from actual system data
function calculateSuperAdminStats(): SuperAdminStats {
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.isActive).length
  const superAdmins = users.filter(u => u.role === 'super_admin').length
  const admins = users.filter(u => u.role === 'admin').length
  const instructors = users.filter(u => u.role === 'instructor').length
  const students = users.filter(u => u.role === 'student').length
  
  const totalCourses = courses.length
  const activeCourses = courses.filter(c => c.status !== 'draft').length
  const totalEnrollments = courses.reduce((sum, c) => sum + c.students, 0)
  
  // Calculate revenue (mock calculation based on enrollments)
  const averageCoursePrice = 5000 // NGN
  const totalRevenue = totalEnrollments * averageCoursePrice
  const monthlyRevenue = Math.round(totalRevenue * 0.15) // 15% of total as monthly
  
  return {
    totalUsers,
    activeUsers,
    totalCourses,
    activeCourses,
    totalRevenue,
    monthlyRevenue,
    totalEnrollments,
    completionRate: 67,
    newStudentsThisMonth: students,
    newInstructorsThisMonth: instructors,
    totalAdmins: superAdmins + admins,
    systemUptime: 99.9,
    pendingApprovals: courses.filter(c => c.status === 'pending').length,
  }
}

function calculateAdminStats(): AdminStats {
  const totalUsers = users.filter(u => u.role !== 'super_admin').length
  const activeUsers = users.filter(u => u.isActive && u.role !== 'super_admin').length
  const instructors = users.filter(u => u.role === 'instructor').length
  const activeInstructors = instructors // Assuming all instructors are active
  const students = users.filter(u => u.role === 'student').length
  
  const totalCourses = courses.length
  const activeCourses = courses.filter(c => c.status !== 'draft').length
  const pendingCourses = courses.filter(c => c.status === 'pending').length
  const totalEnrollments = courses.reduce((sum, c) => sum + c.students, 0)
  
  const averageCoursePrice = 5000
  const totalRevenue = totalEnrollments * averageCoursePrice
  const monthlyRevenue = Math.round(totalRevenue * 0.15)
  
  return {
    totalUsers,
    activeUsers,
    totalCourses,
    activeCourses,
    totalRevenue,
    monthlyRevenue,
    totalEnrollments,
    completionRate: 67,
    newStudentsThisMonth: students,
    newInstructorsThisMonth: instructors,
    pendingCourses,
    totalInstructors: instructors,
    activeInstructors,
  }
}

function calculateInstructorStats(instructorId?: string): InstructorStats {
  // Filter courses for specific instructor or use all courses as mock
  const instructorCourses = instructorId 
    ? courses.filter(c => c.instructorId === instructorId)
    : courses.slice(0, 3)
  
  const totalCourses = instructorCourses.length
  const activeCourses = instructorCourses.filter(c => c.status !== 'draft').length
  const totalStudents = instructorCourses.reduce((sum, c) => sum + c.students, 0)
  const averageRating = instructorCourses.length > 0
    ? parseFloat((instructorCourses.reduce((sum, c) => sum + c.rating, 0) / instructorCourses.length).toFixed(1))
    : 0
  
  const averageCoursePrice = 5000
  const totalRevenue = totalStudents * averageCoursePrice
  const monthlyRevenue = Math.round(totalRevenue * 0.15)
  
  return {
    totalCourses,
    activeCourses,
    totalStudents,
    totalRevenue,
    monthlyRevenue,
    averageRating,
    completionRate: 72,
  }
}

function calculateStudentStats(studentId?: string): StudentStats {
  // Mock student stats - in production, query enrollment data
  const enrolledCourses = 5
  const completedCourses = 2
  const inProgressCourses = enrolledCourses - completedCourses
  
  const averageCoursePrice = 5000
  const totalSpent = enrolledCourses * averageCoursePrice
  const learningHours = completedCourses * 20 + inProgressCourses * 8
  
  return {
    enrolledCourses,
    completedCourses,
    inProgressCourses,
    certificatesEarned: completedCourses,
    totalSpent,
    learningHours,
  }
}

export function getSuperAdminStats(): SuperAdminStats {
  return calculateSuperAdminStats()
}

export function getAdminStats(): AdminStats {
  return calculateAdminStats()
}

export function getInstructorStats(instructorId?: string): InstructorStats {
  return calculateInstructorStats(instructorId)
}

export function getStudentStats(studentId?: string): StudentStats {
  return calculateStudentStats(studentId)
}

export function updateSuperAdminStats(stats: Partial<SuperAdminStats>): SuperAdminStats {
  // In production, update database
  return calculateSuperAdminStats()
}

export function updateAdminStats(stats: Partial<AdminStats>): AdminStats {
  // In production, update database
  return calculateAdminStats()
}
