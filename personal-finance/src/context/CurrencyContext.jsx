import React, { createContext, useContext, useState, useEffect } from "react";
import { convertCurrency } from "../api/api";

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState("INR");
  const [rate, setRate] = useState(1);

  // Load from localStorage on mount
  useEffect(() => {
    const storedCurrency = localStorage.getItem("currency");
    const storedRate = localStorage.getItem("rate");

    if (storedCurrency) setCurrency(storedCurrency);
    if (storedRate) setRate(parseFloat(storedRate));
  }, []);

  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem("currency", currency);
    localStorage.setItem("rate", String(rate ?? 1));

  }, [currency, rate]);

  // 👇 Centralized logic to update both currency and rate
  const setCurrencyWithRate = async (newCurrency) => {
    setCurrency(newCurrency);

    if (newCurrency === "INR") {
      setRate(1);
      return;
    }

    try {
      const res = await convertCurrency("INR", newCurrency, 1);
      const newRate = res.data;
      setRate(newRate);
    } catch (err) {
      console.error("Failed to fetch conversion rate:", err);
      setRate(1); // fallback
    }
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, rate, setCurrencyWithRate }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
