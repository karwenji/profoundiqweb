import { NextResponse } from 'next/server'
import { getAllPermissions, getPermissionsByCategory } from '@/lib/roles'

export async function GET() {
  try {
    const permissions = getAllPermissions()
    const grouped = getPermissionsByCategory()
    
    return NextResponse.json({ 
      success: true, 
      data: permissions,
      grouped 
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch permissions' },
      { status: 500 }
    )
  }
}
