import { NextResponse } from 'next/server';

export function middleware(request) {
  // Example: redirect from "/" to "/auth/login"
  // You can customize this logic
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Default: continue request
  return NextResponse.next();
}

// Optional: define matcher if you want to run middleware only on certain paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
