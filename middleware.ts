import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Extract subdomain and tenant information
  const hostname = request.headers.get('host') || ''
  const subdomain = extractSubdomain(hostname)
  const isMainDomain = !subdomain || subdomain === 'www'

  // Check for redirect loops by examining referrer
  const referer = request.headers.get('referer')
  if (referer && new URL(referer).hostname === hostname && request.nextUrl.pathname === new URL(referer).pathname) {
    console.warn('Potential redirect loop detected:', { hostname, pathname: request.nextUrl.pathname })
    return supabaseResponse
  }

  // Debug logging for Vercel deployment issues
  if (process.env.NODE_ENV === 'development' || process.env.VERCEL) {
    console.log('Middleware Debug:', {
      hostname,
      subdomain,
      isMainDomain,
      pathname: request.nextUrl.pathname,
      url: request.url
    })
  }

  // Handle main domain routing (for tenant signup, main site, etc.)
  if (isMainDomain) {
    return handleMainDomain(request, supabaseResponse)
  }

  // Handle tenant subdomain routing
  return await handleTenantSubdomain(request, supabaseResponse, subdomain)
}

function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0]
  
  // Get domains from environment or use defaults
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'yourdomain.com'
  const devDomain = process.env.NEXT_PUBLIC_DEV_DOMAIN || 'localhost'
  const mainDomains = [devDomain, appDomain]
  
  // Handle Vercel deployments - any .vercel.app domain without a subdomain is main
  if (host.endsWith('.vercel.app')) {
    const parts = host.split('.')
    // If it's just project-name.vercel.app (3 parts), it's the main domain
    if (parts.length === 3) {
      return null
    }
    // If it's subdomain.project-name.vercel.app (4+ parts), extract subdomain
    if (parts.length > 3) {
      return parts[0]
    }
  }
  
  // Check if it's a main domain
  if (mainDomains.some(domain => host === domain || host === `www.${domain}`)) {
    return null
  }
  
  // Extract subdomain
  const parts = host.split('.')
  if (parts.length > 2) {
    return parts[0]
  }
  
  // For localhost development like tenant.localhost:3000
  if (host.includes('.localhost') && parts.length > 1) {
    return parts[0]
  }
  
  return null
}

function handleMainDomain(request: NextRequest, supabaseResponse: NextResponse) {
  // Main domain routes - platform homepage, tenant onboarding, pricing, etc.
  const pathname = request.nextUrl.pathname
  
  // Allow the platform homepage to render at root
  // No redirect needed - let the platform homepage render
  return supabaseResponse
}

async function handleTenantSubdomain(request: NextRequest, supabaseResponse: NextResponse, subdomain: string) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Validate tenant exists and is active
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('id, name, subdomain, is_active, settings')
    .eq('subdomain', subdomain)
    .eq('is_active', true)
    .single()

  if (error || !tenant) {
    // Tenant not found or inactive - redirect to error page or main site
    const url = new URL('/tenant-not-found', request.url)
    url.hostname = getMainDomain(request.headers.get('host') || '')
    return NextResponse.redirect(url)
  }

  // Add tenant info to headers for use in the application
  supabaseResponse.headers.set('x-tenant-id', tenant.id)
  supabaseResponse.headers.set('x-tenant-subdomain', tenant.subdomain)
  supabaseResponse.headers.set('x-tenant-name', tenant.name)

  const pathname = request.nextUrl.pathname

  // Handle admin routes
  if (pathname.startsWith('/admin')) {
    return await handleAdminRoutes(request, supabaseResponse, supabase, tenant)
  }

  // Handle public store routes
  return await handlePublicStoreRoutes(request, supabaseResponse, supabase, tenant)
}

async function handleAdminRoutes(request: NextRequest, supabaseResponse: NextResponse, supabase: any, tenant: any) {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Admin routes require authentication - redirect to main login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Check if user has access to this tenant's admin
  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('role, permissions')
    .eq('tenant_id', tenant.id)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  const isOwner = tenant.owner_id === user.id
  
  if (!tenantUser && !isOwner) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/unauthorized'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

async function handlePublicStoreRoutes(request: NextRequest, supabaseResponse: NextResponse, supabase: any, tenant: any) {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Only protect specific customer routes
  const protectedRoutes = ['/account', '/checkout']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (!user && isProtectedRoute && !request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

function getMainDomain(hostname: string): string {
  // Extract main domain from hostname
  const host = hostname.split(':')[0]
  
  // Handle Vercel deployments
  if (host.endsWith('.vercel.app')) {
    const parts = host.split('.')
    if (parts.length >= 3) {
      // Return the project-name.vercel.app part
      return parts.slice(-3).join('.')
    }
  }
  
  // Handle regular domains
  const parts = host.split('.')
  if (parts.length > 2) {
    return parts.slice(1).join('.')
  }
  
  return host
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}