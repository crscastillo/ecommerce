import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
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

    const tenantId = '0889434f-f0b1-4938-906a-85fc22ae1bd5'
    const productId = '2a0ebc75-395f-4a3b-b00d-26a08cdd422c'

    const variants = [
      {
        tenant_id: tenantId,
        product_id: productId,
        title: 'Fruit Punch',
        option1: 'Fruit Punch',
        sku: 'AMINO-FRUIT-200G',
        price: 29.99,
        compare_price: 34.99,
        inventory_quantity: 15,
        is_active: true
      },
      {
        tenant_id: tenantId,
        product_id: productId,
        title: 'Blue Raspberry',
        option1: 'Blue Raspberry',
        sku: 'AMINO-BLUE-200G',
        price: 29.99,
        compare_price: 34.99,
        inventory_quantity: 8,
        is_active: true
      },
      {
        tenant_id: tenantId,
        product_id: productId,
        title: 'Grape',
        option1: 'Grape',
        sku: 'AMINO-GRAPE-200G',
        price: 29.99,
        compare_price: 34.99,
        inventory_quantity: 3,
        is_active: true
      },
      {
        tenant_id: tenantId,
        product_id: productId,
        title: 'Watermelon',
        option1: 'Watermelon',
        sku: 'AMINO-WATER-200G',
        price: 32.99,
        compare_price: 37.99,
        inventory_quantity: 0,
        is_active: true
      }
    ]

    const { data, error } = await supabase
      .from('product_variants')
      .insert(variants)
      .select()

    if (error) {
      console.error('Error creating variants:', error)
      return NextResponse.json({ error: 'Failed to create variants', details: error }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Variants created successfully',
      variants: data 
    })
  } catch (error) {
    console.error('[CREATE VARIANTS] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error }, 
      { status: 500 }
    )
  }
}