import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      tenant_id, 
      customer_info, 
      shipping_info, 
      payment_info, 
      items, 
      totals 
    } = body

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
    
    console.log('API: Creating order for tenant:', tenant_id)
    
    // Create customer if guest checkout
    let customer_id = customer_info.id
    if (!customer_id && customer_info.email) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('tenant_id', tenant_id)
        .eq('email', customer_info.email)
        .single()

      if (existingCustomer) {
        customer_id = existingCustomer.id
      } else {
        // Create new guest customer
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            tenant_id,
            email: customer_info.email,
            first_name: customer_info.first_name,
            last_name: customer_info.last_name,
            phone: customer_info.phone,
            user_id: null, // Guest customer
            addresses: shipping_info ? [shipping_info] : []
          })
          .select()
          .single()

        if (customerError) {
          console.error('Customer creation error:', customerError)
          return NextResponse.json({ error: customerError.message }, { status: 500 })
        }

        customer_id = newCustomer.id
      }
    }

    // Generate order number
    const order_number = `ORD-${Date.now().toString().slice(-8)}`

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        tenant_id,
        customer_id,
        order_number,
        email: customer_info.email,
        financial_status: payment_info.status || 'pending',
        fulfillment_status: 'unfulfilled',
        subtotal_price: totals.subtotal,
        total_tax: totals.tax,
        total_price: totals.total,
        shipping_address: shipping_info,
        billing_address: shipping_info, // Use same address for now
        payment_method: payment_info.method,
        payment_reference: payment_info.reference,
        currency: totals.currency || 'USD',
        notes: customer_info.notes || null
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Create order line items
    const lineItems = items.map((item: any) => ({
      tenant_id,
      order_id: order.id,
      product_id: item.productId,
      product_variant_id: item.variantId || null,
      quantity: item.quantity,
      price: item.price,
      total_price: item.price * item.quantity,
      title: item.name,
      variant_title: item.variantTitle || null,
      sku: item.sku || null
    }))

    const { error: lineItemsError } = await supabase
      .from('order_line_items')
      .insert(lineItems)

    if (lineItemsError) {
      console.error('Line items creation error:', lineItemsError)
      // Don't fail the order, but log the error
      console.warn('Failed to create line items, but order was created successfully')
    }

    // Update product inventory if tracking is enabled
    for (const item of items) {
      if (item.trackInventory) {
        await supabase.rpc('decrement_product_inventory', {
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity
        })
      }
    }

    console.log('API: Order created successfully:', order.id)

    return NextResponse.json({ 
      data: {
        ...order,
        line_items: lineItems
      }
    })
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
  const customerId = searchParams.get('customer_id')
  const orderNumber = searchParams.get('order_number')

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
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:customers(id, email, first_name, last_name),
        order_items:order_line_items(*)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    if (orderNumber) {
      query = query.eq('order_number', orderNumber)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}