"use client";

import React, { useLayoutEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { buildPhone, formatNational, nationalDigits } from "@/helper/phone";

/**
 * Turkish phone field: shows the flag and +90, accepts digits only and spaces them
 * in the local style. The value is kept as "+90 555 123 45 67".
 */
const PhoneInput = React.forwardRef(function PhoneInput(
  { value, onChange, hasError, disabled, className = "", inputClassName = "py-2.5", ...inputProps },
  ref
) {
  const inputRef = useRef(null);
  const caretDigits = useRef(null);
  const shown = formatNational(nationalDigits(value));

  // Keep the cursor after the same digit when spaces are re-inserted
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (caretDigits.current === null || !input || document.activeElement !== input) return;
    let seen = 0;
    let position = 0;
    while (position < shown.length && seen < caretDigits.current) {
      if (/\d/.test(shown[position])) seen += 1;
      position += 1;
    }
    input.setSelectionRange(position, position);
    caretDigits.current = null;
  });

  const setRefs = (node) => {
    inputRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const handleChange = (e) => {
    const text = e.target.value;
    caretDigits.current = text.slice(0, e.target.selectionStart ?? text.length).replace(/\D/g, "").length;
    onChange(buildPhone(nationalDigits(text)));
  };

  return (
    <div
      className={`flex items-stretch w-full rounded-lg border overflow-hidden transition-all focus-within:ring-2 ${
        hasError
          ? "border-red-400 bg-red-50/40 focus-within:ring-red-200"
          : "border-gray-300 bg-white focus-within:ring-primary-500/40 focus-within:border-primary-500"
      } ${disabled ? "bg-gray-100" : ""} ${className}`}
    >
      <span translate="no" className="notranslate flex items-center gap-1.5 px-3 border-r border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 select-none">
        <Icon icon="twemoji:flag-turkey" className="w-4 h-4" />+90
      </span>
      <input
        {...inputProps}
        ref={setRefs}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        disabled={disabled}
        aria-invalid={Boolean(hasError)}
        value={shown}
        onChange={handleChange}
        placeholder="555 123 45 67"
        className={`flex-1 min-w-0 px-3 text-sm bg-transparent outline-none tracking-wide ${inputClassName}`}
      />
    </div>
  );
});

export default PhoneInput;
