// src/app/page.js (Root page - Auto redirect)
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function RootPage() {
  // Get user's preferred language from browser
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  
  // Simple language detection
  const prefersTurkish = acceptLanguage.toLowerCase().includes('tr');
  const defaultLocale = prefersTurkish ? 'tr' : 'en';
  
  // Redirect to appropriate language
  redirect(`/${defaultLocale}`);
}