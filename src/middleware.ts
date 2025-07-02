
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Esta variável `response` é a chave. Ela será passada para o manipulador de cookies do Supabase
  // e potencialmente atualizada com um novo cookie de sessão.
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
          // O método `set` é chamado sempre que o cliente Supabase precisa
          // atualizar o cookie da sessão.
          // Atualizamos o cookie na requisição para que os Server Components possam vê-lo.
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // Recriamos o objeto de resposta para garantir que ele tenha os cabeçalhos de requisição atualizados.
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          // Definimos o cookie na resposta para que ele seja enviado ao navegador.
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // O método `remove` é chamado sempre que o cliente Supabase precisa
          // deslogar o usuário.
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

  // Esta chamada é o que atualiza a sessão do usuário.
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

  // Se o usuário não está logado e a rota não é pública, redireciona para o login
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Se o usuário está logado e tenta acessar uma rota de autenticação, redireciona para o dashboard
  if (user && isAuthRoute) {
    // ESTA É A CORREÇÃO CRUCIAL. Criamos uma resposta de redirecionamento,
    // mas antes de retorná-la, copiamos todos os cabeçalhos `Set-Cookie`
    // que o cliente Supabase possa ter definido no objeto `response` original.
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
    
    response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }
  
  // Se nenhum redirecionamento for necessário, retorna a resposta original, que pode ter sido
  // atualizada pelo cliente Supabase para renovar a sessão.
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
