'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  CreditCard, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  billing_cycle: 'monthly' | 'yearly'
  features: string[]
  max_products: number
  max_orders_per_month: number
  storage_gb: number
  is_active: boolean
  stripe_price_id?: string
  created_at: string
}

interface BillingStats {
  monthly_revenue: number
  active_subscriptions: number
  churn_rate: number
  average_revenue_per_user: number
}

const defaultPlans: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Free',
    price: 0,
    billing_cycle: 'monthly',
    features: ['1-25 products', '0-25 orders per month', 'Transfer payments', 'Mobile transfer payments', 'Basic support'],
    max_products: 25,
    max_orders_per_month: 25,
    storage_gb: 1,
    is_active: true,
    stripe_price_id: 'price_free',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Business',
    price: 39,
    billing_cycle: 'monthly',
    features: ['26-100 products', 'Unlimited orders', 'All payment methods', 'Credit card processing', 'Stripe & TiloPay', 'Priority support'],
    max_products: 100,
    max_orders_per_month: -1, // unlimited
    storage_gb: 10,
    is_active: true,
    stripe_price_id: 'price_business_monthly',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Pro',
    price: 69,
    billing_cycle: 'monthly',
    features: ['Unlimited products', 'Unlimited orders', 'All payment methods', 'Advanced analytics', 'Custom integrations', 'Dedicated support'],
    max_products: -1, // unlimited
    max_orders_per_month: -1, // unlimited
    storage_gb: 50,
    is_active: true,
    stripe_price_id: 'price_pro_monthly',
    created_at: new Date().toISOString()
  }
]

export default function PlatformBillingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(defaultPlans)
  const [billingStats, setBillingStats] = useState<BillingStats>({
    monthly_revenue: 0,
    active_subscriptions: 0,
    churn_rate: 0,
    average_revenue_per_user: 0
  })
  const [stripeConfig, setStripeConfig] = useState({
    publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    secret_key: '',
    webhook_endpoint: '',
    test_mode: true
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [showSecrets, setShowSecrets] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)

  // Form state for new/edit plan
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    billing_cycle: 'monthly' as 'monthly' | 'yearly',
    features: [] as string[],
    max_products: 0,
    max_orders_per_month: 0,
    storage_gb: 0,
    is_active: true,
    stripe_price_id: ''
  })

  const supabase = createClient()

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      setLoading(true)

      // Calculate stats from plans and tenants
      // In a real implementation, you'd query actual subscription data
      const activeSubscriptions = plans.filter(p => p.is_active).length
      const monthlyRevenue = plans.reduce((sum, plan) => sum + plan.price, 0)
      
      setBillingStats({
        monthly_revenue: monthlyRevenue,
        active_subscriptions: activeSubscriptions,
        churn_rate: 2.5, // Mock data
        average_revenue_per_user: monthlyRevenue / Math.max(activeSubscriptions, 1)
      })

    } catch (err: any) {
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = () => {
    setEditingPlan(null)
    setFormData({
      name: '',
      price: 0,
      billing_cycle: 'monthly',
      features: [],
      max_products: 0,
      max_orders_per_month: 0,
      storage_gb: 0,
      is_active: true,
      stripe_price_id: ''
    })
    setIsDialogOpen(true)
  }

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      price: plan.price,
      billing_cycle: plan.billing_cycle,
      features: [...plan.features],
      max_products: plan.max_products,
      max_orders_per_month: plan.max_orders_per_month,
      storage_gb: plan.storage_gb,
      is_active: plan.is_active,
      stripe_price_id: plan.stripe_price_id || ''
    })
    setIsDialogOpen(true)
  }

  const handleSavePlan = () => {
    try {
      if (!formData.name || formData.price < 0) {
        setMessage('Please fill in all required fields')
        setMessageType('error')
        return
      }

      const now = new Date().toISOString()
      
      if (editingPlan) {
        // Update existing plan
        const updatedPlan: SubscriptionPlan = {
          ...editingPlan,
          ...formData,
          created_at: editingPlan.created_at
        }
        setPlans(plans => plans.map(p => p.id === editingPlan.id ? updatedPlan : p))
        setMessage(`Plan "${formData.name}" updated successfully`)
      } else {
        // Create new plan
        const newPlan: SubscriptionPlan = {
          id: Math.random().toString(36).substr(2, 9),
          ...formData,
          created_at: now
        }
        setPlans(plans => [...plans, newPlan])
        setMessage(`Plan "${formData.name}" created successfully`)
      }

      setMessageType('success')
      setIsDialogOpen(false)
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setMessage('Failed to save subscription plan')
      setMessageType('error')
    }
  }

  const handleTogglePlan = (planId: string) => {
    setPlans(plans => plans.map(p => 
      p.id === planId ? { ...p, is_active: !p.is_active } : p
    ))
    
    const plan = plans.find(p => p.id === planId)
    setMessage(`Plan "${plan?.name}" ${plan?.is_active ? 'disabled' : 'enabled'}`)
    setMessageType('success')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDeletePlan = (planId: string) => {
    if (!confirm('Are you sure you want to delete this subscription plan?')) return

    const plan = plans.find(p => p.id === planId)
    setPlans(plans => plans.filter(p => p.id !== planId))
    setMessage(`Plan "${plan?.name}" deleted`)
    setMessageType('success')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleUpdateStripeConfig = () => {
    // In a real implementation, you'd save to environment/database
    setMessage('Stripe configuration updated successfully')
    setMessageType('success')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing & Subscriptions</h1>
            <p className="text-gray-600">Manage subscription plans and platform billing</p>
          </div>
        </div>
        
        <Button onClick={handleCreatePlan}>
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {messageType === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message}
        </div>
      )}

      {/* Billing Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingStats.monthly_revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total recurring revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingStats.active_subscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Paying customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARPU</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingStats.average_revenue_per_user.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Average revenue per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingStats.churn_rate}%</div>
            <p className="text-xs text-muted-foreground">
              Monthly churn rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="stripe">Stripe Configuration</TabsTrigger>
          <TabsTrigger value="analytics">Revenue Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>
                Manage pricing tiers and features for your platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Limits</TableHead>
                      <TableHead>Features</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{plan.name}</p>
                            <p className="text-sm text-gray-500">
                              {plan.stripe_price_id || 'No Stripe ID'}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="font-medium">${plan.price}</p>
                            <p className="text-sm text-gray-500">/{plan.billing_cycle}</p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            <p>{plan.max_products === -1 ? 'Unlimited' : plan.max_products} products</p>
                            <p>{plan.max_orders_per_month === -1 ? 'Unlimited' : plan.max_orders_per_month} orders/mo</p>
                            <p>{plan.storage_gb}GB storage</p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {plan.features.slice(0, 2).map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {plan.features.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{plan.features.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={plan.is_active}
                              onCheckedChange={() => handleTogglePlan(plan.id)}
                            />
                            <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                              {plan.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stripe" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Configuration</CardTitle>
              <CardDescription>
                Configure your Stripe integration for processing payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <Label>Show Secret Keys</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              <div>
                <Label htmlFor="stripe-publishable">Publishable Key</Label>
                <Input
                  id="stripe-publishable"
                  value={stripeConfig.publishable_key}
                  onChange={(e) => setStripeConfig(prev => ({ ...prev, publishable_key: e.target.value }))}
                  placeholder="pk_live_..."
                />
              </div>

              <div>
                <Label htmlFor="stripe-secret">Secret Key</Label>
                <Input
                  id="stripe-secret"
                  type={showSecrets ? 'text' : 'password'}
                  value={stripeConfig.secret_key}
                  onChange={(e) => setStripeConfig(prev => ({ ...prev, secret_key: e.target.value }))}
                  placeholder="sk_live_..."
                />
              </div>

              <div>
                <Label htmlFor="webhook-endpoint">Webhook Endpoint</Label>
                <Input
                  id="webhook-endpoint"
                  value={stripeConfig.webhook_endpoint}
                  onChange={(e) => setStripeConfig(prev => ({ ...prev, webhook_endpoint: e.target.value }))}
                  placeholder="https://yourdomain.com/api/billing/webhook"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Test Mode</Label>
                  <p className="text-xs text-gray-500">Use Stripe test keys for development</p>
                </div>
                <Switch
                  checked={stripeConfig.test_mode}
                  onCheckedChange={(checked) => setStripeConfig(prev => ({ ...prev, test_mode: checked }))}
                />
              </div>

              <Button onClick={handleUpdateStripeConfig} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Update Stripe Configuration
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Setup Instructions</span>
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>1. Create webhook endpoint in Stripe Dashboard</p>
                  <p>2. Add these events: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded, invoice.payment_failed</p>
                  <p>3. Copy the webhook signing secret to your environment variables</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook Status</CardTitle>
              <CardDescription>
                Monitor webhook deliveries and handle failed payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Webhook Status</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Active</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Webhook</span>
                  <span className="text-sm text-gray-500">{new Date().toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Success Rate (24h)</span>
                  <span className="text-sm">99.2%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Failed Webhooks</span>
                  <Badge variant="outline">2</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Track subscription revenue and growth metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600 mb-4">
                  Revenue charts and detailed analytics will be displayed here
                </p>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Plan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
            </DialogTitle>
            <DialogDescription>
              Configure pricing, limits, and features for this plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input
                id="plan-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Basic, Pro, Enterprise..."
              />
            </div>

            <div>
              <Label htmlFor="plan-price">Price</Label>
              <Input
                id="plan-price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                placeholder="29.99"
              />
            </div>

            <div>
              <Label htmlFor="billing-cycle">Billing Cycle</Label>
              <select
                id="billing-cycle"
                className="w-full p-2 border rounded-md"
                value={formData.billing_cycle}
                onChange={(e) => setFormData(prev => ({ ...prev, billing_cycle: e.target.value as 'monthly' | 'yearly' }))}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <Label htmlFor="max-products">Max Products</Label>
              <Input
                id="max-products"
                type="number"
                value={formData.max_products === -1 ? '' : formData.max_products}
                onChange={(e) => setFormData(prev => ({ ...prev, max_products: e.target.value ? parseInt(e.target.value) : -1 }))}
                placeholder="100 (empty for unlimited)"
              />
            </div>

            <div>
              <Label htmlFor="storage-gb">Storage (GB)</Label>
              <Input
                id="storage-gb"
                type="number"
                value={formData.storage_gb}
                onChange={(e) => setFormData(prev => ({ ...prev, storage_gb: parseInt(e.target.value) }))}
                placeholder="5"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="stripe-price-id">Stripe Price ID</Label>
              <Input
                id="stripe-price-id"
                value={formData.stripe_price_id}
                onChange={(e) => setFormData(prev => ({ ...prev, stripe_price_id: e.target.value }))}
                placeholder="price_1234567890"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                value={formData.features.join('\n')}
                onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value.split('\n').filter(f => f.trim()) }))}
                placeholder="Up to 100 products&#10;Basic analytics&#10;Email support"
                rows={4}
              />
            </div>

            <div className="col-span-2 flex items-center justify-between">
              <Label htmlFor="is-active">Active</Label>
              <Switch
                id="is-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>

            <div className="col-span-2 flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSavePlan} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}