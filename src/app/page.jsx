"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The site always opens in Turkish. Switching to English is an explicit choice made with the
// language switcher, which navigates straight to /en/... (so it does not depend on this page).
const DEFAULT_LOCALE = "tr";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${DEFAULT_LOCALE}`);
  }, [router]);

  return null;
}
