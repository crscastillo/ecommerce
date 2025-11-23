import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { tenantId, email, role } = await request.json()
    
    if (!tenantId || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, email, role' }, 
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['admin', 'staff', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: admin, staff, viewer' },
        { status: 400 }
      )
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

    console.log('API: Inviting user:', { tenantId, email, role })

    // Check if tenant exists and get tenant details
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name, subdomain')
      .eq('id', tenantId)
      .single()

    if (tenantError) {
      console.error('Error fetching tenant:', tenantError)
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Check if invitation already exists for this email and tenant
    const { data: existingInvitation } = await supabase
      .from('tenant_users_invitations')
      .select('id, is_active')
      .eq('tenant_id', tenantId)
      .eq('email', email)
      .maybeSingle()

    if (existingInvitation && existingInvitation.is_active) {
      return NextResponse.json(
        { error: 'An active invitation already exists for this email' },
        { status: 400 }
      )
    }

    // Insert the invitation
    const { data, error } = await supabase
      .from('tenant_users_invitations')
      .insert({
        tenant_id: tenantId,
        email: email,
        role: role,
        invited_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()

    if (error) {
      console.error('Error creating invitation:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('API: User invitation created successfully:', data[0])

    // Get tenant subdomain for proper URL construction
    const { data: tenantData, error: subdomainError } = await supabase
      .from('tenants')
      .select('subdomain')
      .eq('id', tenantId)
      .single()

    if (subdomainError || !tenantData) {
      console.error('Error fetching tenant subdomain:', subdomainError)
      return NextResponse.json(
        { error: 'Failed to get tenant information' },
        { status: 500 }
      )
    }

    // Send invitation email using Supabase Auth Admin API
    let emailStatus = 'not_sent'
    let emailError = null

    try {
      console.log('API: Attempting to send invitation email to:', email)
      console.log('API: Using Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('API: Service role key available:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
      
      // User doesn't exist, use Supabase invite (we'll handle existing users later)
      console.log('API: Sending Supabase invitation email...')
      
      // Construct URL with tenant subdomain
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
      const tenantUrl = baseUrl.includes('localhost') 
        ? `${tenantData.subdomain}.${baseUrl}` 
        : `https://${tenantData.subdomain}.${baseUrl.replace('https://', '')}`
      const redirectUrl = `${tenantUrl}/accept-invitation?invitation_id=${data[0].id}`
      console.log('API: Redirect URL with tenant subdomain:', redirectUrl)

      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          tenant_id: tenantId,
          role: role,
          invitation_id: data[0].id,
          store_name: tenant.name || 'Store'
        },
        redirectTo: redirectUrl
      })

      if (inviteError) {
        console.error('❌ Error sending invitation email:', inviteError)
        console.error('Invite error details:', JSON.stringify(inviteError, null, 2))
        emailStatus = 'failed'
        emailError = inviteError.message || 'Failed to send invitation email'
        
        // Check for common errors
        if (inviteError.message?.includes('User already registered')) {
          console.log('API: User already exists - invitation recorded but no email sent')
          emailStatus = 'user_exists'
          emailError = 'User already has an account and can sign in directly'
        }
      } else {
        console.log('✅ API: Invitation email sent successfully!')
        console.log('Invitation data:', inviteData)
        emailStatus = 'sent'
      }

    } catch (err) {
      console.error('❌ Error in email invitation process:', err)
      console.error('Email error details:', JSON.stringify(err, null, 2))
      emailStatus = 'failed'
      emailError = (err as Error).message || 'Unexpected error sending invitation email'
    }

    return NextResponse.json({
      success: true,
      invitation: data[0],
      email_status: emailStatus,
      email_error: emailError
    })

  } catch (error) {
    console.error('User invitation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during user invitation.' },
      { status: 500 }
    )
  }
}