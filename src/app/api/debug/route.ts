import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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
    
    // First, get all tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name, subdomain')
      .limit(5)

    if (tenantsError) {
      return NextResponse.json({ error: 'Failed to fetch tenants', details: tenantsError }, { status: 500 })
    }

    // Then get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(10)

    if (categoriesError) {
      return NextResponse.json({ error: 'Failed to fetch categories', details: categoriesError }, { status: 500 })
    }

    return NextResponse.json({ 
      tenants,
      categories,
      counts: {
        tenants: tenants?.length || 0,
        categories: categories?.length || 0
      }
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}