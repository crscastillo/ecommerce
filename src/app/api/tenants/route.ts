import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

    // Get tenants owned by the user
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .eq('owner_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (tenantsError) {
      console.error('Tenants fetch error:', tenantsError)
      return NextResponse.json(
        { error: `Failed to fetch tenants: ${tenantsError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tenants: tenants || []
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Check if user already has a tenant
    const { data: userTenant } = await supabase
      .from('tenants')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (userTenant) {
      // User already has a tenant, return it instead of creating a new one
      return NextResponse.json({
        success: true,
        tenant: userTenant
      })
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

    // Create tenant_users relationship for the owner
    const { error: tenantUserError } = await supabase
      .from('tenant_users')
      .insert({
        tenant_id: tenantData.id,
        user_id: user.id,
        role: 'owner',
        is_active: true
      })

    if (tenantUserError) {
      console.error('Failed to create tenant_users relationship:', tenantUserError)
      // This is critical - if we can't create the relationship, the owner won't have access
      return NextResponse.json(
        { error: `Failed to create tenant ownership: ${tenantUserError.message}` },
        { status: 500 }
      )
    }

    // Create default categories (now that tenant_users relationship exists)
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
      console.error('Failed to create default categories:', categoriesError)
      // Don't fail the entire operation for categories, but log the error
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