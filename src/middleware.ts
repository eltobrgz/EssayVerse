
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // O objeto `response` é criado aqui e será modificado pelos manipuladores
  // de cookie abaixo se a sessão precisar ser atualizada.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Se o cookie for definido, atualize-o nos cookies da requisição.
          // Isso é crucial para que os Server Components possam acessar a sessão atualizada.
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // A resposta é recriada para garantir que ela use o valor atualizado
          // dos cookies da requisição.
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          // O cookie é definido na resposta para ser enviado de volta ao navegador.
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Se o cookie for removido, atualize-o nos cookies da requisição.
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.delete(name, options)
        },
      },
    }
  )

  // Atualiza a sessão do usuário se expirada.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Define rotas que são acessíveis a todos, mesmo sem autenticação
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

  // Define rotas que são apenas para usuários não autenticados (ex: login, signup)
  const authRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
    '/auth/update-password',
  ]
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Se o usuário não está autenticado e a rota não é pública, redireciona para o login
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Se o usuário está autenticado e tenta acessar uma rota de autenticação, redireciona para o dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Retorna a resposta, que pode ter sido modificada pelos manipuladores de cookie.
  return response
}

export const config = {
  matcher: [
    /*
     * Faz a correspondência de todos os caminhos de solicitação, exceto para os que começam com:
     * - _next/static (arquivos estáticos)
     * - _next/image (arquivos de otimização de imagem)
     * - favicon.ico (arquivo de favicon)
     * Sinta-se à vontade para modificar este padrão para incluir mais caminhos.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
