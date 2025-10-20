import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que requerem autenticação
const PROTECTED_ROUTES = [
  '/client',
  '/barber',
  '/admin',
  '/settings',
  '/booking'
]

// Rotas específicas por role
const ROLE_ROUTES = {
  admin: ['/admin'],
  barber: ['/barber'],
  client: ['/client', '/booking']
}

// Rotas públicas (não requerem autenticação)
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/about',
  '/support',
  '/for-barbers',
  '/map',
  '/barbershop'
]

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
}

function getRoleFromAuthData(authData: string): string | null {
  try {
    const parsed = JSON.parse(authData)
    return parsed.role || null
  } catch {
    return null
  }
}

function canAccessRoute(pathname: string, userRole: string): boolean {
  // Admin pode acessar tudo
  if (userRole === 'admin') return true

  // Verificar rotas específicas por role
  for (const [role, routes] of Object.entries(ROLE_ROUTES)) {
    if (routes.some(route => pathname.startsWith(route))) {
      return userRole === role
    }
  }

  return true
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Permitir acesso a rotas públicas
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Verificar se é uma rota protegida
  if (isProtectedRoute(pathname)) {
    const authCookie = request.cookies.get('naregua-auth')?.value

    if (!authCookie) {
      // Redirecionar para login se não tem dados de auth
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const userRole = getRoleFromAuthData(authCookie)
    
    if (!userRole) {
      // Dados inválidos, redirecionar para login
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    if (!canAccessRoute(pathname, userRole)) {
      // Usuário não tem permissão, redirecionar para dashboard apropriado
      switch (userRole) {
        case 'admin':
          return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        case 'barber':
          return NextResponse.redirect(new URL('/barber/dashboard', request.url))
        case 'client':
          return NextResponse.redirect(new URL('/client/dashboard', request.url))
        default:
          return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}