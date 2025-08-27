import "./globals.css";
import { ToastContainer } from "react-toastify";
import ReduxProvider from "@/components/website/provider/ReduxProvider";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

export function generateStaticParams() {
  return [{locale: 'en'}, {locale: 'tr'}];
}

export async function generateMetadata({params}) {
  const {locale} = await params;
  
  return {
    title: `My Website - ${locale === 'tr' ? 'Türkçe' : 'English'}`,
    description: locale === 'tr' ? 'Türkçe açıklama' : 'English description',
  };
}

export default async function RootLayout({ children, params }) {
  const {locale} = await params;
  const messages = await getMessages();

  // Debug log
  console.log('Layout Debug:');
  console.log('- Locale:', locale);
  console.log('- Messages keys:', Object.keys(messages || {}));
  console.log('- Hero messages:', messages?.Hero ? Object.keys(messages.Hero) : 'Missing');

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ReduxProvider>
            {/* Debug info on page */}
            <div className="fixed top-0 right-0 z-50 bg-black text-white p-2 text-xs">
              Locale: {locale} | Messages: {messages ? 'Loaded' : 'Missing'}
            </div>
            
            {children}
            <ToastContainer />
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}