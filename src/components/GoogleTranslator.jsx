"use client";

import { useEffect } from "react";
import Script from "next/script";

// Prevent React crashes (removeChild / insertBefore) caused by Google Translate modifying DOM text nodes
if (typeof window !== "undefined" && typeof Node === "function" && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}

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

export default function GoogleTranslator({ locale = "en" }) {
  useEffect(() => {
    // Sync Google Translate cookie with active URL locale
    if (locale === "tr") {
      setGoogTransCookie("/en/tr");
    } else {
      clearGoogTransCookie();
      setGoogTransCookie("/en/en");
    }

    try {
      localStorage.setItem("preferredLocale", locale);
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000;`;
    } catch (e) {}

    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en", // Source HTML text is English
            includedLanguages: "en,tr",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    if (
      window.google?.translate?.TranslateElement &&
      !document.querySelector(".goog-te-combo")
    ) {
      window.googleTranslateElementInit();
    } else {
      const combo = document.querySelector(".goog-te-combo");
      if (combo) {
        if (locale === "tr") {
          combo.value = "tr";
        } else {
          const hasEn = Array.from(combo.options || []).some(
            (opt) => opt.value === "en"
          );
          combo.value = hasEn ? "en" : "";
        }
        combo.dispatchEvent(new Event("change"));
      }
    }
  }, [locale]);

  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }} />
      <Script
        id="google-translate-script"
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
