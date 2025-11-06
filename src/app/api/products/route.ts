import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenant_id, variants, ...productData } = body

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
    
    console.log('API: Creating product for tenant:', tenant_id)
    console.log('API: Product type:', productData.product_type)
    console.log('API: Variants to create:', variants?.length || 0)
    
    // First, create the product (without variants in JSONB)
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        tenant_id,
        ...productData
      })
      .select()
      .single()

    if (productError) {
      console.error('Product creation error:', productError)
      return NextResponse.json({ error: productError.message }, { status: 500 })
    }

    console.log('API: Product created successfully:', product.id)

    // If it's a variable product with variants, create them in the product_variants table
    if (productData.product_type === 'variable' && variants && Array.isArray(variants) && variants.length > 0) {
      console.log('API: Creating variants for variable product')
      
      const variantInserts = variants.map(variant => ({
        tenant_id,
        product_id: product.id,
        title: variant.title || `${variant.option1 || ''} ${variant.option2 || ''} ${variant.option3 || ''}`.trim(),
        option1: variant.option1 || null,
        option2: variant.option2 || null,
        option3: variant.option3 || null,
        sku: variant.sku || null,
        price: variant.price || productData.price || 0,
        compare_price: variant.compare_price || null,
        cost_price: variant.cost_price || null,
        inventory_quantity: variant.inventory_quantity || 0,
        weight: variant.weight || null,
        image_url: variant.image_url || null,
        is_active: variant.is_active !== false // Default to true unless explicitly false
      }))

      const { data: createdVariants, error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantInserts)
        .select()

      if (variantsError) {
        console.error('Variants creation error:', variantsError)
        // Don't fail the entire request, but log the error
        console.warn('Failed to create variants, but product was created successfully')
      } else {
        console.log('API: Created variants:', createdVariants.length)
      }

      // Return the product with the created variants
      return NextResponse.json({ 
        data: {
          ...product,
          variants: createdVariants || []
        }
      })
    }

    // For non-variable products, just return the product
    return NextResponse.json({ data: product })
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
  const categoryId = searchParams.get('category_id')
  const search = searchParams.get('search')
  const sortBy = searchParams.get('sort_by') || 'newest'

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
    
    console.log('API: Fetching products for tenant:', tenantId)
    
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        short_description,
        price,
        compare_price,
        category_id,
        category:categories(
          id,
          name,
          slug
        ),
        images,
        is_active,
        is_featured,
        inventory_quantity,
        track_inventory,
        product_type,
        tags,
        created_at
      `)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)

    // Apply filters
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,short_description.ilike.%${search}%`)
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        query = query.order('price', { ascending: true })
        break
      case 'price-high':
        query = query.order('price', { ascending: false })
        break
      case 'name':
        query = query.order('name', { ascending: true })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data, error } = await query

    console.log('API: Database response:', { data: data?.length, error })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('API: Returning products:', data?.length || 0)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}