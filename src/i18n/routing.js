import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  locales: ['en', 'tr'],
  localePrefix: 'always' ,
  defaultLocale: 'en'
});