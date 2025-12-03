import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const accessToken = url.searchParams.get('access_token')
  const refreshToken = url.searchParams.get('refresh_token')
  const redirectTo = url.searchParams.get('redirect_to') || '/admin'

  if (!accessToken || !refreshToken) {
    // If no tokens provided, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const supabase = await createClient()
    
    // Set the session using the provided tokens
    const { data: { user }, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    if (error) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }


    // Create response that redirects to the intended destination
    const response = NextResponse.redirect(new URL(redirectTo, request.url))
    
    // The Supabase client should automatically handle setting the session cookies
    // Let's make sure by getting a new session and setting cookies if needed
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Set additional headers to ensure session persistence
      response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
    }

    return response
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}