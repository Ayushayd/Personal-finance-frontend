import React, { useEffect, useState } from "react";
import {
  getExpenses,
  getIncomes,
  getUserChartData,
  getExpenseLimit,
} from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useCurrency } from "../context/CurrencyContext";
import CurrencySelector from "../pages/CurrencySelector";
import GeminiAssistant from "../pages/GeminiAssistant";

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { currency, rate } = useCurrency();

  const [summary, setSummary] = useState({
    totalExpenses: 0,
    totalIncomes: 0,
    netSavings: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [monthlyLimit, setMonthlyLimit] = useState(null);

  useEffect(() => {
    const fetchSummaryAndLimit = async () => {
      try {
        const [expensesRes, incomesRes] = await Promise.all([
          getExpenses(),
          getIncomes(),
        ]);

        const totalExpenses = expensesRes.data.reduce(
          (sum, e) => sum + e.amount,
          0
        );
        const totalIncomes = incomesRes.data.reduce(
          (sum, i) => sum + i.amount,
          0
        );
        const netSavings = totalIncomes - totalExpenses;

        setSummary({ totalExpenses, totalIncomes, netSavings });

        try {
          const limitRes = await getExpenseLimit();
          const monthlyLimit = limitRes?.data?.monthlyLimit ?? null;
          setMonthlyLimit(monthlyLimit);
        } catch (limitErr) {
          if (limitErr.response?.status === 404) {
            setMonthlyLimit(null); // Gracefully handle no limit set
          } else {
            console.error("Error fetching expense limit:", limitErr);
          }
        }
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    };

    const fetchChartData = async () => {
      try {
        const res = await getUserChartData();
        const data = Object.entries(res.data.monthlyExpense).map(
          ([month, amount]) => ({
            month,
            amount,
          })
        );
        setChartData(data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchSummaryAndLimit();
    fetchChartData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const convert = (value) => (value * rate).toFixed(2);

  const chartDataWithLimit = chartData.map((item) => {
    const convertedAmount = item.amount * rate;
    const isOverLimit =
      monthlyLimit !== null && convertedAmount >= monthlyLimit * rate;
    return {
      ...item,
      amount: convertedAmount,
      limitReached: isOverLimit,
      fill: isOverLimit ? "#f87171" : "#60a5fa",
    };
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <CurrencySelector />
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-600">
            Total Expenses
          </h2>
          <p className="text-2xl font-bold text-red-500">
            {currency} {convert(summary.totalExpenses)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-600">Total Incomes</h2>
          <p className="text-2xl font-bold text-green-500">
            {currency} {convert(summary.totalIncomes)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-600">Net Savings</h2>
          <p
            className={`text-2xl font-bold ${
              summary.netSavings >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            {currency} {convert(summary.netSavings)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">
          Monthly Expenses Chart{" "}
          {monthlyLimit !== null
            ? `(Limit: ${currency} ${convert(monthlyLimit)})`
            : `(No Limit Set)`}
        </h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartDataWithLimit}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name, props) => {
                  const { payload } = props;
                  return [
                    `${currency} ${Number(value).toFixed(2)}`,
                    payload.limitReached ? "Over Limit 🚨" : "Within Limit ✅",
                  ];
                }}
              />
              <Bar dataKey="amount" fill="#8884d8">
                {chartDataWithLimit.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No chart data available.</p>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex flex-col md:flex-row gap-4">
        <button
          onClick={() => navigate("/expenses")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-center"
        >
          Manage Expenses
        </button>
        <button
          onClick={() => navigate("/incomes")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-center"
        >
          Manage Incomes
        </button>
        <button
          onClick={() => navigate("/report")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-center"
        >
          View Reports
        </button>
      </div>

      {/* Gemini Assistant */}
      <GeminiAssistant />
    </div>
  );
}
