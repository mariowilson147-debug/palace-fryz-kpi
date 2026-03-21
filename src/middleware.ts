import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public routes
  const isPublicRoute = path === '/login' || path.startsWith('/api/auth');
  const isApiRoute = path.startsWith('/api') && !path.startsWith('/api/auth');

  // Check for the auth cookie
  const authCookie = request.cookies.get('pfms_auth_token')?.value;

  // Basic validation (expecting it to be set by our login route)
  const isAuthenticated = !!authCookie;

  if (!isAuthenticated && !isPublicRoute) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthenticated && path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
