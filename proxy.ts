import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Proxy otimizado para Next.js 16+
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas que NUNCA devem ser bloqueadas (webhooks externos)
  const publicWebhookRoutes = [
    '/api/shipping/webhook',
    '/api/webhook/melhorenvio',
    '/api/payments/webhook',
    '/api/webhooks',
  ];

  // Se for uma rota de webhook, DEIXE PASSAR DIRETO (não bloqueie)
  const isWebhookRoute = publicWebhookRoutes.some(route => pathname.startsWith(route));
  if (isWebhookRoute) {
    return NextResponse.next();
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'];

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // TODO: Implementar autenticação com Supabase
    // Por enquanto, permitir acesso
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};




