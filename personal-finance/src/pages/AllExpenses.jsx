import React, { useEffect, useState } from "react";
import { getAllExpenses } from "../api/api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCurrency } from "../context/CurrencyContext";

export default function AllExpenses() {
  const [groupedExpenses, setGroupedExpenses] = useState({});
  const navigate = useNavigate();
  const { currency, rate } = useCurrency(); // 👈 Get currency and rate from context

  useEffect(() => {
    getAllExpenses()
      .then((res) => {
        const grouped = {};
        res.data.forEach((e) => {
          const key = `${e.userId}_${e.username}`;
          if (!grouped[key]) {
            grouped[key] = {
              userId: e.userId,
              username: e.username,
              expenses: [],
            };
          }
          grouped[key].expenses.push({
            id: e.id,
            amount: e.amount,
            category: e.category,
            date: e.date,
            description: e.description,
          });
        });
        setGroupedExpenses(grouped);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch expenses");
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Expenses Grouped by User</h1>

      <button
        onClick={() => navigate("/admin")}
        className="mb-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        ← Back to Dashboard
      </button>

      {Object.values(groupedExpenses).map((user) => (
        <div key={user.userId} className="mb-6 border rounded-lg shadow-md p-4 bg-white">
          <p className="font-semibold text-lg mb-2">👤 {user.username}</p>

          <table className="min-w-full bg-white border-t">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Amount ({currency})</th>
                <th className="py-2 px-4">Category</th>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Description</th>
              </tr>
            </thead>
            <tbody>
              {user.expenses.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="py-2 px-4">{e.id}</td>
                  <td className="py-2 px-4">
                    {currency} {(e.amount * rate).toFixed(2)}
                  </td>
                  <td className="py-2 px-4">{e.category}</td>
                  <td className="py-2 px-4">{e.date}</td>
                  <td className="py-2 px-4">{e.description}</td>
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
