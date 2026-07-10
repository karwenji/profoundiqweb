import { NextRequest, NextResponse } from 'next/server'
import { getSystemSettings, updateSystemSettings } from '@/lib/settings'

export async function GET() {
  try {
    const settings = getSystemSettings()
    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch system settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const updatedSettings = updateSystemSettings(body)
    return NextResponse.json({ success: true, data: updatedSettings })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update system settings' },
      { status: 500 }
    )
  }
}
