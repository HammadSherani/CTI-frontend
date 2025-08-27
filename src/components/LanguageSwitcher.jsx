'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = () => {
    const otherLocale = currentLocale === 'en' ? 'tr' : 'en';
    
    // Get path without current locale
    const segments = pathname.split('/').filter(Boolean);
    const pathWithoutLocale = segments.slice(1).join('/');
    
    // Build new path
    const newPath = `/${otherLocale}${pathWithoutLocale ? '/' + pathWithoutLocale : ''}`;
    
    console.log('Switching from', currentLocale, 'to', otherLocale);
    console.log('Current path:', pathname);
    console.log('New path:', newPath);
    
    router.push(newPath);
  };

  return (
    <button
      onClick={switchLanguage}
      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
    >
      {currentLocale === 'en' ? (
        <>
          <span>🇹🇷</span>
          <span>Türkçe</span>
        </>
      ) : (
        <>
          <span>🇬🇧</span>
          <span>English</span>
        </>
      )}
    </button>
  );
}