"use client";
import { useEffect, useState, useRef } from "react";
import { Icon } from "@iconify/react";

export default function CustomTranslate() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const addScript = document.createElement("script");
    addScript.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(addScript);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en" },
        "google_translate_element"
      );
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const changeLanguage = (lang) => {
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
    }
    setOpen(false);
  };

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "tr", label: "Turkish", flag: "🇹🇷" },
    { code: "ar", label: "Arabic", flag: "🇸🇦" },

    { code: "ur", label: "Urdu", flag: "🇵🇰" },
    { code: "hi", label: "Hindi", flag: "🇮🇳" },
    { code: "fr", label: "French", flag: "🇫🇷" },
    { code: "de", label: "German", flag: "🇩🇪" },
    { code: "es", label: "Spanish", flag: "🇪🇸" },
    { code: "zh-CN", label: "Chinese", flag: "🇨🇳" },
    { code: "ru", label: "Russian", flag: "🇷🇺" },
    { code: "fa", label: "Persian", flag: "🇮🇷" },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden Google Translate */}
      <div id="google_translate_element" className="hidden"></div>

      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        // bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700
        className="flex items-center gap-2   text-gray-500 px-4 py-2 rounded-xl transition-all duration-200"
      >
        <Icon icon="mdi:translate" className="w-5 h-5" />
        Language
        <Icon
          icon="mdi:chevron-down"
          className={`w-4 h-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
<div className="fixed right-4 top-16 !z-[2000] w-52 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-fadeIn">          
          {/* Header */}
          <div className="px-4 py-2 text-sm font-semibold text-gray-500 border-b">
            Select Language
          </div>

          {/* Language List */}
          <div className="max-h-60 overflow-y-auto !z-[2000]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className="flex items-center gap-3 !z-50 w-full px-4 py-2 hover:bg-orange-50 transition text-left"
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm font-medium text-gray-700">
                  {lang.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}