// Create this as a separate page: src/app/[locale]/test/page.js
'use client';
import { useTranslations, useLocale } from 'next-intl';

export default function TestPage() {
  const locale = useLocale();
  
  // Test without useTranslations first
  const staticTest = {
    en: "English Text",
    tr: "Turkish Text - Türkçe Metin"
  };

  // Then test with useTranslations
  let t;
  let translationError = null;
  try {
    t = useTranslations('Hero');
  } catch (error) {
    translationError = error.message;
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Translation Test Page</h1>
      
      <div className="space-y-2">
        <p><strong>Current Locale:</strong> {locale}</p>
        <p><strong>Static Test:</strong> {staticTest[locale]}</p>
        
        {translationError ? (
          <p className="text-red-500"><strong>Translation Error:</strong> {translationError}</p>
        ) : (
          <div>
            <p><strong>useTranslations Test:</strong></p>
            <p>Welcome Text: {t('welcomeText')}</p>
            <p>Main Heading: {t('mainHeading')}</p>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Expected Results:</h2>
        <p>English (/en): "English Text" + "Welcome to Our Store"</p>
        <p>Turkish (/tr): "Turkish Text - Türkçe Metin" + "Mağazamıza Hoş Geldiniz"</p>
      </div>
    </div>
  );
}