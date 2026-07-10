import { NextRequest, NextResponse } from 'next/server'
import { updateRolePermissions, deleteRole, getRoleById } from '@/lib/roles'

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const { permissions } = body

    if (!permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, error: 'Permissions array is required' },
        { status: 400 }
      )
    }

    const updatedRole = updateRolePermissions(id, permissions)
    
    if (!updatedRole) {
      return NextResponse.json(
        { success: false, error: 'Role not found or cannot be modified' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: updatedRole })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update role permissions' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const deleted = deleteRole(id)

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Role not found or cannot be deleted' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Role deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete role' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const role = getRoleById(id)

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: role })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch role' },
      { status: 500 }
    )
  }
}
