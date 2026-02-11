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
        { code: "USD", symbol: "$", name: "US Dollar", flag: "twemoji:flag-united-states" },
        { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "twemoji:flag-turkey" },
    ];

    // Ab currency khud ek object hai, isliye hum seedha currency.code use kar sakte hain
    if (!mounted) {
        return <div className={`w-20 h-10 bg-gray-100 rounded ${className}`}></div>;
    }

    return (
        <div className={`relative inline-block w-20 ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-2 py-2 bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
            >
                {/* Ab yahan currency object se code mil jayega */}
                <span className="font-bold text-sm tracking-tight">{currency?.code}</span>
                <Icon
                    icon="lucide:chevron-down"
                    className={`transition-transform w-4 h-4 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <ul className="absolute z-50 left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-xl max-h-60 overflow-auto py-1">
                    {currencies.map((curr) => (
                        <li
                            key={curr.code}
                            onClick={() => {
                                // Pura object 'curr' bhej rahe hain
                                updateCurrency(curr);
                                setIsOpen(false);
                            }}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors group"
                        >
                            <Icon icon={curr.flag} className="w-5 h-5 flex-shrink-0" />

                            <div className="flex flex-col">
                                <span className={`text-sm ${currency.code === curr.code ? "font-bold text-blue-600" : "font-medium text-gray-700"}`}>
                                    {curr.code} ({curr.symbol})
                                </span>
                                <span className="text-[10px] text-gray-400 group-hover:text-gray-500 italic">
                                    {curr.name}
                                </span>
                            </div>

                            {currency.code === curr.code && (
                                <Icon icon="lucide:check" className="ml-auto w-4 h-4 text-blue-600" />
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default CurrencySelector;