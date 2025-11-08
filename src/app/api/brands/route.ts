import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('tenant_id')
  const isActive = searchParams.get('is_active')

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
    
    console.log('API: Fetching brands for tenant:', tenantId)
    
    let query = supabase
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

    // Apply filters
    if (isActive === 'true') {
      query = query.eq('is_active', true)
    }

    // Order by name
    query = query.order('name', { ascending: true })

    const { data, error } = await query

    console.log('API: Database response:', { data: data?.length, error })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('API: Returning brands:', data?.length || 0)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}