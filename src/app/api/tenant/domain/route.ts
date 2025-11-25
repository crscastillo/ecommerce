import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TenantDomainService } from '@/lib/services/tenant-domain'

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

    // Get tenant ID from headers (set by middleware)
    const tenantId = request.headers.get('x-tenant-id')
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Verify user has permission to modify this tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('owner_id')
      .eq('id', tenantId)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const isOwner = tenant.owner_id === user.id

    // Check if user is a team member with admin role
    let hasPermission = isOwner
    if (!isOwner) {
      const { data: tenantUser } = await supabase
        .from('tenant_users')
        .select('role')
        .eq('tenant_id', tenantId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      hasPermission = tenantUser?.role === 'admin'
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { domain } = body

    // Validate domain format if provided
    if (domain && typeof domain !== 'string') {
      return NextResponse.json(
        { error: 'Domain must be a string' },
        { status: 400 }
      )
    }

    const domainService = new TenantDomainService(true) // Use server client

    // Update the tenant domain
    const success = await domainService.updateTenantDomain(tenantId, domain || null)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update domain' },
        { status: 500 }
      )
    }

    // Get updated tenant data
    const { data: updatedTenant } = await supabase
      .from('tenants')
      .select('id, name, subdomain, domain')
      .eq('id', tenantId)
      .single()

    return NextResponse.json({
      success: true,
      tenant: updatedTenant
    })

  } catch (error) {
    console.error('Error updating tenant domain:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get tenant ID from headers (set by middleware)
    const tenantId = request.headers.get('x-tenant-id')
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Get tenant domain information
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('id, name, subdomain, domain, is_active')
      .eq('id', tenantId)
      .single()

    if (error || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const domainService = new TenantDomainService(true)
    const canonicalUrl = domainService.getTenantCanonicalUrl(tenant)

    return NextResponse.json({
      tenant,
      canonicalUrl,
      accessMethod: tenant.domain ? 'custom-domain' : 'subdomain'
    })

  } catch (error) {
    console.error('Error fetching tenant domain:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}