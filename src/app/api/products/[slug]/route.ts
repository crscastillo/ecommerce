import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    console.log('[API] Product detail - Starting request for slug:', slug)
    
    // Get tenant from headers (set by middleware) or query params
    const tenantId = request.headers.get('x-tenant-id') || new URL(request.url).searchParams.get('tenant_id')
    console.log('[API] Product detail - Tenant ID:', tenantId)
    
    if (!tenantId) {
      console.error('[API] Product detail - No tenant ID found')
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
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

    // Fetch product with category information
    console.log('[API] Product detail - Fetching product with slug:', slug)
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        short_description,
        price,
        compare_price,
        images,
        is_featured,
        is_active,
        inventory_quantity,
        track_inventory,
        tags,
        created_at,
        category:categories(
          id,
          name,
          slug
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (productError) {
      console.error('[API] Product detail - Product fetch error:', productError)
      if (productError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
    }

    if (!product) {
      console.log('[API] Product detail - Product not found for slug:', slug)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    console.log('[API] Product detail - Found product:', product.name)

    return NextResponse.json({ 
      product
    })
  } catch (error) {
    console.error('[API] Product detail - Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}