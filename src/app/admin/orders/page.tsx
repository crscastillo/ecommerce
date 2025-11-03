'use client'

import { useState, useEffect } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, Eye, DollarSign, Package, AlertCircle, CheckCircle } from 'lucide-react'

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
  const { tenant, isLoading: tenantLoading, error } = useTenant()
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
      
      // If this is a demo tenant, don't make database calls
      if (tenant?.id === 'demo-tenant-id') {
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
        .eq('tenant_id', tenant?.id)
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
      // If this is a demo tenant, show demo stats
      if (tenant?.id === 'demo-tenant-id') {
        const demoStats: OrderStats = {
          total: 0,
          pending: 0,
          paid: 0,
          fulfilled: 0,
          totalRevenue: 0
        }
        setStats(demoStats)
        return
      }
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('financial_status, fulfillment_status, total_price')
        .eq('tenant_id', tenant?.id)

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
      const { error } = await supabase
        .from('orders')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('tenant_id', tenant?.id)

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
        pending: { variant: 'secondary' as const, label: 'Pending' },
        paid: { variant: 'default' as const, label: 'Paid' },
        refunded: { variant: 'destructive' as const, label: 'Refunded' },
        cancelled: { variant: 'outline' as const, label: 'Cancelled' }
      },
      fulfillment: {
        unfulfilled: { variant: 'secondary' as const, label: 'Unfulfilled' },
        fulfilled: { variant: 'default' as const, label: 'Fulfilled' },
        partial: { variant: 'outline' as const, label: 'Partial' }
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Show tenant loading state
  if (tenantLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Orders</h1>
        </div>
        <div className="text-center py-8">
          <p>Loading tenant information...</p>
        </div>
      </div>
    )
  }

  // Show tenant error state
  if (error || !tenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Orders</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tenant Access Required</h3>
            <p className="text-gray-600 mb-4">
              {error || 'No tenant found. This admin panel requires access via your store subdomain.'}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 mb-2"><strong>How to access:</strong></p>
              <ol className="text-sm text-gray-600 space-y-1 text-left max-w-md mx-auto">
                <li>1. Set up a tenant/store first at the main domain</li>
                <li>2. Access via subdomain: <code className="bg-gray-200 px-1 rounded">yourstore.localhost:3000</code></li>
                <li>3. Then navigate to <code className="bg-gray-200 px-1 rounded">/admin/orders</code></li>
              </ol>
            </div>
            <p className="text-xs text-gray-500">
              Current URL: {typeof window !== 'undefined' ? window.location.href : 'Unknown'}
            </p>
            <div className="mt-4">
              <Button 
                onClick={() => window.location.href = '/'}
                className="mr-2"
              >
                Go to Main Site
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Orders</h1>
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
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payment</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Fulfilled</p>
                <p className="text-2xl font-bold">{stats.fulfilled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by order number, email, or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label>Payment Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label>Fulfillment Status</Label>
              <Select value={fulfillmentFilter} onValueChange={setFulfillmentFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fulfillment</SelectItem>
                  <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || fulfillmentFilter !== 'all' 
                  ? 'Try adjusting your filters or search term.'
                  : tenant?.id === 'demo-tenant-id'
                    ? 'This is a demo environment. Orders will appear here once customers start placing them in a real store.'
                    : 'Orders will appear here once customers start placing them.'
                }
              </p>
              {tenant?.id === 'demo-tenant-id' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
                  <p className="text-sm text-blue-700">
                    <strong>Demo Mode:</strong> You're viewing the orders page in demo mode. 
                    In a real store with orders, you'd see comprehensive order management features here.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Fulfillment</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">#{order.order_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.customers?.first_name || order.customers?.last_name 
                              ? `${order.customers.first_name || ''} ${order.customers.last_name || ''}`.trim()
                              : 'Guest'
                            }
                          </div>
                          <div className="text-sm text-gray-500">{order.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(order.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={order.financial_status || undefined} 
                          onValueChange={(value) => updateOrderStatus(order.id, 'financial_status', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              {getStatusBadge(order.financial_status || 'pending', 'financial')}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={order.fulfillment_status || undefined} 
                          onValueChange={(value) => updateOrderStatus(order.id, 'fulfillment_status', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              {getStatusBadge(order.fulfillment_status || 'unfulfilled', 'fulfillment')}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
                            <SelectItem value="fulfilled">Fulfilled</SelectItem>
                            <SelectItem value="partial">Partial</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(order.total_price)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewOrderDetails(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Order Information</h3>
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
                <h3 className="font-medium mb-2">Customer</h3>
                <div className="text-sm space-y-1">
                  <div>
                    {selectedOrder.customers?.first_name || selectedOrder.customers?.last_name 
                      ? `${selectedOrder.customers.first_name || ''} ${selectedOrder.customers.last_name || ''}`.trim()
                      : 'Guest Customer'
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
                      <h3 className="font-medium mb-2">Billing Address</h3>
                      <div className="text-sm text-gray-600">
                        {JSON.stringify(selectedOrder.billing_address, null, 2)}
                      </div>
                    </div>
                  )}
                  {selectedOrder.shipping_address && (
                    <div>
                      <h3 className="font-medium mb-2">Shipping Address</h3>
                      <div className="text-sm text-gray-600">
                        {JSON.stringify(selectedOrder.shipping_address, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing */}
              <div>
                <h3 className="font-medium mb-2">Pricing</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.subtotal_price)}</span>
                  </div>
                  {(selectedOrder.total_tax ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatCurrency(selectedOrder.total_tax || 0)}</span>
                    </div>
                  )}
                  {(selectedOrder.shipping_price ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{formatCurrency(selectedOrder.shipping_price || 0)}</span>
                    </div>
                  )}
                  {(selectedOrder.total_discounts ?? 0) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(selectedOrder.total_discounts || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedOrder.total_price)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Tags */}
              {selectedOrder.tags && selectedOrder.tags.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Tags</h3>
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