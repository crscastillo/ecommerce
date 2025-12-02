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
  const categoryIds = searchParams.get('category_ids')
  const categorySlugs = searchParams.get('category_slugs')
  const brandSlugs = searchParams.get('brand_slugs')
  const categoryId = searchParams.get('category_id') // Keep for backward compatibility
  const brandSlug = searchParams.get('brand_slug') // Keep for backward compatibility
  const search = searchParams.get('search')
  const sortBy = searchParams.get('sort_by') || 'newest'
  const minPrice = searchParams.get('min_price')
  const maxPrice = searchParams.get('max_price')

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
    
    // Handle multiple category slugs
    let categoryIdsFromSlugs: string[] = []
    const allCategorySlugs = categorySlugs ? categorySlugs.split(',') : []
    
    if (allCategorySlugs.length > 0) {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, slug')
        .eq('tenant_id', tenantId)
        .in('slug', allCategorySlugs)
        .eq('is_active', true)
      
      if (categoryError) {
        console.error('Error fetching categories:', categoryError)
      } else if (categoryData) {
        categoryIdsFromSlugs = categoryData.map(category => category.id)
        console.log('Found category IDs for slugs:', allCategorySlugs, '→', categoryIdsFromSlugs)
      }
    }
    
    // Handle multiple brand slugs
    let brandIds: string[] = []
    const allBrandSlugs = brandSlugs ? brandSlugs.split(',') : (brandSlug ? [brandSlug] : [])
    
    if (allBrandSlugs.length > 0) {
      const { data: brandData, error: brandError } = await supabase
        .from('brands')
        .select('id, slug')
        .eq('tenant_id', tenantId)
        .in('slug', allBrandSlugs)
        .eq('is_active', true)
      
      if (brandError) {
        console.error('Error fetching brands:', brandError)
      } else if (brandData) {
        brandIds = brandData.map(brand => brand.id)
        console.log('Found brand IDs for slugs:', allBrandSlugs, '→', brandIds)
      }
    }
    
    // Handle multiple category IDs (from both direct IDs and converted slugs)
    const directCategoryIds = categoryIds ? categoryIds.split(',') : (categoryId ? [categoryId] : [])
    const allCategoryIds = [...directCategoryIds, ...categoryIdsFromSlugs]
    
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
        brand_id,
        category:categories(
          id,
          name,
          slug
        ),
        brand:brands(
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
    if (allCategoryIds.length > 0) {
      query = query.in('category_id', allCategoryIds)
    }

    if (brandIds.length > 0) {
      query = query.in('brand_id', brandIds)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,short_description.ilike.%${search}%`)
    }

    // Apply price range filters
    if (minPrice) {
      const minPriceNum = parseFloat(minPrice)
      if (!isNaN(minPriceNum)) {
        query = query.gte('price', minPriceNum)
      }
    }

    if (maxPrice) {
      const maxPriceNum = parseFloat(maxPrice)
      if (!isNaN(maxPriceNum)) {
        query = query.lte('price', maxPriceNum)
      }
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

    // Fetch variants for variable products
    if (data && data.length > 0) {
      const productIds = data
        .filter(product => product.product_type === 'variable')
        .map(product => product.id)

      if (productIds.length > 0) {
        console.log('API: Fetching variants for', productIds.length, 'variable products')
        
        const { data: variants, error: variantsError } = await supabase
          .from('product_variants')
          .select('*')
          .in('product_id', productIds)
          .eq('tenant_id', tenantId)
          .eq('is_active', true)

        if (variantsError) {
          console.error('Variants fetch error:', variantsError)
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
          data.forEach(product => {
            if (product.product_type === 'variable') {
              ;(product as any).variants = variantsByProduct[product.id] || []
              console.log(`API: Product ${product.name} has ${(product as any).variants.length} variants`)
            }
          })
        }
      }
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenant_id, product_id, variants, ...productData } = body

    if (!tenant_id || !product_id) {
      return NextResponse.json({ error: 'tenant_id and product_id are required' }, { status: 400 })
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
    
    console.log('API: Updating product for tenant:', tenant_id)
    console.log('API: Product ID:', product_id)
    console.log('API: Product type:', productData.product_type)
    console.log('API: Variants to update:', variants?.length || 0)
    
    // Update the product (without variants in JSONB)
    const { data: product, error: productError } = await supabase
      .from('products')
      .update(productData)
      .eq('id', product_id)
      .eq('tenant_id', tenant_id)
      .select()
      .single()

    if (productError) {
      console.error('Product update error:', productError)
      return NextResponse.json({ error: productError.message }, { status: 500 })
    }

    console.log('API: Product updated successfully:', product.id)

    // Handle variants for variable products
    if (productData.product_type === 'variable' && variants && Array.isArray(variants)) {
      console.log('API: Managing variants for variable product')
      
      // First, get existing variants
      const { data: existingVariants, error: existingError } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', product_id)
        .eq('tenant_id', tenant_id)

      if (existingError) {
        console.error('Error fetching existing variants:', existingError)
      }

      // Delete all existing variants
      if (existingVariants && existingVariants.length > 0) {
        const { error: deleteError } = await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', product_id)
          .eq('tenant_id', tenant_id)

        if (deleteError) {
          console.error('Error deleting existing variants:', deleteError)
        } else {
          console.log('API: Deleted existing variants:', existingVariants.length)
        }
      }

      // Create new variants
      if (variants.length > 0) {
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
          return NextResponse.json({ error: 'Failed to create variants: ' + variantsError.message }, { status: 500 })
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
    } else if (productData.product_type !== 'variable') {
      // For non-variable products, remove any existing variants
      const { error: deleteError } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', product_id)
        .eq('tenant_id', tenant_id)

      if (deleteError) {
        console.error('Error deleting variants for non-variable product:', deleteError)
      }
    }

    // Return the updated product
    return NextResponse.json({ data: product })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}