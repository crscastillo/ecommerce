import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenant_id, payment_methods } = body

    if (!tenant_id) {
      return NextResponse.json({ error: 'tenant_id is required' }, { status: 400 })
    }

    if (!payment_methods || !Array.isArray(payment_methods)) {
      return NextResponse.json({ error: 'payment_methods array is required' }, { status: 400 })
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
    
    
    // First check if record exists
    const { data: existing } = await supabase
      .from('tenant_payment_settings')
      .select('id')
      .eq('tenant_id', tenant_id)
      .single()
    
    let data, error
    
    if (existing) {
      // Update existing record
      const result = await supabase
        .from('tenant_payment_settings')
        .update({
          payment_methods,
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
        .from('tenant_payment_settings')
        .insert({
          tenant_id,
          payment_methods,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      data = result.data
      error = result.error
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }


    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('tenant_id')

  if (!tenantId) {
    return NextResponse.json({ error: 'tenant_id is required' }, { status: 400 })
  }

  try {
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
    
    
    const { data, error } = await supabase
      .from('tenant_payment_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}