'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  ArrowLeft,
  Building2, 
  Users, 
  DollarSign, 
  Package,
  ShoppingCart,
  AlertCircle,
  ExternalLink,
  Settings,
  Calendar,
  Globe,
  Mail,
  Phone
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'

interface TenantDetails {
  id: string
  name: string
  subdomain: string
  domain?: string
  contact_email?: string
  contact_phone?: string
  description?: string
  subscription_tier: string
  is_active: boolean
  created_at: string
  updated_at: string
  owner_id: string
  settings: any
  // Metrics
  products_count: number
  categories_count: number
  orders_count: number
  customers_count: number
  total_revenue: number
  monthly_revenue: number
}

interface RecentOrder {
  id: string
  order_number: string
  customer_email: string
  total_price: number
  status: string
  created_at: string
}

interface TopProduct {
  id: string
  name: string
  orders_count: number
  revenue: number
}

export default function TenantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tenantId = params.id as string

  const [tenant, setTenant] = useState<TenantDetails | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    if (tenantId) {
      loadTenantDetails()
    }
  }, [tenantId])

  const loadTenantDetails = async () => {
    try {
      setLoading(true)
      setError('')

      // Get tenant basic info
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single()

      if (tenantError) throw tenantError

      // Get metrics
      const [
        { count: productsCount },
        { count: categoriesCount },
        { count: ordersCount },
        { count: customersCount }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('categories').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('customers').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId)
      ])

      // Get revenue data
      const { data: orders } = await supabase
        .from('orders')
        .select('total_price, created_at')
        .eq('tenant_id', tenantId)

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const monthlyRevenue = orders?.filter(order => 
        new Date(order.created_at) >= thisMonth
      ).reduce((sum, order) => sum + (order.total_price || 0), 0) || 0

      // Get recent orders
      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('id, order_number, email, total_price, financial_status, created_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(10)

      setTenant({
        ...tenantData,
        products_count: productsCount || 0,
        categories_count: categoriesCount || 0,
        orders_count: ordersCount || 0,
        customers_count: customersCount || 0,
        total_revenue: totalRevenue,
        monthly_revenue: monthlyRevenue
      })

      setRecentOrders(recentOrdersData?.map(order => ({
        id: order.id,
        order_number: order.order_number,
        customer_email: order.email,
        total_price: order.total_price,
        status: order.financial_status,
        created_at: order.created_at
      })) || [])

      // Get top products (mock for now - you'd join with order_line_items)
      setTopProducts([
        { id: '1', name: 'Sample Product 1', orders_count: 15, revenue: 450 },
        { id: '2', name: 'Sample Product 2', orders_count: 12, revenue: 380 },
        { id: '3', name: 'Sample Product 3', orders_count: 8, revenue: 240 }
      ])

    } catch (err: any) {
      console.error('Error loading tenant details:', err)
      setError(err.message || 'Failed to load tenant details')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!tenant) return
    
    try {
      const newStatus = !tenant.is_active
      
      const { error } = await supabase
        .from('tenants')
        .update({ is_active: newStatus })
        .eq('id', tenant.id)

      if (error) throw error

      setTenant({ ...tenant, is_active: newStatus })
    } catch (err: any) {
      console.error('Error updating tenant status:', err)
      alert('Failed to update tenant status')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Tenant</h3>
        <p className="text-gray-600 mb-4">{error || 'Tenant not found'}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tenants
          </Button>
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
            <p className="text-gray-600">{tenant.subdomain}.yourdomain.com</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={tenant.is_active ? 'default' : 'destructive'}>
            {tenant.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <Badge variant="outline">{tenant.subscription_tier}</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://${tenant.subdomain}.yourdomain.com`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Store
          </Button>
          <Button
            variant={tenant.is_active ? 'destructive' : 'default'}
            size="sm"
            onClick={handleToggleStatus}
          >
            {tenant.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant.products_count}</div>
            <p className="text-xs text-muted-foreground">
              {tenant.categories_count} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant.orders_count}</div>
            <p className="text-xs text-muted-foreground">
              Total orders placed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant.customers_count}</div>
            <p className="text-xs text-muted-foreground">
              Registered customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${tenant.total_revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${tenant.monthly_revenue.toFixed(2)} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Tenant Information */}
            <Card>
              <CardHeader>
                <CardTitle>Tenant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Domain</p>
                    <p className="text-sm text-gray-600">
                      {tenant.domain || `${tenant.subdomain}.yourdomain.com`}
                    </p>
                  </div>
                </div>

                {tenant.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Contact Email</p>
                      <p className="text-sm text-gray-600">{tenant.contact_email}</p>
                    </div>
                  </div>
                )}

                {tenant.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Contact Phone</p>
                      <p className="text-sm text-gray-600">{tenant.contact_phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(tenant.created_at), 'PPP')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(tenant.updated_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Details */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Current Plan</p>
                  <Badge variant="outline" className="mt-1">
                    {tenant.subscription_tier}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge 
                    variant={tenant.is_active ? 'default' : 'destructive'}
                    className="mt-1"
                  >
                    {tenant.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium">Monthly Revenue</p>
                  <p className="text-xl font-bold text-green-600">
                    ${tenant.monthly_revenue.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Total Revenue</p>
                  <p className="text-xl font-bold">
                    ${tenant.total_revenue.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from this tenant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.order_number}
                        </TableCell>
                        <TableCell>{order.customer_email}</TableCell>
                        <TableCell>${order.total_price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.created_at), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {recentOrders.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No orders found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best performing products by sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.orders_count} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${product.revenue}</p>
                      <p className="text-sm text-gray-500">Revenue</p>
                    </div>
                  </div>
                ))}
                
                {topProducts.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No product data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Settings</CardTitle>
              <CardDescription>Configuration and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Raw Settings Data</p>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(tenant.settings || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}