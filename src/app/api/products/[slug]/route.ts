import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Get tenant from headers (set by middleware) or query params
    const tenantId = request.headers.get('x-tenant-id') || new URL(request.url).searchParams.get('tenant_id')
    
    if (!tenantId) {
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
        brand_id,
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
        ),
        brand:brands(
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
      if (productError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // If it's a variable product, fetch its variants
    let variants: any[] = []
    if (product.product_type === 'variable') {
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
      } else {
        variants = variantData || []
      }
    } else {
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
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}