"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const defaultCurrency = {
    symbol: "₺",
    code: "TRY",
    name: "Turkish Lira",
  };

  const [currency, setCurrency] = useState(defaultCurrency);

  useEffect(() => {
    const saved = localStorage.getItem("user-currency");
    if (saved) {
      try {
        setCurrency(JSON.parse(saved));
      } catch (e) {
        setCurrency(defaultCurrency);
      }
    }
  }, []);

  const updateCurrency = (currencyObj) => {
    setCurrency(currencyObj);
    localStorage.setItem("user-currency", JSON.stringify(currencyObj));
  };

  return (
    <CurrencyContext.Provider value={{ currency, updateCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);