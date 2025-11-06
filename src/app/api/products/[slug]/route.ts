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
    console.log('[API] Product detail - Headers:', Object.fromEntries(request.headers.entries()))
    console.log('[API] Product detail - URL:', request.url)
    
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

    // Fetch product with category information and product type
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
        product_type,
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

    console.log('[API] Product detail - Found product:', {
      name: product.name,
      product_type: product.product_type,
      id: product.id
    })

    // If it's a variable product, fetch its variants
    let variants: any[] = []
    if (product.product_type === 'variable') {
      console.log('[API] Product detail - Fetching variants for variable product')
      const { data: variantData, error: variantError } = await supabase
        .from('product_variants')
        .select(`
          id,
          title,
          option1,
          option2,
          option3,
          sku,
          price,
          compare_price,
          inventory_quantity,
          image_url,
          is_active
        `)
        .eq('tenant_id', tenantId)
        .eq('product_id', product.id)
        .eq('is_active', true)
        .order('title')

      if (variantError) {
        console.error('[API] Product detail - Variant fetch error:', variantError)
      } else {
        variants = variantData || []
        console.log('[API] Product detail - Found variants:', variants.length)
      }
    } else {
      console.log('[API] Product detail - Product type is:', product.product_type, '- not variable, skipping variant fetch')
    }

    return NextResponse.json({ 
      product: {
        ...product,
        variants
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('[API] Product detail - Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}