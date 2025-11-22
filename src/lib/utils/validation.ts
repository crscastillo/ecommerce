import { 
  StoreSettings, 
  ThemeSettings, 
  PaymentSettings, 
  PaymentMethodConfig,
  ValidationResult, 
  ValidationError,
  PaymentMethodValidation
} from '@/lib/types/settings'

// Validation utilities
export function createError(field: string, message: string): ValidationError {
  return { field, message }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{7,}$/
  return phoneRegex.test(phone)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexRegex.test(color)
}

// Store settings validation
export function validateStoreSettings(settings: StoreSettings): ValidationResult {
  const errors: ValidationError[] = []

  // Required fields
  if (!settings.name.trim()) {
    errors.push(createError('name', 'Store name is required'))
  } else if (settings.name.length < 2) {
    errors.push(createError('name', 'Store name must be at least 2 characters'))
  } else if (settings.name.length > 100) {
    errors.push(createError('name', 'Store name must be less than 100 characters'))
  }

  if (!settings.contact_email.trim()) {
    errors.push(createError('contact_email', 'Contact email is required'))
  } else if (!isValidEmail(settings.contact_email)) {
    errors.push(createError('contact_email', 'Please enter a valid email address'))
  }

  // Optional fields validation
  if (settings.contact_phone && !isValidPhone(settings.contact_phone)) {
    errors.push(createError('contact_phone', 'Please enter a valid phone number'))
  }

  if (settings.description && settings.description.length > 500) {
    errors.push(createError('description', 'Description must be less than 500 characters'))
  }

  // Settings validation
  if (settings.settings.tax_rate < 0 || settings.settings.tax_rate > 1) {
    errors.push(createError('settings.tax_rate', 'Tax rate must be between 0 and 1 (0-100%)'))
  }

  if (settings.settings.low_stock_threshold < 0) {
    errors.push(createError('settings.low_stock_threshold', 'Low stock threshold must be 0 or greater'))
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Theme settings validation
export function validateThemeSettings(settings: ThemeSettings): ValidationResult {
  const errors: ValidationError[] = []

  // Color validation
  const colorFields = [
    'primary_color',
    'secondary_color', 
    'accent_color',
    'background_color',
    'text_color'
  ] as const

  colorFields.forEach(field => {
    const color = settings[field]
    if (color && !isValidHexColor(color)) {
      errors.push(createError(field, `${field.replace('_', ' ')} must be a valid hex color`))
    }
  })

  // URL validation
  if (settings.logo_url && !isValidUrl(settings.logo_url)) {
    errors.push(createError('logo_url', 'Logo URL must be a valid URL'))
  }

  if (settings.favicon_url && !isValidUrl(settings.favicon_url)) {
    errors.push(createError('favicon_url', 'Favicon URL must be a valid URL'))
  }

  // CSS validation (basic check)


  return {
    isValid: errors.length === 0,
    errors
  }
}

// Payment method validation
export function validateStripeKeys(keys: { publishableKey: string; secretKey: string }): PaymentMethodValidation {
  if (!keys.publishableKey || !keys.secretKey) {
    return { valid: false, message: 'Both publishable and secret keys are required' }
  }

  const pubKeyValid = keys.publishableKey.startsWith('pk_test_') || keys.publishableKey.startsWith('pk_live_')
  const secKeyValid = keys.secretKey.startsWith('sk_test_') || keys.secretKey.startsWith('sk_live_')

  if (!pubKeyValid) {
    return { valid: false, message: 'Publishable key must start with pk_test_ or pk_live_' }
  }

  if (!secKeyValid) {
    return { valid: false, message: 'Secret key must start with sk_test_ or sk_live_' }
  }

  const isTestMode = keys.publishableKey.startsWith('pk_test_') && keys.secretKey.startsWith('sk_test_')
  const isLiveMode = keys.publishableKey.startsWith('pk_live_') && keys.secretKey.startsWith('sk_live_')

  if (!isTestMode && !isLiveMode) {
    return { valid: false, message: 'Publishable and secret keys must be from the same mode (test or live)' }
  }

  return { 
    valid: true, 
    message: isTestMode ? 'Test mode keys detected' : 'Live mode keys detected' 
  }
}

export function validateTiloPayKeys(keys: { publishableKey: string; secretKey: string }): PaymentMethodValidation {
  if (!keys.publishableKey || !keys.secretKey) {
    return { valid: false, message: 'Both API key and secret key are required' }
  }

  if (keys.publishableKey.length < 10) {
    return { valid: false, message: 'API key appears to be too short' }
  }

  if (keys.secretKey.length < 10) {
    return { valid: false, message: 'Secret key appears to be too short' }
  }

  return { valid: true, message: 'TiloPay keys appear valid' }
}

export function validateBankTransferDetails(method: PaymentMethodConfig): PaymentMethodValidation {
  if (!method.bankDetails) {
    return { valid: false, message: 'Bank details are required' }
  }

  const { bankName, accountNumber, accountHolder } = method.bankDetails

  if (!bankName?.trim()) {
    return { valid: false, message: 'Bank name is required' }
  }

  if (!accountNumber?.trim()) {
    return { valid: false, message: 'Account number is required' }
  }

  if (!accountHolder?.trim()) {
    return { valid: false, message: 'Account holder name is required' }
  }

  return { valid: true, message: 'Bank transfer details are valid' }
}

export function validateMobileBankTransfer(method: PaymentMethodConfig): PaymentMethodValidation {
  if (!method.bankDetails) {
    return { valid: false, message: 'Mobile bank transfer details are required' }
  }

  const { accountHolder } = method.bankDetails

  if (!accountHolder?.trim()) {
    return { valid: false, message: 'Phone number or account holder is required' }
  }

  return { valid: true, message: 'Mobile bank transfer details are valid' }
}

// Payment settings validation
export function validatePaymentSettings(paymentMethods: PaymentSettings): ValidationResult {
  const errors: ValidationError[] = []
  
  const enabledMethods = paymentMethods.filter(method => method.enabled)
  
  if (enabledMethods.length === 0) {
    errors.push(createError('payment_methods', 'At least one payment method must be enabled'))
  }

  // Validate each enabled method
  enabledMethods.forEach(method => {
    let validation: PaymentMethodValidation

    switch (method.id) {
      case 'stripe':
        if (method.keys) {
          validation = validateStripeKeys({
            publishableKey: method.keys.publishableKey || '',
            secretKey: method.keys.secretKey || ''
          })
          if (!validation.valid) {
            errors.push(createError(`${method.id}_keys`, validation.message))
          }
        }
        break

      case 'tilopay':
        if (method.keys) {
          validation = validateTiloPayKeys({
            publishableKey: method.keys.publishableKey || '',
            secretKey: method.keys.secretKey || ''
          })
          if (!validation.valid) {
            errors.push(createError(`${method.id}_keys`, validation.message))
          }
        }
        break

      case 'bank_transfer':
        validation = validateBankTransferDetails(method)
        if (!validation.valid) {
          errors.push(createError(`${method.id}_details`, validation.message))
        }
        break

      case 'mobile_bank_transfer':
        validation = validateMobileBankTransfer(method)
        if (!validation.valid) {
          errors.push(createError(`${method.id}_details`, validation.message))
        }
        break
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

// User invitation validation
export function validateUserInvitation(email: string, role: string): ValidationResult {
  const errors: ValidationError[] = []

  if (!email.trim()) {
    errors.push(createError('email', 'Email address is required'))
  } else if (!isValidEmail(email)) {
    errors.push(createError('email', 'Please enter a valid email address'))
  }

  if (!role) {
    errors.push(createError('role', 'User role is required'))
  } else if (!['owner', 'admin', 'staff'].includes(role)) {
    errors.push(createError('role', 'Invalid user role'))
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Form field validation helpers
export const fieldValidators = {
  required: (value: string, fieldName: string) => 
    value.trim() ? null : `${fieldName} is required`,
    
  email: (value: string) => 
    isValidEmail(value) ? null : 'Please enter a valid email address',
    
  phone: (value: string) => 
    !value || isValidPhone(value) ? null : 'Please enter a valid phone number',
    
  url: (value: string) => 
    !value || isValidUrl(value) ? null : 'Please enter a valid URL',
    
  hexColor: (value: string) => 
    !value || isValidHexColor(value) ? null : 'Please enter a valid hex color',
    
  minLength: (min: number) => (value: string, fieldName: string) =>
    value.length >= min ? null : `${fieldName} must be at least ${min} characters`,
    
  maxLength: (max: number) => (value: string, fieldName: string) =>
    value.length <= max ? null : `${fieldName} must be less than ${max} characters`,
    
  range: (min: number, max: number) => (value: number, fieldName: string) =>
    value >= min && value <= max ? null : `${fieldName} must be between ${min} and ${max}`
}