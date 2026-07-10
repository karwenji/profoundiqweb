import { NextRequest, NextResponse } from 'next/server'
import { getWebhookSettings, updateWebhookSettings } from '@/lib/settings'

export async function GET() {
  try {
    const settings = getWebhookSettings()
    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch webhook settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const updatedSettings = updateWebhookSettings(body)
    return NextResponse.json({ success: true, data: updatedSettings })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update webhook settings' },
      { status: 500 }
    )
  }
}
