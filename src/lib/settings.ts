// Shared in-memory settings storage
// In production, replace this with a real database

export interface AdminSettings {
  allowInstructorRegistration: boolean
  autoApproveCourses: boolean
  commissionRate: number
  notificationEmail: string
}

export interface SystemSettings {
  siteName: string
  supportEmail: string
  maxStudentsPerCourse: number
  enableRegistration: boolean
  maintenanceMode: boolean
}

export interface WebhookSettings {
  callbackUrl: string
  webhookUrl: string
  webhookSecret: string
  enableInstantProcessing: boolean
  autoEnrollOnSuccess: boolean
}

export interface PaymentMethod {
  id: string
  name: string
  type: 'paystack' | 'stripe' | 'paypal' | 'bank_transfer'
  enabled: boolean
  publicKey?: string
  secretKey?: string
  currency?: string
  accountDetails?: string
}

// Default settings
let adminSettings: AdminSettings = {
  allowInstructorRegistration: true,
  autoApproveCourses: false,
  commissionRate: 20,
  notificationEmail: 'admin@profoundiqconsulting.com',
}

let systemSettings: SystemSettings = {
  siteName: 'Profound IQ Consulting',
  supportEmail: 'support@profoundiqconsulting.com',
  maxStudentsPerCourse: 500,
  enableRegistration: true,
  maintenanceMode: false,
}

let webhookSettings: WebhookSettings = {
  callbackUrl: 'https://profoundiqconsulting.com/api/payment/callback',
  webhookUrl: 'https://profoundiqconsulting.com/api/payment/webhook',
  webhookSecret: 'whsec_xxxxxxxxxxxxxxxxxxxxxxxx',
  enableInstantProcessing: true,
  autoEnrollOnSuccess: true,
}

let paymentMethods: PaymentMethod[] = [
  {
    id: '1',
    name: 'Paystack',
    type: 'paystack',
    enabled: true,
    publicKey: 'pk_test_xxxxxxxxxxxx',
    secretKey: 'sk_test_xxxxxxxxxxxx',
    currency: 'NGN',
  },
]

// Admin Settings
export function getAdminSettings(): AdminSettings {
  return { ...adminSettings }
}

export function updateAdminSettings(settings: Partial<AdminSettings>): AdminSettings {
  adminSettings = { ...adminSettings, ...settings }
  return { ...adminSettings }
}

// System Settings
export function getSystemSettings(): SystemSettings {
  return { ...systemSettings }
}

export function updateSystemSettings(settings: Partial<SystemSettings>): SystemSettings {
  systemSettings = { ...systemSettings, ...settings }
  return { ...systemSettings }
}

// Webhook Settings
export function getWebhookSettings(): WebhookSettings {
  return { ...webhookSettings }
}

export function updateWebhookSettings(settings: Partial<WebhookSettings>): WebhookSettings {
  webhookSettings = { ...webhookSettings, ...settings }
  return { ...webhookSettings }
}

// Payment Methods
export function getPaymentMethods(): PaymentMethod[] {
  return paymentMethods.map(m => ({ ...m }))
}

export function updatePaymentMethods(methods: PaymentMethod[]): PaymentMethod[] {
  paymentMethods = methods.map(m => ({ ...m }))
  return getPaymentMethods()
}

export function addPaymentMethod(method: Omit<PaymentMethod, 'id'>): PaymentMethod {
  const newMethod: PaymentMethod = {
    ...method,
    id: Date.now().toString(),
  }
  paymentMethods.push(newMethod)
  return { ...newMethod }
}

export function deletePaymentMethod(id: string): boolean {
  const index = paymentMethods.findIndex(m => m.id === id)
  if (index >= 0) {
    paymentMethods.splice(index, 1)
    return true
  }
  return false
}
