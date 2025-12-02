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
    <Card className="sticky top-4 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart className="w-4 h-4" />
          {t('orderSummary')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items Summary */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('subtotal')} ({itemCount} {itemCount === 1 ? t('item') : t('items')})</span>
            <span className="font-medium text-foreground">{formatPrice(totalPrice, tenant)}</span>
          </div>
          
          {/* Shipping */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Truck className="w-4 h-4" />
                {t('shipping')}
              </span>
              <span className="font-medium text-foreground">{formatPrice(shippingCost, tenant)}</span>
            </div>
          </div>
          
          {/* Tax */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('tax')}</span>
            <span className="font-medium text-foreground">{formatPrice(estimatedTax, tenant)}</span>
          </div>
        </div>
        
        <Separator />
        
        {/* Total */}
        <div className="bg-muted/50 p-4 rounded-lg border">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-foreground">{t('total')}</span>
            <span className="text-lg font-bold text-foreground">{formatPrice(finalTotal, tenant)}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t('includingTaxAndShipping')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {itemCount > 0 && (
            <Link href="/checkout" className="block">
              <Button className="w-full h-10 text-sm font-semibold">
                <CreditCard className="w-4 h-4 mr-2" />
                {t('proceedToCheckout')}
              </Button>
            </Link>
          )}
          
          <Link href="/products" className="block">
            <Button variant="outline" className="w-full h-10 text-sm font-medium">
              {t('continueShopping')}
            </Button>
          </Link>
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
      </CardContent>
    </Card>
  )
}
