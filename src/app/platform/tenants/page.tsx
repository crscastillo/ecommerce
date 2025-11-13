'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Building2, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit,
  Trash2,
  ExternalLink,
  AlertCircle,
  Users,
  DollarSign
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface Tenant {
  id: string
  name: string
  subdomain: string
  domain?: string
  contact_email?: string
  subscription_tier: string
  is_active: boolean
  created_at: string
  updated_at: string
  owner_id: string
  // Additional computed fields
  products_count?: number
  orders_count?: number
  monthly_revenue?: number
  last_activity?: string
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [tierFilter, setTierFilter] = useState<'all' | 'basic' | 'pro' | 'enterprise'>('all')

  const supabase = createClient()

  useEffect(() => {
    loadTenants()
  }, [])

  useEffect(() => {
    filterTenants()
  }, [tenants, searchTerm, statusFilter, tierFilter])

  const loadTenants = async () => {
    try {
      setLoading(true)
      setError('')

      // Get all tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false })

      if (tenantsError) throw tenantsError

      // For each tenant, get additional metrics
      const enrichedTenants = await Promise.all(
        (tenantsData || []).map(async (tenant) => {
          try {
            // Get products count
            const { count: productsCount } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('tenant_id', tenant.id)

            // Get orders count
            const { count: ordersCount } = await supabase
              .from('orders')
              .select('*', { count: 'exact', head: true })
              .eq('tenant_id', tenant.id)

            // Get recent order for last activity
            const { data: recentOrder } = await supabase
              .from('orders')
              .select('created_at')
              .eq('tenant_id', tenant.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            return {
              ...tenant,
              products_count: productsCount || 0,
              orders_count: ordersCount || 0,
              monthly_revenue: (ordersCount || 0) * 50, // Mock calculation
              last_activity: recentOrder?.created_at || tenant.updated_at
            }
          } catch (err) {
            console.warn(`Failed to load metrics for tenant ${tenant.id}:`, err)
            return {
              ...tenant,
              products_count: 0,
              orders_count: 0,
              monthly_revenue: 0,
              last_activity: tenant.updated_at
            }
          }
        })
      )

      setTenants(enrichedTenants)

    } catch (err: any) {
      console.error('Error loading tenants:', err)
      setError(err.message || 'Failed to load tenants')
    } finally {
      setLoading(false)
    }
  }

  const filterTenants = () => {
    let filtered = [...tenants]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tenant => 
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tenant => 
        statusFilter === 'active' ? tenant.is_active : !tenant.is_active
      )
    }

    // Tier filter
    if (tierFilter !== 'all') {
      filtered = filtered.filter(tenant => tenant.subscription_tier === tierFilter)
    }

    setFilteredTenants(filtered)
  }

  const handleToggleStatus = async (tenantId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ is_active: !currentStatus })
        .eq('id', tenantId)

      if (error) throw error

      // Update local state
      setTenants(tenants.map(t => 
        t.id === tenantId ? { ...t, is_active: !currentStatus } : t
      ))
    } catch (err: any) {
      console.error('Error updating tenant status:', err)
      alert('Failed to update tenant status')
    }
  }

  const getSubscriptionBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'default'
      case 'pro': return 'secondary'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Tenants</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadTenants}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600">Manage all platform tenants and their subscriptions</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">{filteredTenants.length} tenants</Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tenants by name, subdomain, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('inactive')}
                size="sm"
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
          <CardDescription>
            Overview of all registered tenants and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Metrics</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-sm text-gray-500">
                            {tenant.subdomain}.yourdomain.com
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={getSubscriptionBadgeVariant(tenant.subscription_tier)}>
                        {tenant.subscription_tier}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={tenant.is_active ? 'default' : 'destructive'}>
                        {tenant.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-gray-400" />
                          {tenant.products_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          {tenant.orders_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-gray-400" />
                          ${tenant.monthly_revenue}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-sm text-gray-500">
                      {tenant.last_activity ? formatDistanceToNow(new Date(tenant.last_activity), { addSuffix: true }) : '-'}
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/platform/tenants/${tenant.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => window.open(`https://${tenant.subdomain}.yourdomain.com`, '_blank')}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Visit Store
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(tenant.id, tenant.is_active)}
                          >
                            {tenant.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredTenants.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search criteria' : 'No tenants have been created yet'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}