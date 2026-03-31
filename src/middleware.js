import { NextResponse } from 'next/server';

import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'tr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed' 
});
export function middleware(request) {
    const { pathname } = request.nextUrl;

  // Default: continue request
  // return NextResponse.next();

    return intlMiddleware(request);

}

// Optional: define matcher if you want to run middleware only on certain paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets).*)'],
};
