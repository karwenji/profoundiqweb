import { NextResponse } from 'next/server'
import { findUserById, updateUserRole, deactivateUser, activateUser } from '@/lib/users'
import type { UserRole } from '@/types'

// PATCH /api/users/[id] - Update user role or status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const body = await request.json()
    const { role, isActive } = body

    const user = findUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update role if provided
    if (role) {
      const validRoles: UserRole[] = ['super_admin', 'admin', 'instructor', 'student']
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        )
      }
      updateUserRole(userId, role)
    }

    // Update active status if provided
    if (typeof isActive === 'boolean') {
      if (isActive) {
        activateUser(userId)
      } else {
        deactivateUser(userId)
      }
    }

    const updatedUser = findUserById(userId)
    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Deactivate user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const success = deactivateUser(userId)

    if (!success) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'User deactivated successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
