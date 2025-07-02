import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define public and authentication routes that do not require a logged-in user
  const publicRoutes = [
    '/', // Landing page
    '/login',
    '/signup',
    '/forgot-password',
    '/auth/callback',
    '/auth/update-password'
  ]

  // Determine if the current route is a public or auth route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || (route !== '/' && pathname.startsWith(route))
  )
  
  const isAuthRoute = [
    '/login', 
    '/signup', 
    '/forgot-password', 
    '/auth/update-password'
  ].some(route => pathname.startsWith(route))

  // Create a response object that can be modified
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client that can read and write cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => response.cookies.set({ name, value, ...options }),
        remove: (name, options) => response.cookies.set({ name, value: '', ...options }),
      },
    }
  )

  // Refresh session and get user data. This is crucial for Server Components.
  const { data: { user } } = await supabase.auth.getUser()

  if (user && isAuthRoute) {
    // If a logged-in user tries to access an auth page (e.g., login),
    // redirect them to the dashboard.
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!user && !isPublicRoute) {
    // If a non-logged-in user tries to access a protected page,
    // redirect them to the login page.
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname); // Optionally, pass the intended destination
    return NextResponse.redirect(loginUrl);
  }

  // The request is allowed.
  // The response object might have an updated session cookie from `getUser()`.
  // It's crucial to return this response to set the cookie in the browser.
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
