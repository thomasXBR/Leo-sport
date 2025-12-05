import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TODO: Implement proper authentication middleware with Supabase
export function middleware(request: NextRequest) {
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
  const adminRoutes = ['/dashboard/admin'];
  const partnerRoutes = ['/dashboard/partner'];

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // TODO: Check if user is authenticated using Supabase session
    // TODO: Check user role for admin/partner specific routes
    
    // For now, allow all access (placeholder)
    console.log('Accessing protected route:', pathname);
    
    // Example of role-based protection (to be implemented):
    // if (adminRoutes.some(route => pathname.startsWith(route))) {
    //   // Check if user has admin role
    //   if (userRole !== 'admin') {
    //     return NextResponse.redirect(new URL('/dashboard/account', request.url));
    //   }
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - todas as rotas de API são liberadas
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};