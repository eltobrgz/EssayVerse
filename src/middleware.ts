
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create a response object that we can modify and return
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client that can be used to manage the user's session
  // This client is configured to use the request and response cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        // IMPORTANT: The set and remove methods must modify the `response` object
        // that is returned at the end of the middleware.
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // This will refresh the session if it's expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Define routes that are accessible to everyone, even without authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/auth/callback',
    '/auth/update-password',
  ]
  
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || (route !== '/' && pathname.startsWith(route))
  )

  // Define routes that are only for unauthenticated users (e.g., login, signup)
  const authRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
    '/auth/update-password',
  ]
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If the user is not authenticated and the route is not public, redirect to login
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    // Optionally, you can add a `next` query param to redirect back after login
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If the user is authenticated and tries to access an auth route, redirect to dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // If we've reached this point, the user is either authenticated and accessing a protected route,
  // or anyone is accessing a public route. We return the response, which may have been
  // modified by the Supabase client to set a new session cookie.
  return response
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
