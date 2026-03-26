"use client";
import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";

export const CustomDropdown = ({
  icon,
  label,
  placeholder,
  options = [],
  value,
  onChange,
  loading = false,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel =
    loading
      ? "Loading..."
      : !loading && options.length === 0
      ? "Not Found"
      : options.find((o) => o.value === value)?.label || placeholder;

  const isSelected = !!value;

  return (
    <div ref={ref} className="relative flex-1 min-w-[150px]">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((p) => !p)}
        className={`
          w-full flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all duration-200
          ${open
            ? "border-primary-400 bg-primary-50 shadow-sm"
            : "border-gray-200 bg-[#FF69000F] hover:border-primary-300 hover:bg-primary-50/40"
          }
          ${disabled ? "cursor-not-allowed opacity-60" : ""}
        `}
      >
        {/* Left Icon */}
        <div
          className={`flex-shrink-0 transition-colors ${
            isSelected || open ? "text-primary-500" : "text-primary-600"
          }`}
        >
          <Icon icon={icon} className="w-5 h-5" />
        </div>

        {/* Label + Value */}
        <div className="flex flex-col items-start flex-1 min-w-0">
          <span className="text-[10px] font-semibold text-gray-800 uppercase tracking-wide leading-none mb-0.5">
            {label}
          </span>
          <span className={`text-sm font-medium truncate leading-tight text-gray-800`}>
            {selectedLabel}
          </span>
        </div>

        {/* Chevron */}
        <Icon
          icon="mdi:chevron-down"
          className={`w-4 h-4 flex-shrink-0 text-gray-800 transition-transform duration-200 ${
            open ? "rotate-180 text-primary-500" : ""
          }`}
        />
      </button>

      {/* Dropdown List */}
      {open && !loading && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1.5 !z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {/* Clear option */}
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs text-primary-500 font-semibold border-b border-gray-100 hover:bg-primary-50 transition-colors flex items-center gap-2"
            >
              <Icon icon="mdi:close-circle-outline" className="w-4 h-4" />
              Clear selection
            </button>
          )}

          <div className="max-h-52 overflow-y-auto">
            {options.length === 0 ? (
              <div className="text-center text-gray-400 py-2 text-sm">Not Found</div>
            ) : (
              options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`
                    w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2
                    ${value === opt.value
                      ? "bg-primary-50 text-primary-600 font-semibold"
                      : "text-gray-700 hover:bg-gray-50 font-normal"
                    }
                  `}
                >
                  {opt.label}
                  {value === opt.value && (
                    <Icon
                      icon="mdi:check"
                      className="w-4 h-4 text-primary-500 flex-shrink-0"
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {/* {loading && (
        <div className="absolute top-full left-0 right-0 mt-1.5 !z-50 bg-white border border-gray-200 rounded-xl shadow-xl flex items-center justify-center py-3 text-sm text-gray-500">
          Loading...
        </div>
      )} */}
    </div>
  );
};