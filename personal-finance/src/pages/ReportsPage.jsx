import React, { useEffect, useState } from "react";
import { getReports } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext"; // ✅ Currency context
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const ReportsPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { currency, rate } = useCurrency();
  const [report, setReport] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    expenseByCategory: {},
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await getReports();
        setReport(res.data);
      } catch (error) {
        console.error("Failed to fetch reports", error);
      }
    };

    fetchReport();
  }, []);

  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#A569BD", "#FFA726"];

  const expenseData = Object.entries(report.expenseByCategory).map(
    ([category, amount]) => ({
      name: category,
      value: amount * rate, // ✅ Convert category-wise expense
    })
  );

  const symbolMap = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };
  const symbol = symbolMap[currency] || "";

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Financial Reports</h1>

      <button 
        onClick={() => navigate("/dashboard")}
        className="mb-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        ← Back to Dashboard
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <h2 className="text-lg text-gray-600">Total Income</h2>
          <p className="text-2xl font-bold text-green-600">
            {symbol}{(report.totalIncome * rate).toFixed(2)}
          </p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <h2 className="text-lg text-gray-600">Total Expenses</h2>
          <p className="text-2xl font-bold text-red-600">
            {symbol}{(report.totalExpense * rate).toFixed(2)}
          </p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <h2 className="text-lg text-gray-600">Balance</h2>
          <p className={`text-2xl font-bold ${report.balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
            {symbol}{(report.balance * rate).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Expenses by Category</h3>

        {expenseData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${symbol}${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No expense data available to display.</p>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
