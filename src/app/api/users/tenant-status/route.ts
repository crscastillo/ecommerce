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

    // Check if user has any tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name, subdomain, is_active')
      .eq('owner_id', user.id)
      .eq('is_active', true)

    if (tenantsError) {
      return NextResponse.json(
        { error: 'Failed to check tenant status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      hasTenant: tenants && tenants.length > 0,
      tenantCount: tenants?.length || 0,
      tenants: tenants || []
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}