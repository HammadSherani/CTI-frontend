"use client";

import { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Icon } from "@iconify/react";

const CurrencySelector = ({ className = "" }) => {
  const { currency, updateCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar",    flag: "twemoji:flag-united-states" },
    { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "twemoji:flag-turkey"        },
  ];

  const selected = currencies.find((c) => c.code === currency?.code) ?? currencies[0];

  if (!mounted) {
    return (
      <div className={`w-[88px] h-9 bg-gray-100 rounded-lg animate-pulse ${className}`} />
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-all duration-200 focus:outline-none
          ${isOpen
            ? "bg-gray-100 border-gray-300 ring-1 ring-gray-200"
            : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
          }`}
      >
        <Icon icon={selected.flag} className="w-4 h-4 flex-shrink-0" />
        <span className="text-[13px] font-semibold text-gray-700 tracking-tight">
          {selected.code}
        </span>
        <Icon
          icon="solar:alt-arrow-down-bold"
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 flex-shrink-0
            ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50
          animate-in fade-in slide-in-from-top-2 duration-150">

          {/* Header label */}
          <p className="px-3 pb-1.5 pt-0.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
            Select Currency
          </p>

          {currencies.map((curr) => {
            const isActive = currency?.code === curr.code;
            return (
              <button
                key={curr.code}
                type="button"
                onClick={() => {
                  updateCurrency(curr);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 mx-0 transition-all duration-150 group
                  ${isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <Icon icon={curr.flag} className="w-5 h-5 flex-shrink-0" />

                <div className="flex flex-col text-left min-w-0 flex-1">
                  <span className={`text-sm font-semibold leading-tight ${isActive ? "text-primary-600" : "text-gray-800"}`}>
                    {curr.code}
                    <span className={`ml-1 font-normal ${isActive ? "text-primary-400" : "text-gray-400"}`}>
                      {curr.symbol}
                    </span>
                  </span>
                  <span className="text-[10px] text-gray-400 leading-tight">
                    {curr.name}
                  </span>
                </div>

                {isActive && (
                  <Icon
                    icon="solar:check-circle-bold-duotone"
                    className="w-4 h-4 text-primary-600 flex-shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;