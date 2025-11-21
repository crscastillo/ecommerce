import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // Get current tenant settings
    const { data: currentTenant } = await supabase
      .from('tenants')
      .select('settings')
      .eq('subdomain', 'peakmode')
      .single()

    const currentSettings = (currentTenant?.settings as any) || {}

    // Update peakmode tenant with proper language settings stored in settings JSONB
    const { data: tenant, error } = await supabase
      .from('tenants')
      .update({
        settings: {
          ...currentSettings,
          admin_language: 'en',
          store_language: 'es'
        }
      })
      .eq('subdomain', 'peakmode')
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      tenant,
      message: 'Peakmode tenant updated with admin_language=en, store_language=es'
    })
  } catch (error) {
    console.error('Error updating tenant:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}