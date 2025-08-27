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
  const messages = await getMessages();
  
  return {
    title: messages?.metadata?.title || "My Multilingual App",
    description: messages?.metadata?.description || "A multilingual Next.js application",
  };
}

export default async function RootLayout({ children, params }) {
  const {locale} = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <ReduxProvider>
            {children}
            <ToastContainer />
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}