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

    try {
      const fs = await import('fs')
      const path = await import('path')
      const storeFile = path.join(process.cwd(), 'data', 'settings-store.json')
      const existing = fs.existsSync(storeFile) ? JSON.parse(fs.readFileSync(storeFile, 'utf8')) : {}
      existing.adminSettings = updatedSettings
      fs.writeFileSync(storeFile, JSON.stringify(existing, null, 2), 'utf8')
    } catch (storageError) {
      console.error('Settings persistence warning:', storageError)
    }

    return NextResponse.json({ success: true, data: updatedSettings })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update admin settings' },
      { status: 500 }
    )
  }
}
