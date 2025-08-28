import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

const locales = ['en', 'tr'];

export default getRequestConfig(async ({requestLocale}) => {
  // Use requestLocale from middleware
  let locale = requestLocale;
  
  // Validate locale
  if (!locale || !locales.includes(locale)) {
    console.log('Invalid locale, falling back to en:', locale);
    locale = 'en';
  }

  console.log('Loading messages for locale:', locale);

  try {
    const messages = (await import(`./messages/${locale}.json`)).default;
    
    console.log('Messages loaded successfully for:', locale);
    console.log('Message keys:', Object.keys(messages));
    
    if (messages.Hero) {
      console.log('Hero welcomeText:', messages.Hero.welcomeText);
    }
    
    return {
      locale,
      messages,
      // Add time zone and other config
      timeZone: 'Europe/Istanbul'
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    
    // Fallback to English
    const fallbackMessages = (await import(`./messages/en.json`)).default;
    
    return {
      locale: 'en',
      messages: fallbackMessages,
      timeZone: 'Europe/Istanbul'
    };
  }
});