import React, { useEffect, useState } from "react";
import { getAllIncomes, setExpenseLimitForUser } from "../api/api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCurrency } from "../context/CurrencyContext"; // import currency context

export default function AllIncomes() {
  const [groupedIncomes, setGroupedIncomes] = useState({});
  const [newLimit, setNewLimit] = useState({});
  const navigate = useNavigate();
  const { currency, rate } = useCurrency(); // get selected currency and rate

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = () => {
    getAllIncomes()
      .then((res) => {
        const grouped = {};
        res.data.forEach((i) => {
          const key = `${i.userId}_${i.username}`;
          if (!grouped[key]) {
            grouped[key] = {
              userId: i.userId,
              username: i.username,
              monthlyLimit: i.monthlyLimit,
              incomes: [],
            };
          }
          grouped[key].incomes.push({
            id: i.id,
            amount: i.amount,
            source: i.source,
            date: i.date,
          });
        });
        setGroupedIncomes(grouped);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch incomes");
      });
  };

  const handleLimitChange = (username, value) => {
    setNewLimit((prev) => ({ ...prev, [username]: value }));
  };

  const handleSetLimit = (userId, username) => {
    const limitValue = newLimit[username];
    if (!limitValue || isNaN(limitValue)) {
      toast.warning("Please enter a valid limit");
      return;
    }

    const convertedToINR = limitValue / rate;

    setExpenseLimitForUser(userId, convertedToINR)
      .then(() => {
        toast.success(`Limit set to ${currency} ${parseFloat(limitValue).toFixed(2)} for ${username}`);
        fetchIncomes();
        setNewLimit((prev) => ({ ...prev, [username]: "" }));
      })
      .catch((err) => {
        toast.error("Failed to set limit");
        console.error(err);
      });
  };

  const getCurrencySymbol = (code) => {
    switch (code) {
      case "INR": return "₹";
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "JPY": return "¥";
      default: return "";
    }
  };

  const symbol = getCurrencySymbol(currency);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Incomes Grouped by User</h1>

      <button
        onClick={() => navigate("/admin")}
        className="mb-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        ← Back to Dashboard
      </button>

      {Object.values(groupedIncomes).map((user) => (
        <div key={user.userId} className="mb-6 border rounded-lg shadow-md p-4 bg-white">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="font-semibold text-lg">👤 {user.username}</p>
              <p className="text-gray-600">
                Monthly Limit:{" "}
                <span className="font-medium">
                  {user.monthlyLimit != null
                    ? `${symbol}${(user.monthlyLimit * rate).toFixed(2)}`
                    : "Not set"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder={`Enter new limit (${currency})`}
                value={newLimit[user.username] || ""}
                onChange={(e) => handleLimitChange(user.username, e.target.value)}
                className="border px-2 py-1 rounded w-32"
              />
              <button
                onClick={() => handleSetLimit(user.userId, user.username)}
                className="bg-blue-600 hover:bg-blue-800 text-white px-3 py-1 rounded"
              >
                Set
              </button>
            </div>
          </div>

          <table className="min-w-full text-left border-t">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4">Income ID</th>
                <th className="py-2 px-4">Amount</th>
                <th className="py-2 px-4">Source</th>
                <th className="py-2 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {user.incomes.map((inc) => (
                <tr key={inc.id} className="border-t">
                  <td className="py-2 px-4">{inc.id}</td>
                  <td className="py-2 px-4">
                    {symbol}
                    {(inc.amount * rate).toFixed(2)}
                  </td>
                  <td className="py-2 px-4">{inc.source}</td>
                  <td className="py-2 px-4">{inc.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
