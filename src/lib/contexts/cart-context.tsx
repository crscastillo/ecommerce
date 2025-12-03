'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export interface CartItem {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  quantity: number
  image?: string
  maxQuantity?: number
}

export interface CartContextType {
  items: CartItem[]
  addToCart: (product: {
    id: string
    name: string
    slug: string
    price: number
    image?: string
    maxQuantity?: number
  }, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getTotalPrice: () => number
  isInCart: (productId: string) => boolean
  getCartItem: (productId: string) => CartItem | undefined
}

const CartContext = createContext<CartContextType | null>(null)

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    // Return a safe fallback instead of throwing
    return {
      items: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      getItemCount: () => 0,
      getTotalPrice: () => 0,
      isInCart: () => false,
      getCartItem: () => undefined
    } as CartContextType
  }
  return context
}

interface CartProviderProps {
  children: React.ReactNode
  storageKey?: string
}

export function CartProvider({ 
  children, 
  storageKey = 'ecommerce-cart' 
}: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsedItems = JSON.parse(stored)
        if (Array.isArray(parsedItems)) {
          setItems(parsedItems)
        }
      }
    } catch (error) {
    }
    setMounted(true)
  }, [storageKey])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!mounted) return
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(items))
    } catch (error) {
    }
  }, [items, storageKey, mounted])

  const addToCart = (product: {
    id: string
    name: string
    slug: string
    price: number
    image?: string
    maxQuantity?: number
  }, quantity: number = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.productId === product.id)
      
      if (existingItem) {
        // Update quantity of existing item
        const newQuantity = existingItem.quantity + quantity
        const maxQuantity = product.maxQuantity || 999
        const finalQuantity = Math.min(newQuantity, maxQuantity)
        
        return currentItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: finalQuantity }
            : item
        )
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          quantity: Math.min(quantity, product.maxQuantity || 999),
          image: product.image,
          maxQuantity: product.maxQuantity
        }
        
        return [...currentItems, newItem]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setItems(currentItems =>
      currentItems.map(item => {
        if (item.productId === productId) {
          const maxQuantity = item.maxQuantity || 999
          return { ...item, quantity: Math.min(quantity, maxQuantity) }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const isInCart = (productId: string) => {
    return items.some(item => item.productId === productId)
  }

  const getCartItem = (productId: string) => {
    return items.find(item => item.productId === productId)
  }

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    getTotalPrice,
    isInCart,
    getCartItem
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    )
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}