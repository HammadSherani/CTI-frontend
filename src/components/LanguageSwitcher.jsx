'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ManualLanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState('en');

  // Detect locale from pathname
  useEffect(() => {
    if (pathname.startsWith('/tr')) {
      setCurrentLocale('tr');
    } else if (pathname.startsWith('/en')) {
      setCurrentLocale('en');
    }
  }, [pathname]);

  const switchLanguage = () => {
    const newLocale = currentLocale === 'en' ? 'tr' : 'en';
    
    let newPath;
    
    if (pathname === '/en' || pathname === '/en/') {
      newPath = '/tr';
    } else if (pathname === '/tr' || pathname === '/tr/') {
      newPath = '/en';
    } else if (pathname.startsWith('/en/')) {
      newPath = pathname.replace('/en/', '/tr/');
    } else if (pathname.startsWith('/tr/')) {
      newPath = pathname.replace('/tr/', '/en/');
    } else {
      // Default fallback
      newPath = `/${newLocale}`;
    }
    
    console.log('Current locale:', currentLocale);
    console.log('Current path:', pathname);
    console.log('New path:', newPath);
    
    router.push(newPath);
  };

  return (
    <div className="flex flex-col items-center   rounded">
      <button
        onClick={switchLanguage}
        className="flex items-center space-x-2 px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
      >
        {currentLocale === 'en' ? (
          <>
            <span>🇹🇷</span>
            <span>Türkçe'ye Geç</span>
          </>
        ) : (
          <>
            <span>🇬🇧</span>
            <span>Switch to English</span>
          </>
        )}
      </button>
    </div>
  );
}