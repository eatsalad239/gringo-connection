import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if path starts with /es
  if (pathname.startsWith('/es')) {
    // Add locale to headers so pages can access it
    const response = NextResponse.next();
    response.headers.set('x-locale', 'es');
    return response;
  }
  
  // Default to English
  const response = NextResponse.next();
  response.headers.set('x-locale', 'en', { append: false });
  return response;
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
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};

