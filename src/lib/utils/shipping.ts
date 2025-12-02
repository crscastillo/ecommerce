import type { ShippingMethod } from '@/components/admin/settings/shipping-tab'
import type { CartItem } from '@/lib/contexts/cart-context'

export interface ShippingCalculationRequest {
  items: CartItem[]
  shippingAddress?: {
    country: string
    state: string
    zipCode: string
  }
  shippingMethods: ShippingMethod[]
}

export interface ShippingCalculationResult {
  availableMethods: {
    id: string
    name: string
    description: string
    price: number
    estimatedDays?: string
  }[]
  recommendedMethodId?: string
  totalWeight: number
}

/**
 * Calculate estimated weight for cart items
 * For now, we'll use a simple estimation based on product type
 * In the future, this could be enhanced with actual product weights from database
 */
export function calculateCartWeight(items: CartItem[]): number {
  let totalWeight = 0
  
  for (const item of items) {
    // Default weight estimation: 0.5kg per item
    // This could be enhanced by adding weight field to products
    const estimatedItemWeight = 0.5
    totalWeight += estimatedItemWeight * item.quantity
  }
  
  return totalWeight
}

/**
 * Calculate shipping costs based on shipping methods and cart items
 */
export function calculateShipping(request: ShippingCalculationRequest): ShippingCalculationResult {
  const { items, shippingMethods, shippingAddress } = request
  
  // Calculate total cart weight
  const totalWeight = calculateCartWeight(items)
  
  // Calculate subtotal for free shipping threshold
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  const availableMethods: ShippingCalculationResult['availableMethods'] = []
  let recommendedMethodId: string | undefined
  let lowestPrice = Infinity
  
  // Process each enabled shipping method
  for (const method of shippingMethods) {
    if (!method.enabled) continue
    
    let shippingPrice = 0
    let estimatedDays = '3-5 business days'
    
    switch (method.type) {
      case 'weight_based':
        shippingPrice = calculateWeightBasedShipping(method, totalWeight, subtotal)
        estimatedDays = '3-5 business days'
        break
        
      case 'flat_rate':
        shippingPrice = method.config.base_rate || 0
        // Check if qualifies for free shipping
        if (method.config.free_threshold && subtotal >= method.config.free_threshold) {
          shippingPrice = 0
        }
        estimatedDays = '3-5 business days'
        break
        
      case 'free':
        shippingPrice = 0
        estimatedDays = '5-7 business days'
        break
        
      default:
        continue
    }
    
    // Check weight limits
    if (method.config.max_weight && totalWeight > method.config.max_weight) {
      continue // Skip this method if weight exceeds limit
    }
    
    availableMethods.push({
      id: method.id,
      name: method.name,
      description: method.description,
      price: shippingPrice,
      estimatedDays
    })
    
    // Track cheapest method for recommendation
    if (shippingPrice < lowestPrice) {
      lowestPrice = shippingPrice
      recommendedMethodId = method.id
    }
  }
  
  return {
    availableMethods,
    recommendedMethodId,
    totalWeight
  }
}

/**
 * Calculate weight-based shipping cost
 */
function calculateWeightBasedShipping(
  method: ShippingMethod, 
  totalWeight: number, 
  subtotal: number
): number {
  const config = method.config
  
  // Check free shipping threshold
  if (config.free_threshold && subtotal >= config.free_threshold) {
    return 0
  }
  
  // Calculate weight-based cost
  const baseRate = config.base_rate || 0
  const perKgRate = config.per_kg_rate || 0
  
  return baseRate + (totalWeight * perKgRate)
}

/**
 * Get shipping methods for a tenant
 */
export async function getShippingMethods(tenantId: string): Promise<ShippingMethod[]> {
  try {
    const response = await fetch(`/api/shipping-settings?tenant_id=${tenantId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch shipping methods')
    }
    
    const data = await response.json()
    return data.shipping_methods || []
  } catch (error) {
    console.error('Error fetching shipping methods:', error)
    
    // Return default shipping method as fallback
    return [{
      id: 'weight_based_fallback',
      name: 'Standard Shipping',
      description: 'Standard shipping rates',
      enabled: true,
      type: 'weight_based',
      config: {
        base_rate: 5.00,
        per_kg_rate: 2.00,
        free_threshold: 100.00,
        max_weight: 30
      }
    }]
  }
}

/**
 * Format shipping method display name with price
 */
export function formatShippingMethodDisplay(
  method: ShippingCalculationResult['availableMethods'][0],
  formatPrice: (price: number, tenant?: any) => string,
  tenant?: any
): string {
  const priceText = method.price === 0 ? 'Free' : formatPrice(method.price, tenant)
  return `${method.name} - ${priceText} (${method.estimatedDays})`
}