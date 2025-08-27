'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function LocalizedNotFound() {
  const t = useTranslations('NotFound');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
      <p className="text-xl mb-6">{t('description')}</p>
      <Link 
        href="/" 
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        {t('backHome')}
      </Link>
    </div>
  );
}