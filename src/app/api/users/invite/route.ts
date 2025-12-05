import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { tenantId, email, role } = await request.json()
    
    // Basic validation
    if (!tenantId || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, email, role' }, 
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Role validation
    const validRoles = ['admin', 'staff', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: admin, staff, viewer' },
        { status: 400 }
      )
    }

    // Initialize Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Get tenant information
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name, subdomain')
      .eq('id', tenantId)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Check for existing active invitation
    const { data: existingInvitation } = await supabase
      .from('tenant_users_invitations')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Active invitation already exists for this email' },
        { status: 400 }
      )
    }

    // Create invitation record
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    const { data: invitation, error: invitationError } = await supabase
      .from('tenant_users_invitations')
      .insert({
        tenant_id: tenantId,
        email: email,
        role: role,
        invited_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true
      })
      .select('id')
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // Construct redirect URL
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const baseUrl = host.includes('localhost') 
      ? `${protocol}://${host}`
      : (process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`)

    const redirectUrl = `${baseUrl}/accept-invitation/${invitation.id}`

    // Send invitation email
    let emailStatus = 'pending'
    let emailError = null

    try {
      const { error: emailSendError } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          invitation_id: invitation.id,
          tenant_id: tenantId,
          tenant_name: tenant.name,
          tenant_subdomain: tenant.subdomain,
          role: role
        },
        redirectTo: redirectUrl
      })

      if (emailSendError) {
        emailStatus = 'failed'
        emailError = emailSendError.message
      } else {
        emailStatus = 'sent'
      }
    } catch (err) {
      emailStatus = 'failed'
      emailError = (err as Error).message
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email,
        role,
        tenant: tenant.name,
        expires_at: expiresAt.toISOString()
      },
      email_status: emailStatus,
      email_error: emailError,
      redirect_url: redirectUrl
    })

  } catch (error) {
    console.error('Invitation error:', error)
    return NextResponse.json(
      { error: 'Failed to process invitation' },
      { status: 500 }
    )
  }
}