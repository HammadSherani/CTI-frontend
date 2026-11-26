"use client";

import React from "react";
import { Controller } from "react-hook-form";

export const kycInputClass = (hasError) =>
  `w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:border-transparent ${
    hasError ? "border-red-400 bg-red-50/40 focus:ring-red-200" : "border-gray-300 focus:ring-primary-500"
  }`;

export const getFieldError = (errors, name) => name.split(".").reduce((node, key) => node?.[key], errors)?.message;

export function FieldLabel({ children, required, counter }) {
  return (
    <div className="flex items-end justify-between gap-2 mb-1.5">
      <label className="block text-sm font-medium text-gray-600">
        {children} {required && <span className="text-red-500">*</span>}
      </label>
      {counter}
    </div>
  );
}

export function FieldError({ message }) {
  return message ? <p role="alert" className="text-red-500 text-xs mt-1">{message}</p> : null;
}

/**
 * Text input / textarea bound to react-hook-form.
 * `filter` removes characters that do not belong in the field (e.g. letters in a number field).
 */
export default function KycField({
  control, errors, name, label, required, placeholder, hint, maxLength, filter,
  type = "text", inputMode, textarea, rows = 3, className = "", showCount = Boolean(maxLength),
}) {
  const error = getFieldError(errors, name);

  return (
    <div className={className}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const props = {
            ...field,
            value: field.value ?? "",
            onChange: (e) => field.onChange(filter ? filter(e.target.value) : e.target.value),
            placeholder,
            maxLength,
            "aria-invalid": Boolean(error),
          };
          return (
            <>
              <FieldLabel
                required={required}
                counter={showCount && <span className="text-[11px] tabular-nums text-gray-400">{props.value.length}/{maxLength}</span>}
              >
                {label}
              </FieldLabel>
              {textarea ? (
                <textarea {...props} rows={rows} className={`${kycInputClass(error)} resize-none`} />
              ) : (
                <input {...props} type={type} inputMode={inputMode} className={kycInputClass(error)} />
              )}
            </>
          );
        }}
      />
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}
