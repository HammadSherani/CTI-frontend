"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LOCALES = ["en", "tr"];
const LOCALE_STORAGE_KEY = "preferredLocale";
const DEFAULT_LOCALE = "en";

const getPreferredLocale = () => {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (storedLocale && LOCALES.includes(storedLocale)) {
    return storedLocale;
  }

  const browserLocale = navigator.language?.slice(0, 2)?.toLowerCase();
  if (browserLocale && LOCALES.includes(browserLocale)) {
    return browserLocale;
  }

  return DEFAULT_LOCALE;
};

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const locale = getPreferredLocale();
    router.replace(`/${locale}`);
  }, [router]);

  return null;
}
