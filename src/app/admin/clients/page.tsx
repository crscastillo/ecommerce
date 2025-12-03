'use client'

import { useState, useEffect } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import {
  CustomerStatsCards,
  CustomerFilters,
  CustomersTable,
  CustomerDetailsModal,
  CustomerStats
} from '@/components/admin/customers'

type Customer = Database['public']['Tables']['customers']['Row']

export default function CustomersPage() {
  const { tenant } = useTenant()
  const t = useTranslations('clients')
  const tCommon = useTranslations('common')
  
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    withOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [marketingFilter, setMarketingFilter] = useState<string>('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (tenant?.id) {
      loadCustomers()
      loadStats()
    }
  }, [tenant?.id, searchTerm, statusFilter, marketingFilter])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      
      if (!tenant?.id) {
        setLoading(false)
        return
      }

      let query = supabase
        .from('customers')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
      }

      if (statusFilter === 'registered') {
        query = query.not('user_id', 'is', null)
      } else if (statusFilter === 'guest') {
        query = query.is('user_id', null)
      }

      if (marketingFilter === 'subscribed') {
        query = query.eq('accepts_marketing', true)
      } else if (marketingFilter === 'unsubscribed') {
        query = query.eq('accepts_marketing', false)
      }

      const { data, error } = await query

      if (error) {
        return
      }

      setCustomers(data || [])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      if (!tenant?.id) return

      const { data: customerData, error } = await supabase
        .from('customers')
        .select('orders_count, total_spent')
        .eq('tenant_id', tenant.id)

      if (error) {
        return
      }

      const total = customerData?.length || 0
      const withOrders = customerData?.filter(c => (c.orders_count || 0) > 0).length || 0
      const totalSpent = customerData?.reduce((sum, c) => sum + (c.total_spent || 0), 0) || 0
      const averageOrderValue = withOrders > 0 ? totalSpent / withOrders : 0

      setStats({
        total,
        withOrders,
        totalSpent,
        averageOrderValue
      })
    } catch (error) {
    }
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDetails(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('addCustomer')}
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <CustomerStatsCards stats={stats} loading={loading} />

      {/* Filters */}
      <CustomerFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        marketingFilter={marketingFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onMarketingFilterChange={setMarketingFilter}
      />

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <CustomersTable
            customers={customers}
            loading={loading}
            onViewCustomer={handleViewCustomer}
          />
        </CardContent>
      </Card>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </div>
  )
}