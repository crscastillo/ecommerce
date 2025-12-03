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
    
    const methods = await PaymentMethodsService.getPaymentMethodsConfig(tenantId, tier)
    
    
    return NextResponse.json({ 
      tenant_id: tenantId,
      tier,
      payment_methods: methods,
      total_methods: methods.length
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}