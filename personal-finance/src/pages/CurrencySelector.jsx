// pages/CurrencySelector.js
import React from "react";
import { useCurrency } from "../context/CurrencyContext";

const currencies = ["USD", "EUR", "INR", "GBP", "JPY"];

export default function CurrencySelector() {
  const { currency, setCurrencyWithRate } = useCurrency();


  return (
    <select
      value={currency}
      onChange={(e) => setCurrencyWithRate(e.target.value)}
      className="border p-2 rounded"
    >
      {currencies.map((cur) => (
        <option key={cur} value={cur}>
          {cur}
        </option>
      ))}
    </select>
  );
}
