import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    console.log('[API] Brand detail - Starting request for slug:', slug)
    
    // Get tenant from headers (set by middleware) or query params
    const tenantId = request.headers.get('x-tenant-id') || new URL(request.url).searchParams.get('tenant_id')
    console.log('[API] Brand detail - Tenant ID:', tenantId)
    
    if (!tenantId) {
      console.error('[API] Brand detail - No tenant ID found')
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

    // Fetch brand by slug
    console.log('[API] Brand detail - Fetching brand with slug:', slug)
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select(`
        id,
        name,
        slug,
        description,
        logo_url,
        is_active,
        created_at
      `)
      .eq('tenant_id', tenantId)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (brandError) {
      console.error('[API] Brand detail - Brand fetch error:', brandError)
      if (brandError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 })
    }

    if (!brand) {
      console.log('[API] Brand detail - Brand not found for slug:', slug)
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    console.log('[API] Brand detail - Found brand:', {
      name: brand.name,
      id: brand.id
    })

    return NextResponse.json({ 
      brand: brand
    }, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('[API] Brand detail - Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}