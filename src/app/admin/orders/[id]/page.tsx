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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ArrowLeft, Package2, User, MapPin, CreditCard, Truck, FileText, Tags, Calendar, Mail, Phone, Edit, Save, X, Plus, Trash2 } from 'lucide-react'

type TrackingNumber = {
  id: string
  provider: string
  number: string
  link?: string
  added_at: string
}

type Order = Database['public']['Tables']['orders']['Row'] & {
  customers?: {
    first_name: string | null
    last_name: string | null
  }
  order_line_items?: Array<{
    id: string
    quantity: number
    price: number
    title: string
    variant_title?: string | null
  }>
  tracking_numbers?: TrackingNumber[] | null
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
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState('')
  const [editingTags, setEditingTags] = useState(false)
  const [tagsValue, setTagsValue] = useState('')
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [trackingNumbers, setTrackingNumbers] = useState<TrackingNumber[]>([])

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
          order_line_items (
            id,
            quantity,
            price,
            title,
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
      // Initialize tracking numbers from the loaded order
      if (order.tracking_numbers) {
        setTrackingNumbers(Array.isArray(order.tracking_numbers) ? order.tracking_numbers as TrackingNumber[] : [])
      }
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

  const addTrackingNumber = () => {
    const newTracking: TrackingNumber = {
      id: `tracking_${Date.now()}`,
      provider: '',
      number: '',
      link: '',
      added_at: new Date().toISOString()
    }
    setTrackingNumbers(prev => [...prev, newTracking])
  }

  const removeTrackingNumber = (id: string) => {
    setTrackingNumbers(prev => prev.filter(tracking => tracking.id !== id))
  }

  const updateTrackingNumber = (id: string, field: 'provider' | 'number' | 'link', value: string) => {
    setTrackingNumbers(prev => prev.map(tracking => 
      tracking.id === id ? { ...tracking, [field]: value } : tracking
    ))
  }

  const saveTrackingNumbers = async () => {
    if (!order || !tenant?.id) return
    
    try {
      setUpdating(true)
      
      // Filter out empty tracking numbers
      const validTrackingNumbers = trackingNumbers.filter(tracking => 
        tracking.provider.trim() && tracking.number.trim()
      )
      
      // Create tracking note if there are valid tracking numbers
      let trackingNote = ''
      if (validTrackingNumbers.length > 0) {
        trackingNote = `\n\n━━━ TRACKING INFORMATION ━━━\n`
        validTrackingNumbers.forEach((tracking, index) => {
          trackingNote += `📦 ${tracking.provider}\n`
          trackingNote += `   Tracking #: ${tracking.number}\n`
          if (tracking.link && tracking.link.trim()) {
            trackingNote += `   Track: ${tracking.link}\n`
          }
          if (index < validTrackingNumbers.length - 1) {
            trackingNote += `\n`
          }
        })
        trackingNote += `\n🕒 ${new Date().toLocaleString()}`
      }
      
      // Combine existing notes with tracking note
      const updatedNotes = order.notes ? order.notes + trackingNote : trackingNote.trim()
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_numbers: validTrackingNumbers.length > 0 ? validTrackingNumbers : null,
          notes: trackingNote ? updatedNotes : order.notes,
          updated_at: new Date().toISOString() 
        })
        .eq('id', order.id)
        .eq('tenant_id', tenant.id)

      if (error) {
        console.error('Error updating tracking numbers:', error)
        return
      }

      setOrder(prev => prev ? { 
        ...prev, 
        tracking_numbers: validTrackingNumbers.length > 0 ? validTrackingNumbers : null,
        notes: trackingNote ? updatedNotes : prev.notes
      } : null)
      setShowTrackingModal(false)
      
    } catch (error) {
      console.error('Error updating tracking numbers:', error)
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
        <div className="flex gap-2">
          {getStatusBadge(order.financial_status || 'pending', 'financial')}
          {getStatusBadge(order.fulfillment_status || 'unfulfilled', 'fulfillment')}
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
        {order.order_line_items && order.order_line_items.length > 0 && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package2 className="h-5 w-5" />
                {t('orderItems')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.order_line_items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium">{item.title}</div>
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('notes')}
              </div>
              {!editingNotes ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setEditingNotes(true)
                    setNotesValue(order.notes || '')
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setEditingNotes(false)
                      setNotesValue('')
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={async () => {
                      if (!order || !tenant?.id) return
                      
                      try {
                        setUpdating(true)
                        
                        const { error } = await supabase
                          .from('orders')
                          .update({ 
                            notes: notesValue || null, 
                            updated_at: new Date().toISOString() 
                          })
                          .eq('id', order.id)
                          .eq('tenant_id', tenant.id)

                        if (error) {
                          console.error('Error updating notes:', error)
                          return
                        }

                        setOrder(prev => prev ? { ...prev, notes: notesValue || null } : null)
                        setEditingNotes(false)
                        
                      } catch (error) {
                        console.error('Error updating notes:', error)
                      } finally {
                        setUpdating(false)
                      }
                    }}
                    disabled={updating}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingNotes ? (
              <Textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                placeholder="Add order notes..."
                className="min-h-[100px]"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {order.notes || 'No notes added yet. Click Edit to add notes.'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tags className="h-5 w-5" />
                {t('tags')}
              </div>
              {!editingTags ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setEditingTags(true)
                    setTagsValue((order.tags || []).join(', '))
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setEditingTags(false)
                      setTagsValue('')
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={async () => {
                      if (!order || !tenant?.id) return
                      
                      try {
                        setUpdating(true)
                        
                        const tags = tagsValue.split(',').map(tag => tag.trim()).filter(Boolean)
                        
                        const { error } = await supabase
                          .from('orders')
                          .update({ 
                            tags: tags.length > 0 ? tags : null, 
                            updated_at: new Date().toISOString() 
                          })
                          .eq('id', order.id)
                          .eq('tenant_id', tenant.id)

                        if (error) {
                          console.error('Error updating tags:', error)
                          return
                        }

                        setOrder(prev => prev ? { ...prev, tags: tags.length > 0 ? tags : null } : null)
                        setEditingTags(false)
                        
                      } catch (error) {
                        console.error('Error updating tags:', error)
                      } finally {
                        setUpdating(false)
                      }
                    }}
                    disabled={updating}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingTags ? (
              <div className="space-y-2">
                <Input
                  value={tagsValue}
                  onChange={(e) => setTagsValue(e.target.value)}
                  placeholder="Enter tags separated by commas"
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple tags with commas
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {order.tags && order.tags.length > 0 ? (
                  order.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No tags added yet. Click Edit to add tags.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tracking Numbers */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                {t('trackingNumbers')}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowTrackingModal(true)
                  // Initialize tracking numbers from order data
                  const currentTracking = order.tracking_numbers
                  if (currentTracking && Array.isArray(currentTracking)) {
                    setTrackingNumbers(currentTracking as TrackingNumber[])
                  } else {
                    setTrackingNumbers([])
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.tracking_numbers && Array.isArray(order.tracking_numbers) && order.tracking_numbers.length > 0 ? (
                (order.tracking_numbers as TrackingNumber[]).map((tracking, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{tracking.provider}</div>
                      <div className="text-sm text-muted-foreground font-mono">{tracking.number}</div>
                      {tracking.link && (
                        <a 
                          href={tracking.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          {t('trackPackage')}
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Added {formatDate(tracking.added_at)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('noTrackingNumbers')}. Click Edit to add tracking information.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Numbers Modal */}
      <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                {t('manageTrackingNumbers')}
              </div>
              {trackingNumbers.length > 0 && (
                <Badge variant="secondary">
                  {trackingNumbers.length} {trackingNumbers.length === 1 ? 'entry' : 'entries'}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {trackingNumbers.length === 0 && (
              <div className="text-center py-8">
                <Truck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  No tracking numbers added yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Click "Add Tracking Number" below to get started
                </p>
              </div>
            )}
            
            {trackingNumbers.map((tracking) => (
              <div key={tracking.id} className="flex gap-3 items-start p-4 border rounded-lg bg-gray-50">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`provider-${tracking.id}`} className="text-sm font-medium">
                      {t('shippingProvider')} *
                    </Label>
                    <Input
                      id={`provider-${tracking.id}`}
                      value={tracking.provider}
                      onChange={(e) => updateTrackingNumber(tracking.id, 'provider', e.target.value)}
                      placeholder="e.g. UPS, FedEx, USPS, DHL"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`number-${tracking.id}`} className="text-sm font-medium">
                      {t('trackingNumber')} *
                    </Label>
                    <Input
                      id={`number-${tracking.id}`}
                      value={tracking.number}
                      onChange={(e) => updateTrackingNumber(tracking.id, 'number', e.target.value)}
                      placeholder="Enter tracking number"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`link-${tracking.id}`} className="text-sm font-medium">
                      {t('trackingLink')} (Optional)
                    </Label>
                    <Input
                      id={`link-${tracking.id}`}
                      value={tracking.link || ''}
                      onChange={(e) => updateTrackingNumber(tracking.id, 'link', e.target.value)}
                      placeholder="https://tracking-url.com"
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeTrackingNumber(tracking.id)}
                  className="text-destructive hover:text-destructive mt-6"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={addTrackingNumber}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('addTrackingNumber')}
            </Button>
            
            {trackingNumbers.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  📝 {t('automaticNoteGeneration')}
                </p>
                <p className="text-sm text-blue-700 mb-2">
                  {t('trackingNoteDescription')}
                </p>
                <p className="text-xs text-blue-600">
                  * Required fields. Empty entries will be removed when saved.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowTrackingModal(false)
                setTrackingNumbers([])
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveTrackingNumbers}
              disabled={updating}
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t('saveTracking')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}