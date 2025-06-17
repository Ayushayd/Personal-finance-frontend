import React, { useEffect, useState } from "react";
import { getSystemWideReports } from "../api/api";
import { useCurrency } from "../context/CurrencyContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA66CC", "#FF4444",
  "#33B5E5", "#99CC00", "#FF8800", "#CC0000"
];

const AdminReport = () => {
  const [report, setReport] = useState(null);
  const { currency, rate } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = () => {
    getSystemWideReports()
      .then((res) => setReport(res.data))
      .catch((err) => {
        toast.error("Failed to fetch system report");
        console.error(err);
      });
  };

  const getSymbol = (code) => {
    switch (code) {
      case "INR": return "₹";
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "JPY": return "¥";
      default: return "";
    }
  };

  const symbol = getSymbol(currency);

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">📊 System-Wide Financial Report</h2>

      <button
        onClick={() => navigate("/admin")}
        className="mb-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        ← Back to Dashboard
      </button>

      {!report ? (
        <p>Loading report...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-lg bg-gray-100">
              <h3 className="text-lg font-semibold">Total Income</h3>
              <p className="text-2xl">
                {symbol}
                {(report.totalIncome * rate).toFixed(2)}
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-gray-100">
              <h3 className="text-lg font-semibold">Total Expense</h3>
              <p className="text-2xl">
                {symbol}
                {(report.totalExpense * rate).toFixed(2)}
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-gray-100">
              <h3 className="text-lg font-semibold">Balance</h3>
              <p className="text-2xl">
                {symbol}
                {(report.balance * rate).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-bold mb-2">💸 Expenses by Category</h3>
            {Object.keys(report.expenseByCategory).length === 0 ? (
              <p className="text-gray-500">No expense data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(report.expenseByCategory).map(([key, val]) => ({
                      name: key,
                      value: val * rate,
                    }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {Object.keys(report.expenseByCategory).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `${symbol}${val.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReport;
