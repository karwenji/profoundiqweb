import { NextResponse } from 'next/server'
import { findUserByEmail, createUser, type UserRole } from '@/lib/users'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role = 'student' } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Password strength validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Validate role - only student and instructor can self-register
    const validRoles: UserRole[] = ['student', 'instructor']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Only student and instructor can self-register.' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user with specified role
    const newUser = createUser({ name, email, password, role })

    // Return user data (excluding password)
    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: newUser.id,
          uniqueId: newUser.uniqueId,
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
