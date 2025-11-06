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

    console.log('Starting migration of variants from JSONB to product_variants table...')

    // Find all products that have variants in the JSONB column
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, tenant_id, name, slug, product_type, variants')
      .not('variants', 'is', null)
      .neq('variants', '{}')
      .neq('variants', '[]')

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    console.log(`Found ${products.length} products with variants in JSONB`)

    let migratedCount = 0
    let errorCount = 0
    const results = []

    for (const product of products) {
      try {
        console.log(`Migrating variants for product: ${product.name} (${product.id})`)
        
        // Parse the variants from JSONB
        const variants = Array.isArray(product.variants) ? product.variants : []
        
        if (variants.length === 0) {
          console.log(`No variants found for product ${product.name}`)
          continue
        }

        // Create variant records in product_variants table
        const variantInserts = variants.map((variant: any, index: number) => ({
          tenant_id: product.tenant_id,
          product_id: product.id,
          title: variant.title || `Variant ${index + 1}`,
          option1: variant.option1 || null,
          option2: variant.option2 || null,
          option3: variant.option3 || null,
          sku: variant.sku || null,
          price: variant.price || 0,
          compare_price: variant.compare_price || null,
          cost_price: variant.cost_price || null,
          inventory_quantity: variant.inventory_quantity || 0,
          weight: variant.weight || null,
          image_url: variant.image_url || null,
          is_active: variant.is_active !== false
        }))

        const { data: createdVariants, error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantInserts)
          .select()

        if (variantsError) {
          console.error(`Failed to create variants for product ${product.name}:`, variantsError)
          errorCount++
          results.push({
            product: product.name,
            status: 'error',
            error: variantsError.message
          })
          continue
        }

        // Clear the variants from the JSONB column
        const { error: updateError } = await supabase
          .from('products')
          .update({ variants: {} })
          .eq('id', product.id)

        if (updateError) {
          console.error(`Failed to clear variants JSONB for product ${product.name}:`, updateError)
          // Don't count this as a full error since variants were created
        }

        migratedCount++
        results.push({
          product: product.name,
          status: 'success',
          variantsCreated: createdVariants.length
        })

        console.log(`Successfully migrated ${createdVariants.length} variants for ${product.name}`)
      } catch (error) {
        console.error(`Error migrating product ${product.name}:`, error)
        errorCount++
        results.push({
          product: product.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log(`Migration complete: ${migratedCount} products migrated, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      message: `Migration complete: ${migratedCount} products migrated, ${errorCount} errors`,
      totalProducts: products.length,
      migratedCount,
      errorCount,
      results
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}