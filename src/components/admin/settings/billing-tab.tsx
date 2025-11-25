'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useTenant } from '@/lib/contexts/tenant-context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { 
  CreditCard, 
  Check, 
  Crown, 
  Zap, 
  Shield, 
  Rocket,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

interface Plan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  recommended?: boolean
  stripePriceId: string
  icon: React.ReactNode
}

interface Subscription {
  id: string
  plan_id: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

interface BillingTabProps {
  saving?: boolean
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    interval: 'month',
    stripePriceId: 'price_starter_free',
    icon: <Rocket className="h-6 w-6" />,
    features: [
      'Up to 100 products',
      'Basic store customization',
      'Standard payment methods',
      'Basic analytics',
      'Email support'
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 29,
    interval: 'month',
    stripePriceId: 'price_pro_monthly',
    icon: <Crown className="h-6 w-6" />,
    recommended: true,
    features: [
      'Unlimited products',
      'Advanced customization',
      'All payment methods',
      'Advanced analytics',
      'WhatsApp integration',
      'Low stock alerts',
      'Priority support',
      'Custom domain'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    stripePriceId: 'price_enterprise_monthly',
    icon: <Zap className="h-6 w-6" />,
    features: [
      'Everything in Professional',
      'Multi-store management',
      'Advanced integrations',
      'Custom plugins',
      'Dedicated support',
      'SLA guarantee',
      'Advanced reporting',
      'White-label solution'
    ]
  }
]

export function BillingTab({ saving = false }: BillingTabProps) {
  const t = useTranslations('settings')
  const { tenant } = useTenant()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  useEffect(() => {
    if (tenant) {
      loadSubscription()
    }
  }, [tenant])

  const loadSubscription = async () => {
    if (!tenant) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('status', 'active')
        .single()

      if (data) {
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    if (!tenant) return

    setUpgrading(true)
    setSelectedPlan(planId)

    try {
      const plan = plans.find(p => p.id === planId)
      if (!plan) throw new Error('Plan not found')

      // Free plan - no payment needed
      if (plan.price === 0) {
        await updateTenantPlan(planId)
        return
      }

      // Create Stripe checkout session
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          tenantId: tenant.id,
          successUrl: `${window.location.origin}/admin/settings?tab=billing&success=true`,
          cancelUrl: `${window.location.origin}/admin/settings?tab=billing&canceled=true`,
        }),
      })

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      if (stripe) {
        // @ts-ignore - redirectToCheckout exists but TypeScript types may be outdated
        const result = await stripe.redirectToCheckout({ sessionId })
        if (result?.error) {
          throw new Error(result.error.message)
        }
      }

    } catch (error) {
      console.error('Error upgrading plan:', error)
      alert('Failed to process upgrade. Please try again.')
    } finally {
      setUpgrading(false)
      setSelectedPlan('')
    }
  }

  const updateTenantPlan = async (planId: string) => {
    if (!tenant) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('tenants')
        .update({ plan: planId })
        .eq('id', tenant.id)

      if (!error) {
        // Refresh tenant data
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating plan:', error)
    }
  }

  const cancelSubscription = async () => {
    if (!subscription) return

    if (confirm(t('billing.cancelConfirmation', { 
      defaultMessage: 'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.' 
    }))) {
      try {
        await fetch('/api/billing/cancel-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscriptionId: subscription.id,
          }),
        })

        await loadSubscription()
      } catch (error) {
        console.error('Error canceling subscription:', error)
        alert(t('billing.cancelError', { 
          defaultMessage: 'Failed to cancel subscription. Please contact support.' 
        }))
      }
    }
  }

  const getCurrentPlan = () => {
    const planId = tenant?.subscription_tier || (tenant?.settings as any)?.plan || 'starter'
    return plans.find(p => p.id === planId) || plans[0]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentPlan = getCurrentPlan()

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            {t('billing.currentPlan', { defaultMessage: 'Current Plan' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                {currentPlan.icon}
              </div>
              <div>
                <h3 className="font-medium text-lg">{currentPlan.name}</h3>
                <p className="text-gray-600">
                  ${currentPlan.price}/{currentPlan.interval}
                </p>
              </div>
            </div>
            <div className="text-right">
              {subscription ? (
                <div>
                  <Badge 
                    variant={subscription.status === 'active' ? 'default' : 'destructive'}
                    className="mb-2"
                  >
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    {subscription.cancel_at_period_end 
                      ? t('billing.cancelsOn', { defaultMessage: 'Cancels on' })
                      : t('billing.renewsOn', { defaultMessage: 'Renews on' })
                    }{' '}
                    {formatDate(subscription.current_period_end)}
                  </p>
                </div>
              ) : (
                <Badge variant="outline">
                  {t('billing.freePlan', { defaultMessage: 'Free Plan' })}
                </Badge>
              )}
            </div>
          </div>

          {subscription && subscription.status === 'active' && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {subscription.cancel_at_period_end ? (
                    <span className="flex items-center text-orange-600">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {t('billing.subscriptionWillCancel', { 
                        defaultMessage: 'Subscription will cancel at period end' 
                      })}
                    </span>
                  ) : (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {t('billing.activeSubscription', { 
                        defaultMessage: 'Active subscription' 
                      })}
                    </span>
                  )}
                </span>
                {!subscription.cancel_at_period_end && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={cancelSubscription}
                    disabled={saving}
                  >
                    {t('billing.cancelSubscription', { 
                      defaultMessage: 'Cancel Subscription' 
                    })}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-6">
          {t('billing.choosePlan', { defaultMessage: 'Choose Your Plan' })}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan.id
            const isUpgrade = plan.price > currentPlan.price

            return (
              <Card 
                key={plan.id} 
                className={`relative ${
                  plan.recommended ? 'border-blue-500 shadow-lg' : ''
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500">
                      {t('billing.recommended', { defaultMessage: 'Recommended' })}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-lg ${
                      plan.id === 'starter' ? 'bg-gray-100' :
                      plan.id === 'pro' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {plan.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-lg font-normal text-gray-600">/{plan.interval}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? 'outline' : 'default'}
                    disabled={isCurrentPlan || upgrading || saving}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {upgrading && selectedPlan === plan.id ? (
                      t('billing.processing', { defaultMessage: 'Processing...' })
                    ) : isCurrentPlan ? (
                      t('billing.currentPlan', { defaultMessage: 'Current Plan' })
                    ) : isUpgrade ? (
                      t('billing.upgradeNow', { defaultMessage: 'Upgrade Now' })
                    ) : (
                      t('billing.downgrade', { defaultMessage: 'Downgrade' })
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Billing Information */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('billing.billingInformation', { defaultMessage: 'Billing Information' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">
                    {t('billing.billingPeriod', { defaultMessage: 'Billing Period' })}
                  </Label>
                  <p className="font-medium">
                    {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">
                    {t('billing.nextPayment', { defaultMessage: 'Next Payment' })}
                  </Label>
                  <p className="font-medium">
                    {subscription.cancel_at_period_end 
                      ? t('billing.cancelled', { defaultMessage: 'N/A (Cancelled)' })
                      : formatDate(subscription.current_period_end)
                    }
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {t('billing.updatePaymentMethod', { 
                    defaultMessage: 'Need to update your payment method?' 
                  })}
                </span>
                <Button variant="outline" size="sm" disabled={saving}>
                  {t('billing.managePaymentMethods', { 
                    defaultMessage: 'Manage Payment Methods' 
                  })}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('billing.faq', { defaultMessage: 'Frequently Asked Questions' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">
              {t('billing.faqChangePlans', { 
                defaultMessage: 'Can I change plans anytime?' 
              })}
            </h4>
            <p className="text-sm text-gray-600">
              {t('billing.faqChangePlansAnswer', { 
                defaultMessage: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated.' 
              })}
            </p>
          </div>
          <div>
            <h4 className="font-medium">
              {t('billing.faqCancel', { 
                defaultMessage: 'What happens if I cancel?' 
              })}
            </h4>
            <p className="text-sm text-gray-600">
              {t('billing.faqCancelAnswer', { 
                defaultMessage: "You'll retain access to paid features until the end of your billing period, then automatically downgrade to the free plan." 
              })}
            </p>
          </div>
          <div>
            <h4 className="font-medium">
              {t('billing.faqRefunds', { 
                defaultMessage: 'Do you offer refunds?' 
              })}
            </h4>
            <p className="text-sm text-gray-600">
              {t('billing.faqRefundsAnswer', { 
                defaultMessage: 'We offer a 30-day money-back guarantee for new subscriptions. Contact support for assistance.' 
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}