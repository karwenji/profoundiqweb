// Client-safe settings helpers.
// Persistence is handled by API routes using data/settings-store.json.

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
  defaultCurrency: string
  supportedCurrencies: string[]
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
  defaultCurrency: 'NGN',
  supportedCurrencies: ['NGN', 'KES', 'USD', 'EUR', 'GBP'],
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

export function getAdminSettings(): AdminSettings {
  return { ...adminSettings }
}

export function updateAdminSettings(settings: Partial<AdminSettings>): AdminSettings {
  adminSettings = { ...adminSettings, ...settings }
  return { ...adminSettings }
}

export function getSystemSettings(): SystemSettings {
  return { ...systemSettings }
}

export function updateSystemSettings(settings: Partial<SystemSettings>): SystemSettings {
  systemSettings = { ...systemSettings, ...settings }
  return { ...systemSettings }
}

export function getSupportedCurrencies(): string[] {
  return systemSettings.supportedCurrencies
}

export function getDefaultCurrency(): string {
  return systemSettings.defaultCurrency
}

export function getWebhookSettings(): WebhookSettings {
  return { ...webhookSettings }
}

export function updateWebhookSettings(settings: Partial<WebhookSettings>): WebhookSettings {
  webhookSettings = { ...webhookSettings, ...settings }
  return { ...webhookSettings }
}

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

export function getAllSettings() {
  return {
    adminSettings: getAdminSettings(),
    systemSettings: getSystemSettings(),
    webhookSettings: getWebhookSettings(),
    paymentMethods: getPaymentMethods(),
  }
}

export function updateAllSettings(updates: {
  adminSettings?: Partial<AdminSettings>
  systemSettings?: Partial<SystemSettings>
  webhookSettings?: Partial<WebhookSettings>
  paymentMethods?: PaymentMethod[]
}) {
  if (updates.adminSettings) updateAdminSettings(updates.adminSettings)
  if (updates.systemSettings) updateSystemSettings(updates.systemSettings)
  if (updates.webhookSettings) updateWebhookSettings(updates.webhookSettings)
  if (updates.paymentMethods) updatePaymentMethods(updates.paymentMethods)
  return getAllSettings()
}

export function loadClientSettings(
  saved?: Partial<{
    adminSettings: AdminSettings
    systemSettings: SystemSettings
    webhookSettings: WebhookSettings
    paymentMethods: PaymentMethod[]
  }>
) {
  if (saved?.adminSettings) adminSettings = saved.adminSettings
  if (saved?.systemSettings) systemSettings = saved.systemSettings
  if (saved?.webhookSettings) webhookSettings = saved.webhookSettings
  if (saved?.paymentMethods) paymentMethods = saved.paymentMethods
}
