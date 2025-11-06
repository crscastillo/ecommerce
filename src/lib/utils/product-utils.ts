import { formatPrice } from '@/lib/utils/currency'
import { ProductWithVariants, ProductVariant, TenantSettings } from '@/lib/types/product'

/**
 * Parse product variants from string or object format
 */
export function parseProductVariants(variants: any): ProductVariant[] {
  if (!variants) return []
  
  let parsedVariants = variants
  
  // If it's a string, try to parse it as JSON
  if (typeof variants === 'string') {
    try {
      parsedVariants = JSON.parse(variants)
    } catch (e) {
      return []
    }
  }
  
  // If it's not an array, try to get values (in case it's an object)
  if (!Array.isArray(parsedVariants)) {
    parsedVariants = Object.values(parsedVariants || {})
  }
  
  return parsedVariants.filter((v: any) => v && typeof v === 'object')
}

/**
 * Get price range for variable products
 */
export function getProductPriceRange(product: ProductWithVariants, tenant?: any): string {
  if (product.product_type === 'variable') {
    const variants = parseProductVariants(product.variants)
    const activeVariants = variants.filter(v => v.is_active !== false)
    
    if (activeVariants.length === 0) return 'No variants'
    
    const prices = activeVariants.map(v => parseFloat(v.price || '0'))
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    
    if (minPrice === maxPrice) {
      return formatPrice(minPrice, tenant)
    }
    return `${formatPrice(minPrice, tenant)} - ${formatPrice(maxPrice, tenant)}`
  }
  
  return formatPrice(product.price, tenant)
}

/**
 * Get total inventory for variable products
 */
export function getProductInventory(product: ProductWithVariants, settings?: TenantSettings) {
  if (product.product_type === 'digital') {
    return {
      total: 0,
      status: 'digital' as const,
      isLowStock: false,
      isOutOfStock: false,
      variants: 0
    }
  }
  
  if (product.product_type === 'variable') {
    const variants = parseProductVariants(product.variants)
    const activeVariants = variants.filter(v => v.is_active !== false)
    const totalStock = activeVariants.reduce((sum, v) => sum + parseInt(v.stock_quantity || '0'), 0)
    const lowStockThreshold = settings?.low_stock_threshold || 5
    
    return {
      total: totalStock,
      status: totalStock > lowStockThreshold ? 'good' as const : 
              totalStock > 0 ? 'low' as const : 'out' as const,
      isLowStock: totalStock <= lowStockThreshold && totalStock > 0,
      isOutOfStock: totalStock === 0,
      variants: activeVariants.length
    }
  }
  
  // Single product
  const lowStockThreshold = settings?.low_stock_threshold || 5
  const inventory = product.inventory_quantity || 0
  
  return {
    total: inventory,
    status: inventory > lowStockThreshold ? 'good' as const : 
            inventory > 0 ? 'low' as const : 'out' as const,
    isLowStock: inventory <= lowStockThreshold && inventory > 0,
    isOutOfStock: inventory === 0,
    variants: 0
  }
}

/**
 * Get inventory color class based on status
 */
export function getInventoryColorClass(status: 'good' | 'low' | 'out' | 'digital'): string {
  switch (status) {
    case 'good':
      return 'text-green-600'
    case 'low':
      return 'text-yellow-600'
    case 'out':
      return 'text-red-600'
    case 'digital':
      return 'text-purple-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * Get product type badge styling
 */
export function getProductTypeBadgeClass(productType: string): string {
  switch (productType) {
    case 'variable':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'digital':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'single':
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

/**
 * Get product type display text with icon
 */
export function getProductTypeDisplay(productType: string): string {
  switch (productType) {
    case 'single':
      return '📦 Single'
    case 'variable':
      return '🔀 Variable'
    case 'digital':
      return '💾 Digital'
    default:
      return '📦 Unknown'
  }
}

/**
 * Format date for display
 */
export function formatProductDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}