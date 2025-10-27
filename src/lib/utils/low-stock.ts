/**
 * Low Stock Utilities
 * Helper functions for determining and displaying low stock status
 */

export interface Product {
  inventory_quantity: number
  track_inventory: boolean
}

export interface LowStockSettings {
  low_stock_threshold: number
}

/**
 * Check if a product is considered low stock
 */
export function isProductLowStock(
  product: Product, 
  settings: LowStockSettings
): boolean {
  // Don't show low stock for products that don't track inventory
  if (!product.track_inventory) {
    return false
  }
  
  const threshold = settings.low_stock_threshold || 5
  return product.inventory_quantity < threshold
}

/**
 * Get low stock badge text and styling
 */
export function getLowStockBadge(
  product: Product, 
  settings: LowStockSettings
): { show: boolean; text: string; variant: 'destructive' | 'warning' | null } {
  if (!isProductLowStock(product, settings)) {
    return { show: false, text: '', variant: null }
  }
  
  const threshold = settings.low_stock_threshold || 5
  const quantity = product.inventory_quantity
  
  if (quantity === 0) {
    return { 
      show: true, 
      text: 'Out of Stock', 
      variant: 'destructive' 
    }
  } else if (quantity === 1) {
    return { 
      show: true, 
      text: 'Only 1 left', 
      variant: 'warning' 
    }
  } else {
    return { 
      show: true, 
      text: `Only ${quantity} left`, 
      variant: 'warning' 
    }
  }
}

/**
 * Filter products to only those that are low stock
 */
export function filterLowStockProducts<T extends Product>(
  products: T[], 
  settings: LowStockSettings
): T[] {
  return products.filter(product => isProductLowStock(product, settings))
}

/**
 * Get low stock count from a list of products
 */
export function getLowStockCount(
  products: Product[], 
  settings: LowStockSettings
): number {
  return filterLowStockProducts(products, settings).length
}