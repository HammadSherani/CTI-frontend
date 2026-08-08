"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import SmallLoader from "./SmallLoader";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
];

export default function CustomTranslate() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Home.LanguageSwitcher");

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const changeLanguage = (langCode) => {
    if (langCode === locale) {
      setOpen(false);
      return;
    }
    setLoading(true);
    setOpen(false);
    window.localStorage.setItem("preferredLocale", langCode);
    router.replace(pathname, { locale: langCode });
    setTimeout(() => setLoading(false), 1000);
  };

  const currentLang = languages.find((l) => l.code === locale);

  return (
    <>
      {loading && <SmallLoader text="Switching language..." loading={loading} />}

      <div className="relative shrink-0" ref={wrapperRef}>
        {/* ── Trigger Button ── */}
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={loading}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex items-center gap-1 text-gray-500 px-2 py-1 rounded-md border border-gray-200 hover:border-gray-300 hover:text-gray-700 disabled:opacity-50 transition-colors text-[11px] leading-none"
        >
          <span className="text-[13px] leading-none">{currentLang?.flag}</span>
          <span className="hidden sm:inline">{currentLang?.code?.toUpperCase()}</span>
          <Icon
            icon="mdi:chevron-down"
            className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* ── Dropdown ── */}
        {open && (
          <div
            role="listbox"
            className="absolute right-0 mt-1.5 w-40 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
              {t("selectLanguage")}
            </div>
            <div className="max-h-48 overflow-y-auto">
              {languages.map((lang) => {
                const isActive = locale === lang.code;
                return (
                  <button
                    key={lang.code}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex items-center gap-2 w-full px-3 py-1.5 text-left text-[12px] transition-colors ${
                      isActive
                        ? "bg-orange-50 text-orange-600 font-semibold"
                        : "hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <span className="text-sm">{lang.flag}</span>
                    <span className="truncate">{lang.label}</span>
                    {isActive && (
                      <Icon icon="mdi:check" className="w-3.5 h-3.5 ml-auto text-orange-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}