import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

const locales = ['en', 'tr'];

export default getRequestConfig(async ({requestLocale}) => {
  // Use requestLocale from middleware or fallback
  let locale = requestLocale;
  
  // Validate and fallback to default if needed
  if (!locale || !locales.includes(locale)) {
    locale = 'en'; // Default fallback
  }

  try {
    const messages = (await import(`./messages/${locale}.json`)).default;
    
    return {
      locale,
      messages
    };
  } catch (error) {
    // If message file doesn't exist, fallback to English
    console.error(`Could not load messages for locale: ${locale}`, error);
    
    const fallbackMessages = (await import(`./messages/en.json`)).default;
    
    return {
      locale: 'en',
      messages: fallbackMessages
    };
  }
});