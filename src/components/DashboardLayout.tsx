'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'
import {
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
  ChevronDown,
  ChevronRight,
  Share2,
  DollarSign,
} from 'lucide-react'
import { useState, useMemo, ReactNode } from 'react'
import { getRolePermissions, hasPermission } from '@/lib/roles'

interface NavItem {
  label: string
  href: string
  permission?: string
  subItems?: NavItem[]
}

interface NavGroup {
  label: string
  icon: ReactNode
  items: NavItem[]
}

function filterByPermission(items: NavItem[], userRole?: string): NavItem[] {
  if (!userRole) return []
  return items.filter((item) => {
    if (!item.permission) return true
    return hasPermission(userRole, item.permission)
  })
}

const navGroups: NavGroup[] = [
  {
    label: 'Monitoring & Logs',
    icon: <BarChart3 className="h-5 w-5" />,
    items: [
      { label: 'Overview', href: '/dashboard/super-admin', permission: 'view_analytics' },
      { label: 'Analytics & Reports', href: '/dashboard/super-admin/reports', permission: 'view_analytics' },
      { label: 'Audit Logs', href: '/dashboard/super-admin/logs', permission: 'audit_logs' },
    ],
  },
  {
    label: 'Platform Management',
    icon: <Users className="h-5 w-5" />,
    items: [
      { label: 'User Management', href: '/dashboard/super-admin/users', permission: 'manage_users' },
      { label: 'Role Permissions', href: '/dashboard/super-admin/roles', permission: 'manage_roles' },
      { label: 'Social Media', href: '/dashboard/super-admin/social-media', permission: 'system_settings' },
    ],
  },
  {
    label: 'Messages',
    icon: <MessageSquare className="h-5 w-5" />,
    items: [
      { label: 'Messages', href: '/dashboard/messages' },
    ],
  },
  {
    label: 'Course & Learner Management',
    icon: <BookOpen className="h-5 w-5" />,
    items: [
      { label: 'Manage Courses', href: '/dashboard/admin/courses', permission: 'manage_courses' },
      { label: 'Manage Instructors', href: '/dashboard/admin/instructors', permission: 'manage_instructors' },
      { label: 'Student Management', href: '/dashboard/admin/students', permission: 'student_management' },
      { label: 'Payments', href: '/dashboard/admin/payments', permission: 'view_reports' },
    ],
  },
  {
    label: 'Course Creation',
    icon: <FileText className="h-5 w-5" />,
    items: [
      { label: 'My Courses', href: '/dashboard/instructor/courses', permission: 'view_students' },
      { label: 'Create Course', href: '/dashboard/instructor/create', permission: 'create_courses' },
      { label: 'Students', href: '/dashboard/instructor/students', permission: 'view_students' },
    ],
  },
  {
    label: 'Earnings & Reports',
    icon: <DollarSign className="h-5 w-5" />,
    items: [
      { label: 'Earnings', href: '/dashboard/instructor/earnings', permission: 'view_reports' },
      { label: 'Reports', href: '/dashboard/admin/payments', permission: 'view_reports' },
    ],
  },
  {
    label: 'Certificates & Billing',
    icon: <CreditCard className="h-5 w-5" />,
    items: [
      { label: 'Certificates', href: '/dashboard/certificates', permission: 'download_certificates' },
      { label: 'Billing', href: '/dashboard/billing', permission: 'access_billing' },
    ],
  },
  {
    label: 'System Settings',
    icon: <Settings className="h-5 w-5" />,
    items: [
      { label: 'Super Admin', href: '/dashboard/super-admin/settings', permission: 'system_settings', subItems: [
        { label: 'General', href: '/dashboard/super-admin/settings/general' },
        { label: 'Payments', href: '/dashboard/super-admin/settings/payments' },
        { label: 'Webhooks', href: '/dashboard/super-admin/settings/webhooks' },
      ]},
      { label: 'Admin', href: '/dashboard/admin/settings', permission: 'system_settings', subItems: [
        { label: 'General', href: '/dashboard/admin/settings/general' },
        { label: 'Payments', href: '/dashboard/admin/settings/payments' },
        { label: 'Webhooks', href: '/dashboard/admin/settings/webhooks' },
      ]},
    ],
  },
  {
    label: 'Account',
    icon: <User className="h-5 w-5" />,
    items: [
      { label: 'Profile', href: '/dashboard/profile' },
      { label: 'Support', href: '/dashboard/support' },
    ],
  },
]

interface NavGroupItemProps {
  group: NavGroup
  pathname: string
  expandedGroups: Set<string>
  toggleGroup: (label: string) => void
  onNavigate?: () => void
}

function isGroupActive(items: NavItem[], pathname: string): boolean {
  return items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  )
}

function NavGroupItem({ group, pathname, expandedGroups, toggleGroup, onNavigate }: NavGroupItemProps) {
  const visibleItems = useMemo(
    () => filterByPermission(group.items, undefined),
    [group.items],
  )

  if (visibleItems.length === 0) return null

  const groupActive = isGroupActive(visibleItems, pathname)
  const [isExpanded, setExpanded] = useState(() => expandedGroups.has(group.label) || groupActive)

  const handleToggle = () => {
    setExpanded(!isExpanded)
    toggleGroup(group.label)
  }

  return (
    <div className="mb-1">
      <button
        onClick={handleToggle}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
          groupActive
            ? 'text-primary font-medium'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-expanded={isExpanded}
      >
        <span className="flex-shrink-0">{group.icon}</span>
        <span className="font-medium flex-1 text-left">{group.label}</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-3">
          {visibleItems.map((item) => {
            const itemActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const subItems = (item as NavItem & { subItems?: NavItem[] }).subItems

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
                    itemActive
                      ? 'bg-primary text-white font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                </Link>

                {subItems && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {subItems.map((subItem) => {
                      const subActive = pathname === subItem.href
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={onNavigate}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-xs ${
                            subActive
                              ? 'bg-primary/80 text-white font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="truncate">{subItem.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      return next
    })
  }

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
            aria-label="Toggle menu"
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
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <nav className="p-4 space-y-1">
              {navGroups.map((group) => (
                <NavGroupItem
                  key={group.label}
                  group={group}
                  pathname={pathname}
                  expandedGroups={expandedGroups}
                  toggleGroup={toggleGroup}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              ))}
            </nav>
            <div className="p-4 border-t">
              <Button variant="outline" className="w-full" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <aside className="w-64 bg-white border-r h-screen sticky top-0 overflow-y-auto flex flex-col">
          <div className="p-6 border-b">
            <Link href="/" className="flex items-center">
              <Logo className="h-10 w-auto" />
            </Link>
          </div>

          <nav className="p-4 space-y-1 flex-1">
            {navGroups.map((group) => (
              <NavGroupItem
                key={group.label}
                group={group}
                pathname={pathname}
                expandedGroups={expandedGroups}
                toggleGroup={toggleGroup}
              />
            ))}
          </nav>

          <div className="p-4 border-t bg-white">
            <Link href="/dashboard/profile" className="block mb-4 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors">
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
