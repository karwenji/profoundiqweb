import { NextRequest, NextResponse } from 'next/server'
import { getAdminSettings, updateAdminSettings } from '@/lib/settings'

export async function GET() {
  try {
    const settings = getAdminSettings()
    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const updatedSettings = updateAdminSettings(body)
    return NextResponse.json({ success: true, data: updatedSettings })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update admin settings' },
      { status: 500 }
    )
  }
}
