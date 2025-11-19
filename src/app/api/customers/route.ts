import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenant_id, ...customerData } = body

    if (!tenant_id) {
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
    
    console.log('API: Creating customer for tenant:', tenant_id)
    
    // Create the customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        tenant_id,
        ...customerData
      })
      .select()
      .single()

    if (customerError) {
      console.error('Customer creation error:', customerError)
      return NextResponse.json({ error: customerError.message }, { status: 500 })
    }

    console.log('API: Customer created successfully:', customer.id)

    return NextResponse.json({ data: customer })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('tenant_id')
  const search = searchParams.get('search')
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined

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
    
    console.log('API: Fetching customers for tenant:', tenantId)
    
    let query = supabase
      .from('customers')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
    }
    
    if (limit) {
      query = query.limit(limit)
    }
    
    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1)
    }

    const { data, error } = await query

    console.log('API: Database response:', { data: data?.length, error })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('API: Returning customers:', data?.length || 0)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenant_id, customer_id, ...customerData } = body

    if (!tenant_id || !customer_id) {
      return NextResponse.json({ error: 'tenant_id and customer_id are required' }, { status: 400 })
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
    
    console.log('API: Updating customer for tenant:', tenant_id)
    console.log('API: Customer ID:', customer_id)
    
    // Update the customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .update(customerData)
      .eq('id', customer_id)
      .eq('tenant_id', tenant_id)
      .select()
      .single()

    if (customerError) {
      console.error('Customer update error:', customerError)
      return NextResponse.json({ error: customerError.message }, { status: 500 })
    }

    console.log('API: Customer updated successfully:', customer.id)
    return NextResponse.json({ data: customer })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}