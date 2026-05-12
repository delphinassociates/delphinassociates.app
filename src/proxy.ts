import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname

  // ── Skip PWA and static assets ──
  if (
    pathname.includes('/sw.js') || 
    pathname.includes('/manifest.json') || 
    pathname.includes('/manifest.webmanifest') ||
    pathname.includes('/workbox-') ||
    pathname.includes('/worker-') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return supabaseResponse
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()

    const isLoginPage = pathname === '/login' || pathname === '/'
    const isAdminPath = pathname.startsWith('/admin')
    const isSupervisorPath = pathname.startsWith('/supervisor')

    // ── Unauthenticated: redirect to login ──
    if (!user && !isLoginPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (user) {
      const role: string = user.app_metadata?.userRole || ''

      // ── Authenticated on login page: redirect to their dashboard ──
      if (isLoginPage) {
        const url = request.nextUrl.clone()
        url.pathname = role === 'ADMIN' ? '/admin/dashboard' : '/supervisor/dashboard'
        return NextResponse.redirect(url)
      }

      // ── ADMIN trying to access supervisor routes ──
      if (isAdminPath && role !== 'ADMIN') {
        const url = request.nextUrl.clone()
        url.pathname = '/supervisor/dashboard'
        return NextResponse.redirect(url)
      }

      // ── SUPERVISOR trying to access admin routes ──
      if (isSupervisorPath && role !== 'SUPERVISOR' && role !== 'ADMIN') {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }
    }
  } catch (err) {
    console.error('Middleware failure')
    // On error, let the request through or redirect to login as safety
  }

  // ── Set Security Headers ──
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Prevent caching of authenticated routes to protect sensitive data
  if (pathname.startsWith('/admin') || pathname.startsWith('/supervisor')) {
    supabaseResponse.headers.set('Cache-Control', 'no-store, max-age=0')
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
