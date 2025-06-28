import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getExpenses,
  addExpense,
  deleteExpense,
  getExpensesByCategory,
  updateExpense,
} from "../api/api";
import { useCurrency } from "../context/CurrencyContext";

export default function ExpensesPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { currency, rate } = useCurrency();

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category: "",
    newCategory: "",
    amount: "",
    date: "",
    description: "",
  });
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchExpenses = async () => {
    try {
      const res = await getExpenses();
      const allExpenses = res.data;
      setExpenses(allExpenses);
      const uniqueCategories = [
        ...new Set(allExpenses.map((exp) => exp.category)),
      ];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCategory =
      form.category === "__new__" ? form.newCategory.trim() : form.category;

    if (!finalCategory) {
      alert("Please provide a valid category");
      return;
    }

    try {
      const expenseData = {
        category: finalCategory,
        amount: parseFloat(form.amount) / rate, // Store in INR
        date: form.date,
        description: form.description,
      };

      if (editingId) {
        await updateExpense(editingId, expenseData);
        setEditingId(null);
      } else {
        await addExpense(expenseData);
      }

      setForm({
        category: "",
        newCategory: "",
        amount: "",
        date: "",
        description: "",
      });
      fetchExpenses();
    } catch (err) {
      console.error("Failed to submit expense", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      fetchExpenses();
    } catch (err) {
      console.error("Failed to delete expense", err);
    }
  };

  const handleCategorySearch = async () => {
    if (!categoryFilter.trim()) return fetchExpenses();
    try {
      const res = await getExpensesByCategory(categoryFilter.trim());
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to filter expenses by category", err);
    }
  };

  const startEdit = (expense) => {
    setEditingId(expense.id);
    setForm({
      category: categories.includes(expense.category)
        ? expense.category
        : "__new__",
      newCategory: categories.includes(expense.category)
        ? ""
        : expense.category,
      amount: (expense.amount * rate).toFixed(2),
      date: expense.date,
      description: expense.description,
    });
  };

  const getCurrencySymbol = (code) => {
    switch (code) {
      case "INR":
        return "₹";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "JPY":
        return "¥";
      default:
        return "";
    }
  };

  const symbol = getCurrencySymbol(currency);

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Expenses</h1>

      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        ← Back to Dashboard
      </button>

      {/* Filter */}
      <div className="mb-6 flex gap-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">-- Select Category --</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          onClick={handleCategorySearch}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Filter
        </button>
        <button
          onClick={() => {
            setCategoryFilter("");
            fetchExpenses();
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        {/* Category Select */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Category
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700"
            required
          >
            <option value="">-- Select Category --</option>
            <option value="__new__">Add New Category</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* If New Category Selected */}
        {form.category === "__new__" && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              New Category
            </label>
            <input
              type="text"
              name="newCategory"
              value={form.newCategory}
              onChange={handleChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              placeholder="Enter new category"
              required
            />
          </div>
        )}

        {/* Amount */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Amount ({currency})
          </label>
          <input
            type="number"
            step="0.01"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {editingId ? "Update Expense" : "Add Expense"}
        </button>
      </form>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Category</th>
              <th className="py-2 px-4 border">Amount ({currency})</th>
              <th className="py-2 px-4 border">Date</th>
              <th className="py-2 px-4 border">Description</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id}>
                <td className="py-2 px-4 border">{exp.category}</td>
                <td className="py-2 px-4 border">
                  {symbol}
                  {(exp.amount * rate).toFixed(2)}
                </td>
                <td className="py-2 px-4 border">{exp.date}</td>
                <td className="py-2 px-4 border">{exp.description}</td>
                <td className="py-2 px-4 border">
                  <button
                    onClick={() => startEdit(exp)}
                    className="text-blue-500 hover:underline mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
