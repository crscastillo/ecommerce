import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { invitationId, tenantId } = await request.json()

    if (!invitationId || !tenantId) {
      return NextResponse.json(
        { error: 'Invitation ID and tenant ID are required' },
        { status: 400 }
      )
    }

    // Use service role client to access admin functions
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from('tenant_users_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .single()

    if (invitationError || !invitation) {
      console.error('Invitation not found:', invitationError)
      return NextResponse.json(
        { error: 'Invitation not found or already used' },
        { status: 404 }
      )
    }

    // Check if invitation has expired
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)
    
    if (now > expiresAt) {
      // Update expiry time for expired invitations
      const newExpiryDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 days from now
      
      const { error: updateError } = await supabase
        .from('tenant_users_invitations')
        .update({ 
          expires_at: newExpiryDate.toISOString(),
          invited_at: now.toISOString() // Update invited_at to show it was resent
        })
        .eq('id', invitationId)

      if (updateError) {
        console.error('Error updating invitation expiry:', updateError)
        return NextResponse.json(
          { error: 'Failed to update invitation' },
          { status: 500 }
        )
      }
    }

    // Check if user already exists
    const { data: existingUser, error: userCheckError } = await supabase.auth.admin.listUsers()
    const userExists = existingUser?.users?.some(u => u.email === invitation.email)
    
    let emailStatus = 'sent'
    let emailError = null

    if (userExists) {
      emailStatus = 'user_exists'
      console.log('User already exists:', invitation.email)
    } else {
      // Get tenant subdomain for proper URL construction
      const { data: tenantData, error: subdomainError } = await supabase
        .from('tenants')
        .select('subdomain')
        .eq('id', tenantId)
        .single()

      if (subdomainError || !tenantData) {
        console.error('Error fetching tenant subdomain:', subdomainError)
        emailStatus = 'failed'
        emailError = 'Failed to get tenant information'
      } else {
        // Send invitation email using Supabase Auth
        try {
          // Construct URL with tenant subdomain
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
          const tenantUrl = baseUrl.includes('localhost') 
            ? `${tenantData.subdomain}.${baseUrl}` 
            : `https://${tenantData.subdomain}.${baseUrl.replace('https://', '')}`
          
          const inviteOptions = {
            email: invitation.email,
            options: {
              redirectTo: `${tenantUrl}/accept-invitation?invitation_id=${invitation.id}`
            }
          }

          console.log('Resending invitation email to:', invitation.email)
          console.log('Invitation options with tenant URL:', inviteOptions)

          const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
            inviteOptions.email,
            inviteOptions.options
          )

          if (inviteError) {
            console.error('Supabase invite error:', inviteError)
            emailStatus = 'failed'
            emailError = inviteError.message
          } else {
            console.log('Invitation resent successfully:', inviteData)
            emailStatus = 'sent'
          }
        } catch (emailErr) {
          console.error('Error sending invitation email:', emailErr)
          emailStatus = 'failed'
          emailError = emailErr instanceof Error ? emailErr.message : 'Unknown email error'
        }
      }
    }

    // Update the invitation record to show it was resent
    const { error: logError } = await supabase
      .from('tenant_users_invitations')
      .update({ 
        invited_at: now.toISOString() // Update to show when it was last sent
      })
      .eq('id', invitationId)

    if (logError) {
      console.warn('Warning: Could not update invitation timestamp:', logError)
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation resent successfully',
      email_status: emailStatus,
      email_error: emailError,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role
      }
    })

  } catch (error) {
    console.error('Error resending invitation:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}