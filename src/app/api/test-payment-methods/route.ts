import { NextRequest, NextResponse } from 'next/server'
import { PaymentMethodsService } from '@/lib/services/payment-methods'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('tenant_id')
  const tier = searchParams.get('tier') as 'basic' | 'pro' | 'enterprise' || 'pro'

  if (!tenantId) {
    return NextResponse.json({ error: 'tenant_id is required' }, { status: 400 })
  }

  try {
    console.log(`Testing payment methods for tenant ${tenantId} with tier ${tier}`)
    
    const methods = await PaymentMethodsService.getPaymentMethodsConfig(tenantId, tier)
    
    console.log('Payment methods loaded:', methods.map(m => ({ id: m.id, name: m.name, enabled: m.enabled })))
    
    return NextResponse.json({ 
      tenant_id: tenantId,
      tier,
      payment_methods: methods,
      total_methods: methods.length
    })
  } catch (error) {
    console.error('Error testing payment methods:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}