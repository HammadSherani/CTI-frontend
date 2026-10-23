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

export default function GoogleTranslator() {
  useEffect(() => {
    // Default to Turkish unless user explicitly chose English
    const saved = localStorage.getItem("preferredLocale");
    const domain = window.location.hostname;
    if (saved === "en") {
      document.cookie = "googtrans=/en/en; path=/;";
      document.cookie = `googtrans=/en/en; path=/; domain=${domain};`;
    } else {
      document.cookie = "googtrans=/en/tr; path=/;";
      document.cookie = `googtrans=/en/tr; path=/; domain=${domain};`;
    }

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
    }
  }, []);

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
