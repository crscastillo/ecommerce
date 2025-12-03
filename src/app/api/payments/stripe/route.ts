import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      amount, 
      currency = 'usd', 
      payment_method_id, 
      tenant_id,
      order_data 
    } = body

    if (!tenant_id || !payment_method_id || !amount) {
      return NextResponse.json({ 
        error: 'Missing required fields: tenant_id, payment_method_id, amount' 
      }, { status: 400 })
    }

    // Get tenant's Stripe configuration
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: paymentSettings } = await supabase
      .from('tenant_payment_settings')
      .select('payment_methods')
      .eq('tenant_id', tenant_id)
      .single()

    const stripeConfig = paymentSettings?.payment_methods?.find(
      (method: any) => method.id === 'stripe' && method.enabled
    )

    if (!stripeConfig?.keys?.secretKey) {
      return NextResponse.json({ 
        error: 'Stripe not configured for this tenant' 
      }, { status: 400 })
    }

    // Initialize Stripe with tenant's secret key
    const stripe = new Stripe(stripeConfig.keys.secretKey, {
      apiVersion: '2025-10-29.clover'
    })

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      payment_method: payment_method_id,
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-confirmation`,
      metadata: {
        tenant_id,
        order_data: JSON.stringify(order_data)
      }
    })

    if (paymentIntent.status === 'succeeded') {
      return NextResponse.json({
        success: true,
        payment_intent: paymentIntent,
        status: 'succeeded'
      })
    } else if (paymentIntent.status === 'requires_action') {
      return NextResponse.json({
        requires_action: true,
        payment_intent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret
        }
      })
    } else {
      return NextResponse.json({
        error: 'Payment failed',
        status: paymentIntent.status
      }, { status: 400 })
    }

  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Payment processing failed'
    }, { status: 500 })
  }
}