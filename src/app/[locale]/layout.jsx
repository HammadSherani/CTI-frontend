import { ToastContainer } from "react-toastify";
import { SocketProvider } from "@/contexts/SocketProvider";
import ReduxProvider from "@/components/website/provider/ReduxProvider";
import AuthListener from "@/components/AuthListener";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

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
            {children}
            <ToastContainer />
          </SocketProvider>
        </CurrencyProvider>
      </ReduxProvider>
    </NextIntlClientProvider>
  );
}