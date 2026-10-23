import { ToastContainer } from "react-toastify";
import { SocketProvider } from "@/contexts/SocketProvider";
import ReduxProvider from "@/components/website/provider/ReduxProvider";
import AuthListener from "@/components/AuthListener";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import NotificationSetup from "@/components/NotificationSetup";

import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import './globals.css';
import GoogleTranslator from "@/components/GoogleTranslator";
const locales = ["en", "tr"];

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ReduxProvider>
        <CurrencyProvider>
          <AuthListener />
          <SocketProvider>
            <NotificationSetup />
            <GoogleTranslator />
            {children}
            <ToastContainer />
          </SocketProvider>
        </CurrencyProvider>
      </ReduxProvider>
    </NextIntlClientProvider>
  );
}