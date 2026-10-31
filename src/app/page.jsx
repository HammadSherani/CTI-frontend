"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LOCALES = ["tr", "en"];
const LOCALE_STORAGE_KEY = "preferredLocale";
const DEFAULT_LOCALE = "tr";

const getPreferredLocale = () => {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  // If user has explicitly selected a locale before
  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (storedLocale && LOCALES.includes(storedLocale)) {
    return storedLocale;
  }

  // By default always Turkish
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
