import "./globals.css";
import { ToastContainer } from "react-toastify";
import ReduxProvider from "@/components/website/provider/ReduxProvider";
import {NextIntlClientProvider} from 'next-intl';

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
  
  // Load messages manually
  let messages = {};
  try {
    if (locale === 'tr') {
      messages = (await import('../../../messages/tr.json')).default;
      console.log('Turkish messages loaded:', Object.keys(messages));
    } else {
      messages = (await import('../../../messages/en.json')).default;
      console.log('English messages loaded:', Object.keys(messages));
    }
  } catch (error) {
    console.error('Failed to load messages:', error);
    // Empty messages object
    messages = {
      Hero: {
        welcomeText: locale === 'tr' ? 'Hoş Geldiniz' : 'Welcome',
        mainHeading: locale === 'tr' ? 'Test Başlık' : 'Test Heading'
      }
    };
  }

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ReduxProvider>
            {/* Debug info */}
            {/* <div className="fixed top-0 right-0 z-50 bg-blue-500 text-white p-2 text-xs">
              {locale} | Keys: {Object.keys(messages).join(', ')}
            </div> */}
            
            {children}
            <ToastContainer />
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}