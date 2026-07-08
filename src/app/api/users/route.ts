import { NextResponse } from 'next/server'
import { getAllUsers, updateUserRole, deactivateUser, activateUser, findUserById, type UserRole } from '@/lib/users'

// GET /api/users - Get all users (Super Admin and Admin only)
export async function GET(request: Request) {
  try {
    // In production, verify user role from session/token
    const { searchParams } = new URL(request.url)
    const roleFilter = searchParams.get('role')
    
    let allUsers = getAllUsers()
    
    if (roleFilter) {
      allUsers = allUsers.filter(u => u.role === roleFilter)
    }
    
    return NextResponse.json({ users: allUsers })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user (Super Admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      )
    }

    const validRoles: UserRole[] = ['super_admin', 'admin', 'instructor', 'student']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Import here to avoid circular dependency
    const { findUserByEmail, createUser } = await import('@/lib/users')
    
    const existingUser = findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    const newUser = createUser({ name, email, password, role })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
