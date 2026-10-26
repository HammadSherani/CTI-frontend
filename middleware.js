import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/routing';
 
const handleI18nRouting = createMiddleware(routing);

export default function middleware(request) {
  const response = handleI18nRouting(request);
  const pathname = request.nextUrl.pathname;

  let targetLocale = null;
  if (pathname.startsWith('/tr')) {
    targetLocale = 'tr';
  } else if (pathname.startsWith('/en')) {
    targetLocale = 'en';
  } else {
    const location = response.headers.get('location');
    if (location) {
      if (location.includes('/tr')) targetLocale = 'tr';
      else if (location.includes('/en')) targetLocale = 'en';
    }
  }

  if (targetLocale === 'tr') {
    response.cookies.set('googtrans', '/en/tr', { path: '/' });
    response.cookies.set('NEXT_LOCALE', 'tr', { path: '/' });
  } else if (targetLocale === 'en') {
    response.cookies.set('googtrans', '/en/en', { path: '/' });
    response.cookies.set('NEXT_LOCALE', 'en', { path: '/' });
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};