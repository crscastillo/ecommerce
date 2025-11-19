'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Package2, User, MapPin, CreditCard, Truck, FileText, Tags, Calendar, Mail, Phone } from 'lucide-react'

type Order = Database['public']['Tables']['orders']['Row'] & {
  customers?: {
    first_name: string | null
    last_name: string | null
  }
  order_items?: Array<{
    id: string
    quantity: number
    price: number
    product_title: string
    variant_title?: string | null
  }>
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { tenant } = useTenant()
  const t = useTranslations('orders')
  const tCommon = useTranslations('common')
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (tenant?.id && params.id) {
      loadOrder()
    }
  }, [tenant?.id, params.id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      
      // Don't load if no tenant ID
      if (!tenant?.id) {
        setLoading(false)
        return
      }
      
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            first_name,
            last_name
          ),
          order_items (
            id,
            quantity,
            price,
            product_title,
            variant_title
          )
        `)
        .eq('id', params.id)
        .eq('tenant_id', tenant.id)
        .single()

      if (error) {
        console.error('Error loading order:', error)
        return
      }

      setOrder(order)
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (field: 'financial_status' | 'fulfillment_status', value: string) => {
    if (!order || !tenant?.id) return
    
    try {
      setUpdating(true)
      
      const { error } = await supabase
        .from('orders')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', order.id)
        .eq('tenant_id', tenant.id)

      if (error) {
        console.error('Error updating order:', error)
        return
      }

      // Update local state
      setOrder(prev => prev ? { ...prev, [field]: value } : null)
      
    } catch (error) {
      console.error('Error updating order:', error)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string, type: 'financial' | 'fulfillment') => {
    const config = {
      financial: {
        pending: { variant: 'secondary' as const, label: t('status.pending') },
        paid: { variant: 'default' as const, label: t('status.paid') },
        refunded: { variant: 'destructive' as const, label: t('status.refunded') },
        cancelled: { variant: 'outline' as const, label: t('status.cancelled') }
      },
      fulfillment: {
        unfulfilled: { variant: 'secondary' as const, label: t('status.unfulfilled') },
        fulfilled: { variant: 'default' as const, label: t('status.fulfilled') },
        partial: { variant: 'outline' as const, label: t('status.partial') }
      }
    }

    const typeConfig = config[type]
    const statusConfig = (typeConfig as any)[status] || { variant: 'outline' as const, label: status }
    return (
      <Badge variant={statusConfig.variant}>
        {statusConfig.label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: order?.currency || 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAddress = (address: any) => {
    if (!address) return null
    
    const parts = [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postal_code,
      address.country
    ].filter(Boolean)
    
    return parts.join(', ')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToOrders')}
          </Button>
          <h1 className="text-3xl font-bold">{tCommon('loading')}</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToOrders')}
          </Button>
          <h1 className="text-3xl font-bold">{t('orderDetails')}</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Package2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noOrdersFound')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToOrders')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('orderDetails')}</h1>
            <p className="text-muted-foreground">#{order.order_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/orders/${order.id}/edit`)}>
            {t('editOrder')}
          </Button>
          <div className="flex gap-2">
            {getStatusBadge(order.financial_status || 'pending', 'financial')}
            {getStatusBadge(order.fulfillment_status || 'unfulfilled', 'fulfillment')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package2 className="h-5 w-5" />
              {t('orderInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{t('date')}:</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Currency:</span>
                <span>{order.currency?.toUpperCase()}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">{t('paymentStatus')}</label>
                <Select 
                  value={order.financial_status || 'pending'} 
                  onValueChange={(value) => updateOrderStatus('financial_status', value)}
                  disabled={updating}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('status.pending')}</SelectItem>
                    <SelectItem value="paid">{t('status.paid')}</SelectItem>
                    <SelectItem value="refunded">{t('status.refunded')}</SelectItem>
                    <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">{t('fulfillmentStatus')}</label>
                <Select 
                  value={order.fulfillment_status || 'unfulfilled'} 
                  onValueChange={(value) => updateOrderStatus('fulfillment_status', value)}
                  disabled={updating}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unfulfilled">{t('status.unfulfilled')}</SelectItem>
                    <SelectItem value="fulfilled">{t('status.fulfilled')}</SelectItem>
                    <SelectItem value="partial">{t('status.partial')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('customerInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium">
                {order.customers?.first_name || order.customers?.last_name 
                  ? `${order.customers.first_name || ''} ${order.customers.last_name || ''}`.trim()
                  : t('guestCustomer')
                }
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{order.email}</span>
              </div>
              {order.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t('pricing')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t('subtotal')}:</span>
                <span>{formatCurrency(order.subtotal_price)}</span>
              </div>
              {(order.total_tax ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span>{t('tax')}:</span>
                  <span>{formatCurrency(order.total_tax || 0)}</span>
                </div>
              )}
              {(order.shipping_price ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span>{t('shipping')}:</span>
                  <span>{formatCurrency(order.shipping_price || 0)}</span>
                </div>
              )}
              {(order.total_discounts ?? 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t('discount')}:</span>
                  <span>-{formatCurrency(order.total_discounts || 0)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-lg border-t pt-2">
                <span>{t('total')}:</span>
                <span>{formatCurrency(order.total_price)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Addresses */}
        {(order.billing_address || order.shipping_address) && (
          <>
            {order.billing_address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t('billingAddress')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {formatAddress(order.billing_address) || JSON.stringify(order.billing_address, null, 2)}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {order.shipping_address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    {t('shippingAddress')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {formatAddress(order.shipping_address) || JSON.stringify(order.shipping_address, null, 2)}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Order Items */}
        {order.order_items && order.order_items.length > 0 && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package2 className="h-5 w-5" />
                {t('orderItems')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium">{item.product_title}</div>
                      {item.variant_title && (
                        <div className="text-sm text-muted-foreground">{item.variant_title}</div>
                      )}
                      <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(item.price * item.quantity)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(item.price)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {order.notes && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('notes')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {order.tags && order.tags.length > 0 && (
          <Card className={order.notes ? "lg:col-span-1" : "lg:col-span-3"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5" />
                {t('tags')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {order.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}