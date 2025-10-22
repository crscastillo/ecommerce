import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - user must be authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, subdomain, description, contact_email } = body

    // Validate required fields
    if (!name || !subdomain || !contact_email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, subdomain, contact_email' },
        { status: 400 }
      )
    }

    // Check if subdomain is available
    const { data: existingTenant } = await supabase
      .from('tenants')
      .select('subdomain')
      .eq('subdomain', subdomain)
      .maybeSingle()

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Subdomain is already taken' },
        { status: 409 }
      )
    }

    // Create the tenant
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name,
        subdomain,
        description,
        contact_email,
        owner_id: user.id,
        settings: {
          currency: 'USD',
          timezone: 'UTC',
          theme: 'default'
        }
      })
      .select()
      .single()

    if (tenantError) {
      console.error('Tenant creation error:', tenantError)
      return NextResponse.json(
        { error: `Failed to create tenant: ${tenantError.message}` },
        { status: 500 }
      )
    }

    // Create default categories
    const { error: categoriesError } = await supabase
      .from('categories')
      .insert([
        {
          tenant_id: tenantData.id,
          name: 'Electronics',
          slug: 'electronics',
          description: 'Electronic devices and gadgets',
          sort_order: 1
        },
        {
          tenant_id: tenantData.id,
          name: 'Clothing',
          slug: 'clothing',
          description: 'Fashion and apparel',
          sort_order: 2
        },
        {
          tenant_id: tenantData.id,
          name: 'Home & Garden',
          slug: 'home-garden',
          description: 'Home improvement and garden supplies',
          sort_order: 3
        }
      ])

    if (categoriesError) {
      console.warn('Failed to create default categories:', categoriesError)
      // Don't fail the entire operation for categories
    }

    return NextResponse.json({
      success: true,
      tenant: tenantData
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}