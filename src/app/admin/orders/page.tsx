'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Package, Eye } from 'lucide-react'
import { OrderStats } from '@/components/admin/orders/order-stats'
import { OrderFilters } from '@/components/admin/orders/order-filters'
import { OrdersTable } from '@/components/admin/orders/orders-table'
import { OrdersEmptyState } from '@/components/admin/orders/orders-empty-state'

type Order = Database['public']['Tables']['orders']['Row'] & {
  customers?: {
    first_name: string | null
    last_name: string | null
  }
}

type OrderStats = {
  total: number
  pending: number
  paid: number
  fulfilled: number
  totalRevenue: number
}

export default function OrdersPage() {
  const router = useRouter()
  const { tenant } = useTenant()
  const t = useTranslations('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    paid: 0,
    fulfilled: 0,
    totalRevenue: 0
  })

  const supabase = createClient()

  useEffect(() => {
    if (tenant?.id) {
      loadOrders()
      loadStats()
    }
  }, [tenant?.id])



  const loadOrders = async () => {
    try {
      setLoading(true)
      
      // If no tenant ID, don't make database calls
      if (!tenant?.id) {
        setOrders([])
        setLoading(false)
        return
      }
      

      
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            first_name,
            last_name
          )
        `)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading orders:', error)
        return
      }

      setOrders(orders || [])
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // If no tenant ID, show empty stats
      if (!tenant?.id) {
        const emptyStats: OrderStats = {
          total: 0,
          pending: 0,
          paid: 0,
          fulfilled: 0,
          totalRevenue: 0
        }
        setStats(emptyStats)
        return
      }
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('financial_status, fulfillment_status, total_price')
        .eq('tenant_id', tenant.id)

      if (error) {
        console.error('Error loading stats:', error)
        return
      }

      const stats: OrderStats = {
        total: orders?.length || 0,
        pending: orders?.filter(o => o.financial_status === 'pending').length || 0,
        paid: orders?.filter(o => o.financial_status === 'paid').length || 0,
        fulfilled: orders?.filter(o => o.fulfillment_status === 'fulfilled').length || 0,
        totalRevenue: orders?.filter(o => o.financial_status === 'paid')
          .reduce((sum, o) => sum + (o.total_price || 0), 0) || 0
      }

      setStats(stats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const updateOrderStatus = async (orderId: string, field: 'financial_status' | 'fulfillment_status', value: string) => {
    try {
      // Don't update if no tenant ID
      if (!tenant?.id) {
        console.error('No tenant ID available')
        return
      }
      
      const { error } = await supabase
        .from('orders')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('tenant_id', tenant.id)

      if (error) {
        console.error('Error updating order:', error)
        return
      }

      // Refresh orders and stats
      await Promise.all([loadOrders(), loadStats()])
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customers?.first_name && order.customers.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customers?.last_name && order.customers.last_name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || order.financial_status === statusFilter
    const matchesFulfillment = fulfillmentFilter === 'all' || order.fulfillment_status === fulfillmentFilter

    return matchesSearch && matchesStatus && matchesFulfillment
  })

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
      currency: 'USD'
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



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      {/* Stats Cards */}
      <OrderStats stats={stats} />

      {/* Filters */}
      <OrderFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        fulfillmentFilter={fulfillmentFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onFulfillmentFilterChange={setFulfillmentFilter}
      />

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('summary.ordersCount', { count: filteredOrders.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <OrdersEmptyState 
              hasFilters={searchTerm !== '' || statusFilter !== 'all' || fulfillmentFilter !== 'all'}
              isDemoTenant={tenant?.id === 'demo-tenant-id'}
            />
          ) : (
            <OrdersTable
              orders={filteredOrders}
              onViewOrder={viewOrderDetails}
              onEditOrder={(orderId) => router.push(`/admin/orders/${orderId}/edit`)}
              onUpdateStatus={updateOrderStatus}
            />
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('orderDetails')} - #{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">{t('orderInformation')}</h3>
                  <div className="text-sm space-y-1">
                    <div>Order Number: #{selectedOrder.order_number}</div>
                    <div>Date: {formatDate(selectedOrder.created_at)}</div>
                    <div>Currency: {selectedOrder.currency}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Payment:</span>
                      {getStatusBadge(selectedOrder.financial_status || 'pending', 'financial')}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Fulfillment:</span>
                      {getStatusBadge(selectedOrder.fulfillment_status || 'unfulfilled', 'fulfillment')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-medium mb-2">{t('customer')}</h3>
                <div className="text-sm space-y-1">
                  <div>
                    {selectedOrder.customers?.first_name || selectedOrder.customers?.last_name 
                      ? `${selectedOrder.customers.first_name || ''} ${selectedOrder.customers.last_name || ''}`.trim()
                      : t('guestCustomer')
                    }
                  </div>
                  <div>{selectedOrder.email}</div>
                  {selectedOrder.phone && <div>{selectedOrder.phone}</div>}
                </div>
              </div>

              {/* Addresses */}
              {(selectedOrder.billing_address || selectedOrder.shipping_address) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedOrder.billing_address && (
                    <div>
                      <h3 className="font-medium mb-2">{t('billingAddress')}</h3>
                      <div className="text-sm text-gray-600">
                        {JSON.stringify(selectedOrder.billing_address, null, 2)}
                      </div>
                    </div>
                  )}
                  {selectedOrder.shipping_address && (
                    <div>
                      <h3 className="font-medium mb-2">{t('shippingAddress')}</h3>
                      <div className="text-sm text-gray-600">
                        {JSON.stringify(selectedOrder.shipping_address, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing */}
              <div>
                <h3 className="font-medium mb-2">{t('pricing')}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>{t('subtotal')}:</span>
                    <span>{formatCurrency(selectedOrder.subtotal_price)}</span>
                  </div>
                  {(selectedOrder.total_tax ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>{t('tax')}:</span>
                      <span>{formatCurrency(selectedOrder.total_tax || 0)}</span>
                    </div>
                  )}
                  {(selectedOrder.shipping_price ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>{t('shipping')}:</span>
                      <span>{formatCurrency(selectedOrder.shipping_price || 0)}</span>
                    </div>
                  )}
                  {(selectedOrder.total_discounts ?? 0) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{t('discount')}:</span>
                      <span>-{formatCurrency(selectedOrder.total_discounts || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>{t('total')}:</span>
                    <span>{formatCurrency(selectedOrder.total_price)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-medium mb-2">{t('notes')}</h3>
                  <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Tags */}
              {selectedOrder.tags && selectedOrder.tags.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">{t('tags')}</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedOrder.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}