import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json')

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'))
}

const defaultSettings = {
  revenueSplit: {
    defaultAdminPercentage: 40,
    defaultInstructorPercentage: 60,
    allowCustomSplits: true,
  },
  currency: {
    primary: 'NGN',
    supported: ['NGN', 'USD', 'EUR', 'GBP', 'KES'],
  },
  payments: {
    paystackPublicKey: '',
    paystackSecretKey: '',
    flutterwavePublicKey: '',
    flutterwaveSecretKey: '',
    enabledMethods: ['paystack'],
  },
  features: {
    socialMediaGrowth: true,
    certificates: true,
    liveClasses: false,
  },
  branding: {
    platformName: 'Profound IQ Consulting',
    logoUrl: '/logo.png',
    primaryColor: '#2563eb',
  },
}

function getSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8')
      return { ...defaultSettings, ...JSON.parse(data) }
    }
  } catch (error) {
    console.error('Error reading settings:', error)
  }
  return defaultSettings
}

function saveSettings(newSettings: any) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2), 'utf8')
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

export async function GET() {
  const settings = getSettings()
  return NextResponse.json({ success: true, data: settings })
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const currentSettings = getSettings()
    const updatedSettings = { ...currentSettings, ...body }
    
    saveSettings(updatedSettings)
    
    return NextResponse.json({ success: true, data: updatedSettings })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
