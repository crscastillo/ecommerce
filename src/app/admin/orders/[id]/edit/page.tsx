'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Package2, User, CreditCard } from 'lucide-react'

type Order = Database['public']['Tables']['orders']['Row'] & {
  customers?: {
    first_name: string | null
    last_name: string | null
  }
}

export default function EditOrderPage() {
  const params = useParams()
  const router = useRouter()
  const { tenant } = useTenant()
  const t = useTranslations('orders')
  const tCommon = useTranslations('common')
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    financial_status: '',
    fulfillment_status: '',
    notes: '',
    tags: [] as string[]
  })

  const supabase = createClient()

  useEffect(() => {
    if (tenant?.id && params.id) {
      loadOrder()
    }
  }, [tenant?.id, params.id])

  useEffect(() => {
    if (order) {
      setFormData({
        financial_status: order.financial_status || 'pending',
        fulfillment_status: order.fulfillment_status || 'unfulfilled',
        notes: order.notes || '',
        tags: order.tags || []
      })
    }
  }, [order])

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!order || !tenant?.id) return
    
    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('orders')
        .update({
          financial_status: formData.financial_status,
          fulfillment_status: formData.fulfillment_status,
          notes: formData.notes || null,
          tags: formData.tags.length > 0 ? formData.tags : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id)
        .eq('tenant_id', tenant.id)

      if (error) {
        console.error('Error updating order:', error)
        return
      }

      // Redirect back to order details
      router.push(`/admin/orders/${order.id}`)
      
    } catch (error) {
      console.error('Error updating order:', error)
    } finally {
      setSaving(false)
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

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, tags }))
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
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
          <h1 className="text-3xl font-bold">{t('editOrder')}</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Package2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noOrdersFound')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              The order you're looking for doesn't exist or you don't have permission to edit it.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToOrders')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('editOrder')}</h1>
            <p className="text-muted-foreground">#{order.order_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.push(`/admin/orders/${order.id}`)}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? t('saving') : t('saveChanges')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Information - Read Only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package2 className="h-5 w-5" />
              {t('orderInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div><strong>{t('orderNumber')}:</strong> #{order.order_number}</div>
              <div><strong>{t('date')}:</strong> {formatDate(order.created_at)}</div>
              <div><strong>Currency:</strong> {order.currency?.toUpperCase()}</div>
              <div><strong>{t('total')}:</strong> {formatCurrency(order.total_price)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information - Read Only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('customerInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div>
                <strong>{t('customer')}:</strong>{' '}
                {order.customers?.first_name || order.customers?.last_name 
                  ? `${order.customers.first_name || ''} ${order.customers.last_name || ''}`.trim()
                  : t('guestCustomer')
                }
              </div>
              <div><strong>Email:</strong> {order.email}</div>
              {order.phone && <div><strong>Phone:</strong> {order.phone}</div>}
            </div>
          </CardContent>
        </Card>

        {/* Status Management - Editable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Status Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="financial_status">{t('paymentStatus')}</Label>
                <Select 
                  value={formData.financial_status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, financial_status: value }))}
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
                <Label htmlFor="fulfillment_status">{t('fulfillmentStatus')}</Label>
                <Select 
                  value={formData.fulfillment_status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, fulfillment_status: value }))}
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

            {/* Current Status Preview */}
            <div className="pt-3 border-t">
              <p className="text-sm font-medium mb-2">Current Status:</p>
              <div className="flex gap-2">
                {getStatusBadge(formData.financial_status, 'financial')}
                {getStatusBadge(formData.fulfillment_status, 'fulfillment')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information - Editable */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes">{t('notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add internal notes about this order..."
                rows={4}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="tags">{t('tags')}</Label>
              <Input
                id="tags"
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="Enter tags separated by commas"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Separate multiple tags with commas
              </p>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}