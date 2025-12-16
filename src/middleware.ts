import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware de segurança para o site Malaquias Contabilidade
 * Aplica proteções adicionais em todas as requisições
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ==========================================
  // PROTEÇÃO DE ROTAS ADMIN
  // ==========================================
  if (pathname.startsWith('/admin')) {
    // NextAuth v5 usa AUTH_SECRET, mas suporta NEXTAUTH_SECRET para compatibilidade
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    const token = await getToken({
      req: request,
      secret,
    });
    const isLoginPage = pathname === '/admin/login';

    // Se não está logado e não é página de login, redireciona
    if (!token && !isLoginPage) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Se está logado e tentando acessar login, vai pro dashboard
    if (token && isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Proteção de rotas por role (DEV only)
    const devOnlyRoutes = ['/admin/usuarios', '/admin/logs', '/admin/config'];
    if (token && devOnlyRoutes.some(route => pathname.startsWith(route))) {
      if (token.role !== 'dev') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
  }

  // ==========================================
  // SEGURANÇA GERAL
  // ==========================================
  const response = NextResponse.next();

  // Headers de segurança adicionais no middleware
  response.headers.set('X-Request-Id', crypto.randomUUID());

  // Previne cache de dados sensíveis
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
  }

  // Bloqueia requisições suspeitas
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /dirbuster/i,
    /gobuster/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userAgent)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // Previne path traversal
  if (pathname.includes('..')) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // Limita tamanho de query strings para prevenir DoS
  const queryString = request.nextUrl.search;
  if (queryString.length > 2048) {
    return new NextResponse('URI Too Long', { status: 414 });
  }

  return response;
}

// Configuração de quais rotas o middleware deve atuar
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
