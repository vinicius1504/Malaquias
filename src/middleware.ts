import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de segurança para o site Malaquias Contabilidade
 * Aplica proteções adicionais em todas as requisições
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Adiciona nonce para scripts inline (CSP)
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // Headers de segurança adicionais no middleware
  response.headers.set('X-Request-Id', crypto.randomUUID());

  // Previne cache de dados sensíveis
  if (request.nextUrl.pathname.startsWith('/api/')) {
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
  if (request.nextUrl.pathname.includes('..')) {
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
