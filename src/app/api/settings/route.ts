import { NextRequest, NextResponse } from 'next/server'
import { getAllSettings, updateAllSettings, loadClientSettings } from '@/lib/settings'

export async function GET() {
  try {
    const settings = getAllSettings()
    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const updatedSettings = updateAllSettings(body)

    const storePath = `${process.cwd()}/data/settings-store.json`
    try {
      const fs = await import('fs')
      const path = await import('path')
      const storeFile = path.join(process.cwd(), 'data', 'settings-store.json')
      fs.writeFileSync(storeFile, JSON.stringify(updatedSettings, null, 2), 'utf8')
    } catch (storageError) {
      console.error('Settings persistence warning:', storageError)
    }

    return NextResponse.json({ success: true, data: updatedSettings })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    )
  }
}
