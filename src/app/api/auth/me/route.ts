import { NextResponse } from 'next/server'
import { findUserById, updateUser, getAllUsers, type User } from '@/lib/users'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: getAllUsers(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { userId, name, email, phone, bio, avatar, password } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const user = findUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const updates: Record<string, string> = {}
    if (name !== undefined) updates.name = name
    if (email !== undefined) updates.email = email
    if (phone !== undefined) updates.phone = phone
    if (bio !== undefined) updates.bio = bio
    if (avatar !== undefined) updates.avatar = avatar
    if (password !== undefined) updates.password = password

    const updated = updateUser(userId, updates)
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        uniqueId: updated.uniqueId,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
        bio: updated.bio,
        avatar: updated.avatar,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
