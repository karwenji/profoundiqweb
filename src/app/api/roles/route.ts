import { NextRequest, NextResponse } from 'next/server'
import { getAllRoles, createRole, getRoleById } from '@/lib/roles'

export async function GET(request: NextRequest) {
  try {
    const roles = getAllRoles()
    return NextResponse.json({ success: true, data: roles })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, permissions } = body

    if (!name || !description || !permissions) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newRole = createRole({ name, description, permissions })
    return NextResponse.json({ success: true, data: newRole }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create role' },
      { status: 500 }
    )
  }
}
