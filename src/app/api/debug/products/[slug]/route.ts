import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
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

    // First, let's see all tenants
    const { data: tenants } = await supabase
      .from('tenants')
      .select('id, name, subdomain')
      .limit(5)

    // Now let's find the product across all tenants to see what we have
    const { data: products } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        product_type,
        tenant_id,
        tenants(name, subdomain)
      `)
      .eq('slug', slug)
      .limit(10)

    // Let's also check if there are any variants for this product
    const { data: allVariants } = await supabase
      .from('product_variants')
      .select(`
        id,
        title,
        product_id,
        tenant_id,
        price,
        inventory_quantity,
        is_active
      `)
      .limit(20)

    return NextResponse.json({
      slug,
      tenants,
      products,
      allVariants: allVariants || []
    })
  } catch (error) {
    console.error('[DEBUG] Error:', error)
    return NextResponse.json(
      { error: 'Debug error', details: error }, 
      { status: 500 }
    )
  }
}