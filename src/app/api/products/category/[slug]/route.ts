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

    // First, find the category by slug
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, description, image_url')
      .eq('tenant_id', tenantId)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (categoryError) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }


    // Now fetch products in this category
    const { data: products, error: productsError } = await supabase
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
        product_type,
        inventory_quantity,
        track_inventory,
        created_at,
        brand:brands(
          id,
          name,
          slug
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('category_id', category.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (productsError) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }


    // Fetch variants for variable products
    if (products && products.length > 0) {
      const productIds = products
        .filter(product => product.product_type === 'variable')
        .map(product => product.id)

      if (productIds.length > 0) {
        
        const { data: variants, error: variantsError } = await supabase
          .from('product_variants')
          .select('*')
          .in('product_id', productIds)
          .eq('tenant_id', tenantId)
          .eq('is_active', true)

        if (variantsError) {
        } else {
          // Group variants by product_id and attach to products
          const variantsByProduct = variants.reduce((acc, variant) => {
            if (!acc[variant.product_id]) {
              acc[variant.product_id] = []
            }
            acc[variant.product_id].push(variant)
            return acc
          }, {} as Record<string, any[]>)

          // Attach variants to their respective products
          products.forEach(product => {
            if (product.product_type === 'variable') {
              ;(product as any).variants = variantsByProduct[product.id] || []
            }
          })
        }
      }
    }

    return NextResponse.json({ 
      category,
      products: products || []
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}