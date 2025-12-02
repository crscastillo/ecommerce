import { Tenant } from '@/lib/contexts/tenant-context'

export const formatPrice = (price: number, tenant?: Tenant | null) => {
  const currency = tenant?.settings?.currency
  
  if (!currency) {
    // Fallback to USD if no tenant currency is set
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  // Get the locale based on currency
  const getLocaleForCurrency = (currency: string): string => {
    const currencyLocaleMap: Record<string, string> = {
      'USD': 'en-US',
      'EUR': 'de-DE',
      'GBP': 'en-GB',
      'JPY': 'ja-JP',
      'CAD': 'en-CA',
      'AUD': 'en-AU',
      'CHF': 'de-CH',
      'CNY': 'zh-CN',
      'SEK': 'sv-SE',
      'NZD': 'en-NZ',
      'MXN': 'es-MX',
      'SGD': 'en-SG',
      'HKD': 'zh-HK',
      'NOK': 'nb-NO',
      'TRY': 'tr-TR',
      'RUB': 'ru-RU',
      'INR': 'hi-IN',
      'BRL': 'pt-BR',
      'ZAR': 'en-ZA',
      'KRW': 'ko-KR',
      'CRC': 'es-CR', // Costa Rican Colón
    }
    
    return currencyLocaleMap[currency] || 'en-US'
  }

  return new Intl.NumberFormat(getLocaleForCurrency(currency), {
    style: 'currency',
    currency: currency,
  }).format(price)
}

// Get currency symbol from tenant settings
export const getCurrencySymbol = (tenant?: Tenant | null): string => {
  const currency = tenant?.settings?.currency || 'USD'
  
  const currencySymbolMap: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': '$',
    'AUD': '$',
    'CHF': 'Fr',
    'CNY': '¥',
    'SEK': 'kr',
    'NZD': '$',
    'MXN': '$',
    'SGD': '$',
    'HKD': '$',
    'NOK': 'kr',
    'TRY': '₺',
    'RUB': '₽',
    'INR': '₹',
    'BRL': 'R$',
    'ZAR': 'R',
    'KRW': '₩',
    'CRC': '₡',
  }
  
  return currencySymbolMap[currency] || '$'
}