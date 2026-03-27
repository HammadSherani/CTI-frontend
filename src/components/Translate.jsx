"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTranslations,useLocale } from "next-intl";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" }
];

export default function CustomTranslate() {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const t = useTranslations("LanguageSwitcher"); 

  const changeLanguage = (langCode) => {
    router.replace(pathname, { locale: langCode });
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-gray-500 px-4 py-2 rounded-xl border"
      >
        <Icon icon="mdi:translate" className="w-5 h-5" />

        {t("language")} {/* ✅ translated label */}

        <Icon
          icon="mdi:chevron-down"
          className={`w-4 h-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border overflow-hidden z-50">
          
          {/* Header */}
          <div className="px-4 py-2 text-sm font-semibold text-gray-500 border-b">
            {t("selectLanguage")} {/* ✅ translated */}
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto">
            {languages.map((lang) => {
              const isActive = locale === lang.code;

              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex items-center gap-3 w-full px-4 py-2 text-left transition ${
                    isActive
                      ? "bg-orange-100 text-orange-600 font-semibold"
                      : "hover:bg-orange-50 text-gray-700"
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm">{lang.label}</span>

                  {isActive && (
                    <Icon
                      icon="mdi:check"
                      className="w-4 h-4 ml-auto text-orange-600"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}