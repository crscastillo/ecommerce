'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Truck, Shield, CreditCard, Gift, Info } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

interface CartSummaryProps {
  itemCount: number
  totalPrice: number
  tenant?: any
  formatPrice: (price: number, tenant?: any) => string
}

export function CartSummary({ itemCount, totalPrice, tenant, formatPrice }: CartSummaryProps) {
  const t = useTranslations('cart')
  
  // Simple shipping calculation - can be enhanced with proper shipping settings integration later
  const shippingCost = totalPrice > 0 ? 9.99 : 0 // Standard shipping rate
  
  const estimatedTax = totalPrice * 0.08 // 8% tax rate - this could be dynamic
  const finalTotal = totalPrice + shippingCost + estimatedTax
  
  return (
    <Card className="lg:sticky lg:top-4 shadow-lg">
      <CardHeader className="pb-3 lg:pb-4">
        <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
          <ShoppingCart className="w-4 h-4" />
          {t('orderSummary')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-6">
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-3">
          {/* Items Summary */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('subtotal')} ({itemCount} {itemCount === 1 ? t('item') : t('items')})</span>
            <span className="font-medium text-foreground text-sm">{formatPrice(totalPrice, tenant)}</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {itemCount > 0 && (
              <Link href="/checkout" className="block">
                <Button className="w-full h-10 text-xs font-semibold">
                  <CreditCard className="w-3 h-3 mr-2" />
                  {t('proceedToCheckout')}
                </Button>
              </Link>
            )}
            
            <Link href="/products" className="block">
              <Button variant="outline" className="w-full h-10 text-xs font-medium">
                {t('continueShopping')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block space-y-4">
          {/* Items Summary */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-base text-muted-foreground">{t('subtotal')} ({itemCount} {itemCount === 1 ? t('item') : t('items')})</span>
              <span className="font-medium text-foreground text-base">{formatPrice(totalPrice, tenant)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {itemCount > 0 && (
              <Link href="/checkout" className="block">
                <Button className="w-full h-11 text-sm font-semibold">
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t('proceedToCheckout')}
                </Button>
              </Link>
            )}
          </div>
          
          {/* Trust Signals */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>{t('secureCheckout')}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Truck className="w-4 h-4 text-primary" />
              <span>{t('freeReturns')}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>{t('multiplePaymentOptions')}</span>
            </div>
          </div>
          
          {/* Promo Code Section */}
          <div className="pt-4 border-t border-border">
            <Button variant="ghost" className="w-full text-sm text-primary hover:text-primary/80 hover:bg-muted">
              <Gift className="w-4 h-4 mr-2" />
              {t('havePromoCode')}
            </Button>
          </div>
          
          {/* Help Info */}
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Info className="w-3 h-3" />
              {t('needHelp')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
