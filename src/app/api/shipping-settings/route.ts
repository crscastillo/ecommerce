import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenant_id, shipping_methods } = body

    if (!tenant_id) {
      return NextResponse.json({ error: 'tenant_id is required' }, { status: 400 })
    }

    if (!shipping_methods || !Array.isArray(shipping_methods)) {
      return NextResponse.json({ error: 'shipping_methods array is required' }, { status: 400 })
    }

    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
    
    console.log('API: Saving shipping methods for tenant:', tenant_id)
    
    // First check if record exists
    const { data: existing } = await supabase
      .from('tenant_shipping_settings')
      .select('id')
      .eq('tenant_id', tenant_id)
      .single()
    
    let data, error
    
    if (existing) {
      // Update existing record
      const result = await supabase
        .from('tenant_shipping_settings')
        .update({
          shipping_methods,
          updated_at: new Date().toISOString()
        })
        .eq('tenant_id', tenant_id)
        .select()
        .single()
      
      data = result.data
      error = result.error
    } else {
      // Insert new record
      const result = await supabase
        .from('tenant_shipping_settings')
        .insert({
          tenant_id,
          shipping_methods
        })
        .select()
        .single()
      
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Shipping settings save error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('API: Shipping settings saved successfully')
    return NextResponse.json({ 
      message: 'Shipping settings saved successfully',
      data 
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenant_id')

    if (!tenantId) {
      return NextResponse.json({ error: 'tenant_id is required' }, { status: 400 })
    }

    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    console.log('API: Fetching shipping settings for tenant:', tenantId)

    const { data, error } = await supabase
      .from('tenant_shipping_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found, return default shipping methods
        console.log('API: No shipping settings found, returning defaults')
        return NextResponse.json({
          shipping_methods: [
            {
              id: 'weight_based_default',
              name: 'Weight Based Shipping',
              description: 'Shipping cost calculated based on package weight',
              enabled: true,
              type: 'weight_based',
              config: {
                base_rate: 5.00,
                per_kg_rate: 2.00,
                free_threshold: 100.00,
                max_weight: 30
              }
            }
          ]
        })
      }
      
      console.error('API Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('API: Returning shipping settings:', data ? 'found' : 'not found')
    return NextResponse.json({
      shipping_methods: data?.shipping_methods || []
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}