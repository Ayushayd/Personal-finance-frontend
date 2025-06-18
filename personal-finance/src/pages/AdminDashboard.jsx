import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getAllUsers, getAllExpenses, getAllIncomes } from "../api/api";
import { useCurrency } from "../context/CurrencyContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import CurrencySelector from "./CurrencySelector";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncomes, setTotalIncomes] = useState(0);
  const { currency, rate } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, expensesRes, incomesRes] = await Promise.all([
          getAllUsers(),
          getAllExpenses(),
          getAllIncomes(),
        ]);

        setUsers(usersRes.data);
        setExpenses(expensesRes.data);
        setIncomes(incomesRes.data);

        const rawExpenses = expensesRes.data.reduce((sum, e) => sum + e.amount, 0);
        const rawIncomes = incomesRes.data.reduce((sum, i) => sum + i.amount, 0);

        setTotalExpenses(rawExpenses);
        setTotalIncomes(rawIncomes);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Map: userId → monthly limit
  const userLimitMap = {};
  incomes.forEach((i) => {
    if (i.userId && i.monthlyLimit !== undefined && !(i.userId in userLimitMap)) {
      userLimitMap[i.userId] = i.monthlyLimit;
    }
  });

  const expenseData = users
  .filter((user) => user.role !== "ADMIN") // exclude admins
  .map((user) => {
    const userExpenses = expenses.filter((e) => e.userId === user.id);
    const userIncomes = incomes.filter((i) => i.userId === user.id);

    const totalUserExpenses = userExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalUserIncomes = userIncomes.reduce((sum, i) => sum + i.amount, 0);

    const monthlyLimitRaw = userLimitMap[user.id] ?? 0;
    const convertedLimit = monthlyLimitRaw * rate;
    const convertedExpenses = totalUserExpenses * rate;
    const convertedIncomes = totalUserIncomes * rate;

    return {
      name: user.username,
      Expenses: parseFloat(convertedExpenses.toFixed(2)),
      Incomes: parseFloat(convertedIncomes.toFixed(2)),
      Limit: parseFloat(convertedLimit.toFixed(2)),
      Exceeded: convertedExpenses > convertedLimit,
    };
  });


  const getCurrencySymbol = (code) => {
    switch (code) {
      case "INR": return "₹";
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "JPY": return "¥";
      default: return code + " ";
    }
  };

  const symbol = getCurrencySymbol(currency);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

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
          <h2 className="text-lg font-semibold text-gray-600">Total Users</h2>
          <p className="text-2xl font-bold text-indigo-600">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-600">Total Expenses</h2>
          <p className="text-2xl font-bold text-red-600">
            {symbol}
            {!isNaN(totalExpenses * rate)
              ? (totalExpenses * rate).toFixed(2)
              : "Loading..."}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-600">Total Incomes</h2>
          <p className="text-2xl font-bold text-green-600">
            {symbol}
            {!isNaN(totalIncomes * rate)
              ? (totalIncomes * rate).toFixed(2)
              : "Loading..."}
          </p>
        </div>
      </div>

      {/* Detailed Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Expenses vs Incomes by User ({currency})
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={expenseData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
            formatter={(value, name, props) => {
              const fullData = props.payload?.[0]?.payload;
              const extra = name === "Expenses" && fullData?.Exceeded
                ? " (Limit Exceeded)"
                : "";
              return [`${symbol}${value}${extra}`, name];
            }}
            />
            <Legend />
            <Bar dataKey="Expenses">
              {expenseData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.Exceeded ? "#dc2626" : "#f87171"}
                />
              ))}
            </Bar>
            <Bar dataKey="Incomes" fill="#34d399" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate("/admin/users")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-center"
        >
          Show All Users
        </button>
        <button
          onClick={() => navigate("/admin/expenses")}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-center"
        >
          Show All Expenses by User
        </button>
        <button
          onClick={() => navigate("/admin/incomes")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-center"
        >
          Show All Incomes by User
        </button>
        <button
          onClick={() => navigate("/admin/report")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-center"
        >
          Financial Report
        </button>
      </div>
    </div>
  );
}
