'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'
import {
  Home,
  BookOpen,
  Users,
  Settings,
  BarChart3,
  FileText,
  MessageSquare,
  CreditCard,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  GraduationCap,
  LayoutDashboard,
  TrendingUp,
  Share2,
  DollarSign,
} from 'lucide-react'
import { useState } from 'react'
import { getRolePermissions, hasPermission } from '@/lib/roles'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  permission?: string
}

const menuItemsByPermission: NavItem[] = [
  { label: 'Overview', href: '/dashboard/super-admin', icon: LayoutDashboard, permission: 'view_analytics' },
  { label: 'Analytics & Reports', href: '/dashboard/super-admin/reports', icon: BarChart3, permission: 'view_analytics' },
  { label: 'Social Media', href: '/dashboard/super-admin/social-media', icon: Share2, permission: 'system_settings' },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { label: 'User Management', href: '/dashboard/super-admin/users', icon: Users, permission: 'manage_users' },
  { label: 'Role Permissions', href: '/dashboard/super-admin/roles', icon: Shield, permission: 'manage_roles' },
  { label: 'System Settings', href: '/dashboard/super-admin/settings', icon: Settings, permission: 'system_settings' },
  { label: 'Audit Logs', href: '/dashboard/super-admin/logs', icon: FileText, permission: 'audit_logs' },
  { label: 'Manage Courses', href: '/dashboard/admin/courses', icon: BookOpen, permission: 'manage_courses' },
  { label: 'Manage Instructors', href: '/dashboard/admin/instructors', icon: Users, permission: 'manage_instructors' },
  { label: 'Student Management', href: '/dashboard/admin/students', icon: GraduationCap, permission: 'student_management' },
  { label: 'Payments', href: '/dashboard/admin/payments', icon: CreditCard, permission: 'view_reports' },
  { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings, permission: 'system_settings' },
  { label: 'My Courses', href: '/dashboard/instructor/courses', icon: BookOpen, permission: 'view_students' },
  { label: 'Create Course', href: '/dashboard/instructor/create', icon: FileText, permission: 'create_courses' },
  { label: 'Students', href: '/dashboard/instructor/students', icon: Users, permission: 'view_students' },
  { label: 'Earnings', href: '/dashboard/instructor/earnings', icon: DollarSign, permission: 'view_reports' },
  { label: 'Certificates', href: '/dashboard/certificates', icon: FileText, permission: 'download_certificates' },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard, permission: 'access_billing' },
  { label: 'Support', href: '/dashboard/support', icon: MessageSquare },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
]

function getDashboardHref(role?: string): string {
  switch (role) {
    case 'super_admin': return '/dashboard/super-admin'
    case 'admin': return '/dashboard/admin'
    case 'instructor': return '/dashboard/instructor'
    default: return '/dashboard/student'
  }
}

function getVisibleMenuItems(userRole?: string): NavItem[] {
  if (!userRole) return []
  const rolePerms = getRolePermissions(userRole)
  return menuItemsByPermission.filter(item => {
    if (!item.permission) return true
    return hasPermission(userRole, item.permission)
  })
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = getVisibleMenuItems(user?.role)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center">
            <Logo className="h-8 w-auto" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              <Logo className="h-8 w-auto" />
            </div>
            <Link href="/dashboard/profile" className="block px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors mx-2 mb-2">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </Link>
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t">
              <Button variant="outline" className="w-full" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <aside className="w-64 bg-white border-r h-screen sticky top-0 overflow-y-auto">
          <div className="p-6 border-b">
            <Link href="/" className="flex items-center">
              <Logo className="h-10 w-auto" />
            </Link>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
            <Link href="/dashboard/profile" className="block mb-4 px-4 hover:bg-gray-50 rounded-lg transition-colors">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </Link>
            <Button variant="outline" className="w-full" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Main Content */}
      <div className="lg:hidden">
        {children}
      </div>
    </div>
  )
}
