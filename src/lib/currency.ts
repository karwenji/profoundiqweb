// Currency utility functions for multi-currency support

export interface CurrencyInfo {
  code: string
  name: string
  symbol: string
  locale: string
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  KES: {
    code: 'KES',
    name: 'Kenya Shilling',
    symbol: 'KSh',
    locale: 'en-KE',
  },
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    locale: 'en-NG',
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    locale: 'de-DE',
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    locale: 'en-GB',
  },
}

export function getCurrencyInfo(code: string): CurrencyInfo {
  return CURRENCIES[code] || {
    code,
    name: code,
    symbol: code,
    locale: 'en-US',
  }
}

export function formatCurrency(amount: number, currencyCode: string = 'KES'): string {
  const currency = getCurrencyInfo(currencyCode)
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
    }).format(amount)
  } catch (error) {
    return `${currency.symbol}${amount.toLocaleString()}`
  }
}

export function getCurrencySymbol(currencyCode: string = 'NGN'): string {
  return getCurrencyInfo(currencyCode).symbol
}

export function getAllCurrencies(): CurrencyInfo[] {
  return Object.values(CURRENCIES)
}
