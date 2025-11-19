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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  User,
  ShoppingBag,
  DollarSign,
  Package,
  CreditCard,
  Eye
} from 'lucide-react'
import Link from 'next/link'

type Customer = Database['public']['Tables']['customers']['Row']
type Order = Database['public']['Tables']['orders']['Row']

export default function CustomerDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { tenant } = useTenant()
  const t = useTranslations('clients')
  const tOrders = useTranslations('orders')
  const tCommon = useTranslations('common')
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (tenant?.id && params.id) {
      loadCustomer()
      loadCustomerOrders()
    }
  }, [tenant?.id, params.id])

  const loadCustomer = async () => {
    try {
      setLoading(true)
      
      if (!tenant?.id) {
        setLoading(false)
        return
      }
      
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', params.id)
        .eq('tenant_id', tenant.id)
        .single()

      if (error) {
        console.error('Error loading customer:', error)
        if (error.code === 'PGRST116') {
          router.push('/admin/clients')
        }
        return
      }

      setCustomer(customer)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomerOrders = async () => {
    try {
      setOrdersLoading(true)
      
      if (!tenant?.id || !customer?.email) {
        setOrdersLoading(false)
        return
      }
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('email', customer.email)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading customer orders:', error)
        return
      }

      setOrders(orders || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  // Re-load orders when customer data is available
  useEffect(() => {
    if (customer?.email && tenant?.id) {
      loadCustomerOrders()
    }
  }, [customer?.email, tenant?.id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const getStatusBadge = (status: string, type: 'financial' | 'fulfillment') => {
    const variants = {
      financial: {
        pending: 'secondary',
        paid: 'default',
        refunded: 'outline',
        cancelled: 'destructive'
      },
      fulfillment: {
        unfulfilled: 'secondary',
        fulfilled: 'default',
        partial: 'outline',
        cancelled: 'destructive'
      }
    }

    const colors = variants[type] as any
    const variant = colors[status] || 'secondary'

    const translationKey = type === 'financial' ? 'paymentStatus' : 'fulfillmentStatus'

    return (
      <Badge variant={variant as any}>
        {tOrders(`${translationKey}.${status}`)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <User className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium">{t('customerNotFound')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('customerNotFoundDescription')}
          </p>
          <Button className="mt-4" asChild>
            <Link href="/admin/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToCustomers')}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {customer.first_name || customer.last_name 
                ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                : t('unnamedCustomer')
              }
            </h1>
            <p className="text-muted-foreground">
              {t('customerProfile')}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/clients/${customer.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            {t('editCustomer')}
          </Link>
        </Button>
      </div>

      {/* Customer Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalOrders')}
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.orders_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {customer.last_order_date 
                ? `${t('lastOrder')}: ${formatDate(customer.last_order_date)}`
                : t('noOrdersYet')
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalSpent')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(customer.total_spent || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {customer.orders_count && customer.orders_count > 0 
                ? `${t('averageOrder')}: ${formatCurrency((customer.total_spent || 0) / customer.orders_count)}`
                : t('noSpendingHistory')
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('accountStatus')}
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant={customer.user_id ? "default" : "secondary"} className="text-sm">
                {customer.user_id ? t('registered') : t('guest')}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {t('memberSince')}: {formatDate(customer.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('personalInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">{t('fullName')}</div>
                <div>
                  {customer.first_name || customer.last_name 
                    ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                    : t('notProvided')
                  }
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">{t('email')}</div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
              </div>
              
              {customer.phone && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">{t('phone')}</div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">{t('joinDate')}</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(customer.created_at)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account & Marketing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('accountMarketing')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">{t('accountType')}</div>
                <Badge variant={customer.user_id ? "default" : "secondary"}>
                  {customer.user_id ? t('registered') : t('guest')}
                </Badge>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">{t('marketingEmails')}</div>
                <Badge variant={customer.accepts_marketing ? "default" : "outline"}>
                  {customer.accepts_marketing ? t('subscribed') : t('unsubscribed')}
                </Badge>
              </div>
              
              {customer.tags && customer.tags.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">{t('tags')}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {customer.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">{t('lastUpdate')}</div>
                <div>{formatDate(customer.updated_at)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Notes */}
      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>{t('customerNotes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{customer.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Customer Addresses */}
      {customer.addresses && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t('addresses')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-muted-foreground">
              {JSON.stringify(customer.addresses, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('orderHistory')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">{tCommon('loading')}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">{t('noOrders')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('noOrdersDescription')}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tOrders('orderNumber')}</TableHead>
                  <TableHead>{tOrders('date')}</TableHead>
                  <TableHead>{tOrders('paymentStatus')}</TableHead>
                  <TableHead>{tOrders('fulfillmentStatus')}</TableHead>
                  <TableHead>{tOrders('total')}</TableHead>
                  <TableHead className="text-right">{tCommon('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      #{order.order_number || order.id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.financial_status || 'pending', 'financial')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.fulfillment_status || 'unfulfilled', 'fulfillment')}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(order.total_price || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}