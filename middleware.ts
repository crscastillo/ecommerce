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

  // Debug logging for production issues
  console.log('[Middleware] Request Info:', {
    hostname,
    subdomain,
    isMainDomain,
    pathname: request.nextUrl.pathname,
    url: request.url,
    userAgent: request.headers.get('user-agent')?.slice(0, 50)
  })

  // Handle main domain routing (for tenant signup, main site, etc.)
  if (isMainDomain) {
    return await handleMainDomain(request, supabaseResponse)
  }

  // Handle tenant subdomain routing
  return await handleTenantSubdomain(request, supabaseResponse, subdomain)
}

function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0]
  
  console.log('[Middleware] Extracting subdomain from:', host)
  
  // Get domains from environment or use defaults
  const productionDomain = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'aluro.shop'
  const devDomain = 'localhost'
  
  // Handle production domain (aluro.shop)
  if (host === productionDomain || host === `www.${productionDomain}`) {
    console.log('[Middleware] Main domain detected:', host)
    return null // Main domain
  }
  
  // Handle subdomains of production domain (peakmode.aluro.shop)
  if (host.endsWith(`.${productionDomain}`)) {
    const parts = host.split('.')
    console.log('[Middleware] Production subdomain parts:', parts)
    if (parts.length >= 3) {
      const subdomain = parts[0]
      console.log('[Middleware] Extracted subdomain:', subdomain)
      return subdomain
    }
  }
  
  // Handle Vercel preview deployments
  if (host.endsWith('.vercel.app')) {
    const parts = host.split('.')
    console.log('[Middleware] Vercel domain parts:', parts)
    // If it's just project-name.vercel.app (3 parts), it's the main domain
    if (parts.length === 3) {
      console.log('[Middleware] Vercel main domain')
      return null
    }
    // If it's subdomain.project-name.vercel.app (4+ parts), extract subdomain
    if (parts.length > 3) {
      const subdomain = parts[0]
      console.log('[Middleware] Vercel subdomain:', subdomain)
      return subdomain
    }
  }
  
  // Handle development
  if (host === devDomain || host.startsWith(`${devDomain}:`)) {
    console.log('[Middleware] Development main domain')
    return null // Main domain for localhost
  }
  
  // For localhost development like tenant.localhost:3000
  if (host.includes('.localhost') && host.split('.').length > 1) {
    const subdomain = host.split('.')[0]
    console.log('[Middleware] Development subdomain:', subdomain)
    return subdomain
  }
  
  console.log('[Middleware] No subdomain found for:', host)
  return null
}

async function handleMainDomain(request: NextRequest, supabaseResponse: NextResponse) {
  const pathname = request.nextUrl.pathname
  
  // Handle platform admin routes
  if (pathname.startsWith('/platform')) {
    return await handlePlatformAdminRoutes(request, supabaseResponse)
  }
  
  // Allow other main domain routes to render (homepage, pricing, etc.)
  return supabaseResponse
}

async function handleTenantSubdomain(request: NextRequest, supabaseResponse: NextResponse, subdomain: string) {
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('[Middleware] Missing Supabase environment variables')
    return new NextResponse('Missing database configuration', { status: 500 })
  }
  
  console.log('[Middleware] Using Supabase URL:', supabaseUrl)
  
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
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
  console.log('[Middleware] Looking up tenant:', subdomain)
  
  // Try with all columns first, fallback if columns don't exist
  let { data: tenant, error } = await supabase
    .from('tenants')
    .select('id, name, subdomain, is_active, settings, owner_id, admin_language, store_language')
    .eq('subdomain', subdomain)
    .eq('is_active', true)
    .maybeSingle()

  // If error might be due to missing columns, try with basic columns only
  if (error && error.message.includes('column')) {
    console.log('[Middleware] Trying basic tenant lookup due to column error:', error.message)
    const { data: basicTenant, error: basicError } = await supabase
      .from('tenants')
      .select('id, name, subdomain, is_active, settings, owner_id')
      .eq('subdomain', subdomain)
      .eq('is_active', true)
      .maybeSingle()
    
    // Add missing properties for compatibility
    if (basicTenant) {
      tenant = {
        ...basicTenant,
        admin_language: 'en',
        store_language: 'en'
      }
    } else {
      tenant = basicTenant
    }
    error = basicError
  }

  console.log('[Middleware] Tenant lookup result:', { 
    subdomain, 
    found: !!tenant, 
    error: error?.message,
    tenant: tenant ? { id: tenant.id, name: tenant.name, subdomain: tenant.subdomain } : null
  })

  if (error) {
    console.error('[Middleware] Database error:', error)
    // Return error page with more details for debugging
    const errorDetails = {
      error: error.message,
      subdomain,
      timestamp: new Date().toISOString()
    }
    return new NextResponse(`Database error: ${error.message}. Details: ${JSON.stringify(errorDetails)}`, { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }


  if (!tenant) {
    // Tenant not found or inactive - redirect to main site with error
    console.log('[Middleware] Tenant not found, redirecting to main domain')
    const mainDomain = getMainDomain(request.headers.get('host') || '')
    const redirectUrl = `https://${mainDomain}/tenant-not-found?subdomain=${subdomain}`
    console.log('[Middleware] Redirecting to:', redirectUrl)
    return NextResponse.redirect(redirectUrl)
  }

  // Add tenant info to headers for use in the application
  supabaseResponse.headers.set('x-tenant-id', tenant.id)
  supabaseResponse.headers.set('x-tenant-subdomain', tenant.subdomain)
  supabaseResponse.headers.set('x-tenant-name', tenant.name)
  
  // Determine locale based on route type (admin vs store) and tenant preferences
  const currentPath = request.nextUrl.pathname
  let locale = 'en'
  
  if (currentPath.startsWith('/admin')) {
    // Use admin language for admin routes
    locale = tenant.admin_language || 'en'
  } else {
    // Use store language for public routes
    locale = tenant.store_language || 'en'
  }
  
  supabaseResponse.headers.set('x-locale', locale)
  
  console.log('[Middleware] Tenant found, setting headers:', {
    'x-tenant-id': tenant.id,
    'x-tenant-subdomain': tenant.subdomain,
    'x-tenant-name': tenant.name,
    'x-locale': locale,
    'currentPath': currentPath,
    'isAdmin': currentPath.startsWith('/admin'),
    'admin_language': tenant.admin_language,
    'store_language': tenant.store_language
  })

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

  const isOwner = tenant.owner_id === user.id
  
  // If user is the owner, allow access immediately
  if (isOwner) {
    return supabaseResponse
  }

  // Check if user has access to this tenant's admin (only for non-owners)
  const { data: tenantUser, error } = await supabase
    .from('tenant_users')
    .select('role, permissions')
    .eq('tenant_id', tenant.id)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('Error checking tenant user access:', error)
    const url = request.nextUrl.clone()
    url.pathname = '/admin/unauthorized'
    return NextResponse.redirect(url)
  }
  
  if (!tenantUser) {
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

async function handlePlatformAdminRoutes(request: NextRequest, supabaseResponse: NextResponse) {
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

  const { data: { user } } = await supabase.auth.getUser()
  
  // Platform admin routes require authentication
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Check if user is a platform super admin
  const platformAdminEmail = process.env.PLATFORM_ADMIN_EMAIL
  if (!platformAdminEmail || user.email !== platformAdminEmail) {
    const url = request.nextUrl.clone()
    url.pathname = '/unauthorized'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

function getMainDomain(hostname: string): string {
  // Extract main domain from hostname
  const host = hostname.split(':')[0]
  const productionDomain = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'aluro.shop'
  
  // If we're on production domain, return it
  if (host.endsWith(`.${productionDomain}`) || host === productionDomain) {
    return productionDomain
  }
  
  // Handle Vercel deployments
  if (host.endsWith('.vercel.app')) {
    const parts = host.split('.')
    if (parts.length >= 3) {
      // Return the project-name.vercel.app part
      return parts.slice(-3).join('.')
    }
  }
  
  // Handle localhost development
  if (host.includes('localhost')) {
    return 'localhost:3000'
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