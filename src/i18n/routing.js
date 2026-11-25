import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['tr', 'en'],
  localePrefix: 'always',
  defaultLocale: 'tr',
  // Always open the site in Turkish. Without this, next-intl picks the language from the
  // browser's Accept-Language header / the saved NEXT_LOCALE cookie, so an English browser
  // (or a visitor who once picked English) would be redirected to /en instead of /tr.
  // English is still one click away: the language switcher navigates to /en/... explicitly.
  localeDetection: false,
});
