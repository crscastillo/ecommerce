import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = await createClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const tenantId = session.metadata?.tenantId

          if (tenantId) {
            // Update tenant plan
            const planId = getPlanIdFromPriceId(subscription.items.data[0].price.id)
            
            await supabase
              .from('tenants')
              .update({ 
                plan: planId,
                stripe_customer_id: session.customer as string 
              })
              .eq('id', tenantId)

            // Create subscription record
            await supabase
              .from('subscriptions')
              .upsert({
                id: subscription.id,
                tenant_id: tenantId,
                stripe_subscription_id: subscription.id,
                plan_id: planId,
                status: subscription.status,
                current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
                current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                cancel_at_period_end: (subscription as any).cancel_at_period_end,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any // Stripe.Invoice with subscription
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string) as any
          
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any // Stripe.Invoice with subscription
        
        if (invoice.subscription) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', invoice.subscription as string)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any // Stripe.Subscription
        
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find tenant and downgrade to free plan
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('tenant_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (subscriptionData) {
          await supabase
            .from('tenants')
            .update({ plan: 'starter' })
            .eq('id', subscriptionData.tenant_id)

          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

function getPlanIdFromPriceId(priceId: string): string {
  const priceIdMap: Record<string, string> = {
    'price_starter_free': 'starter',
    'price_pro_monthly': 'pro',
    'price_enterprise_monthly': 'enterprise'
  }
  
  return priceIdMap[priceId] || 'starter'
}