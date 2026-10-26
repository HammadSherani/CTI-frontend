"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import SmallLoader from "./SmallLoader";
import { useLocale } from "next-intl";

const languages = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

function setGoogTransCookie(val) {
  if (typeof document === "undefined") return;
  const domain = window.location.hostname;
  document.cookie = `googtrans=${val}; path=/;`;
  document.cookie = `googtrans=${val}; path=/; domain=${domain};`;
  if (domain.includes(".") && !domain.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    const parts = domain.split(".");
    if (parts.length > 1) {
      const root = parts.slice(-2).join(".");
      document.cookie = `googtrans=${val}; path=/; domain=.${root};`;
    }
  }
}

function clearGoogTransCookie() {
  if (typeof document === "undefined") return;
  const domain = window.location.hostname;
  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
  if (domain.includes(".") && !domain.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    const parts = domain.split(".");
    if (parts.length > 1) {
      const root = parts.slice(-2).join(".");
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${root};`;
    }
  }
}

export default function CustomTranslate() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [targetLangText, setTargetLangText] = useState("");
  const locale = useLocale();
  const [activeLang, setActiveLang] = useState(locale || "tr");
  const wrapperRef = useRef(null);

  // Sync active language with locale from URL
  useEffect(() => {
    if (locale && (locale === "tr" || locale === "en")) {
      setActiveLang(locale);
      if (locale === "tr") {
        setGoogTransCookie("/en/tr");
      } else {
        setGoogTransCookie("/en/en");
      }
    }
  }, [locale]);

  // Close dropdown on outside click
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
    if (langCode === activeLang) {
      setOpen(false);
      return;
    }

    setTargetLangText(
      langCode === "en" ? "Translating to English..." : "Sayfa Türkçeye çevriliyor..."
    );
    setLoading(true);
    setOpen(false);

    try {
      if (langCode === "tr") {
        setGoogTransCookie("/en/tr");
      } else {
        clearGoogTransCookie();
        setGoogTransCookie("/en/en");
      }

      localStorage.setItem("preferredLocale", langCode);
      document.cookie = `NEXT_LOCALE=${langCode}; path=/; max-age=31536000;`;
      setActiveLang(langCode);

      // Trigger Google Translate combo element
      const combo = document.querySelector(".goog-te-combo");
      if (combo) {
        if (langCode === "tr") {
          combo.value = "tr";
        } else {
          const hasEn = Array.from(combo.options || []).some(
            (opt) => opt.value === "en"
          );
          combo.value = hasEn ? "en" : "";
        }
        combo.dispatchEvent(new Event("change"));
      }

      // Compute new path with switched locale
      const currentPath = window.location.pathname;
      let newPath = currentPath;
      if (currentPath.startsWith("/" + activeLang)) {
        newPath = currentPath.replace("/" + activeLang, "/" + langCode);
      } else if (currentPath.startsWith("/en") || currentPath.startsWith("/tr")) {
        newPath = currentPath.replace(/^\/(en|tr)/, "/" + langCode);
      } else {
        newPath = "/" + langCode + currentPath;
      }
      const newUrl = newPath + window.location.search + window.location.hash;

      // Navigate with full reload to apply Google Translate cleanly
      setTimeout(() => {
        window.location.href = newUrl;
      }, 150);
    } catch (err) {
      console.error("Language switch error:", err);
      setLoading(false);
    }
  };

  const currentLang = languages.find((l) => l.code === activeLang) || languages[0];

  return (
    <>
      {loading && (
        <SmallLoader
          text={targetLangText || "Translating..."}
          loading={loading}
        />
      )}

      <div className="relative shrink-0 notranslate" ref={wrapperRef}>
        {/* ── Trigger Button ── */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={loading}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex items-center gap-1.5 text-gray-700 hover:text-primary-600 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 disabled:opacity-50 transition-all text-xs font-semibold cursor-pointer bg-white shadow-xs"
        >
          <span className="text-sm leading-none">{currentLang?.flag}</span>
          <span className="font-bold">{currentLang?.code?.toUpperCase()}</span>
          <Icon
            icon="mdi:chevron-down"
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* ── Dropdown ── */}
        {open && (
          <div
            role="listbox"
            className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="px-3.5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/60">
              Dil Seçin / Language
            </div>
            <div className="p-1 space-y-0.5">
              {languages.map((lang) => {
                const isActive = activeLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      isActive
                        ? "bg-primary-50 text-primary-700 font-bold"
                        : "hover:bg-gray-50 text-gray-700 font-medium"
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span className="truncate flex-1">{lang.label}</span>
                    {isActive && (
                      <Icon
                        icon="mdi:check"
                        className="w-4 h-4 text-primary-600 shrink-0"
                      />
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