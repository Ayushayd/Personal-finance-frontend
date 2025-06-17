import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getIncomes,
  addIncome,
  deleteIncome,
  updateIncome,
  getExpenseLimit,
  setExpenseLimit,
  getExpenses,
} from "../api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function IncomesPage() {
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ source: "", amount: "", date: "" });
  const [editForm, setEditForm] = useState({ source: "", amount: "", date: "" });
  const [editingId, setEditingId] = useState(null);
  const [expenseLimit, setLimit] = useState(null);
  const [newLimit, setNewLimit] = useState("");

  const fetchIncomes = async () => {
    try {
      const [incomeRes, limitRes, expenseRes] = await Promise.all([
        getIncomes(),
        getExpenseLimit(),
        getExpenses(),
      ]);
      setIncomes(incomeRes.data);
      setLimit(limitRes.data);
      setExpenses(expenseRes.data);
    } catch (err) {
      toast.error("Failed to fetch incomes, expenses, or limit.");
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const limitValue = expenseLimit?.monthlyLimit || 1;
  const progressPercent = Math.min((totalExpense / limitValue) * 100, 100);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.amount) > 100000) {
      toast.error("Income amount cannot exceed ₹1,00,000.");
      return;
    }
    try {
      await addIncome(form);
      setForm({ source: "", amount: "", date: "" });
      fetchIncomes();
      toast.success("Income added successfully!");
    } catch (err) {
      toast.error("Failed to add income.");
    }
  };

  const handleEdit = (income) => {
    setEditingId(income.id);
    setEditForm({ source: income.source, amount: income.amount, date: income.date });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdateIncome = async () => {
    if (Number(editForm.amount) > 100000) {
      toast.error("Income amount cannot exceed ₹1,00,000.");
      return;
    }
    try {
      await updateIncome(editingId, editForm);
      setEditingId(null);
      fetchIncomes();
      toast.success("Income updated successfully!");
    } catch (err) {
      toast.error("Failed to update income.");
    }
  };

  const handleDeleteIncome = async (id) => {
    try {
      await deleteIncome(id);
      fetchIncomes();
      toast.success("Income deleted.");
    } catch (err) {
      toast.error("Failed to delete income.");
    }
  };

  const handleSetLimit = async (e) => {
    e.preventDefault();
    try {
      await setExpenseLimit(newLimit);
      setNewLimit("");
      fetchIncomes();
      toast.success("Expense limit updated!");
    } catch (err) {
      toast.error("Failed to set limit.");
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-bold mb-4">Incomes</h1>

      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        ← Back to Dashboard
      </button>

      {expenseLimit && (
        <div className="mb-4 p-4 bg-blue-100 rounded shadow">
          <strong>Monthly Expense Limit:</strong> ₹{expenseLimit.monthlyLimit}
          <div className="w-full bg-gray-300 rounded-full h-4 mt-2">
            <div
              className="bg-green-600 h-4 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Used: ₹{totalExpense} ({Math.floor(progressPercent)}%)
          </div>
        </div>
      )}

      {/* Set Limit Section */}
      <div className="mb-6 p-4 bg-gray-100 rounded shadow">
        <form onSubmit={handleSetLimit} className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="block text-gray-700 text-sm font-bold mb-1">
              Set Monthly Expense Limit
            </label>
            <input
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 w-full"
              required
              placeholder="Enter limit in ₹"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Set Limit
          </button>
        </form>
      </div>

      {/* Add Income Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Source</label>
          <input
            name="source"
            value={form.source}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Amount</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Income
        </button>
      </form>

      {/* Income Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Source</th>
              <th className="py-2 px-4 border">Amount</th>
              <th className="py-2 px-4 border">Date</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {incomes.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No incomes added yet.
                </td>
              </tr>
            ) : (
              incomes.map((inc) => (
                <tr key={inc.id}>
                  {editingId === inc.id ? (
                    <>
                      <td className="py-2 px-4 border">
                        <input
                          name="source"
                          value={editForm.source}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="py-2 px-4 border">
                        <input
                          type="number"
                          name="amount"
                          value={editForm.amount}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="py-2 px-4 border">
                        <input
                          type="date"
                          name="date"
                          value={editForm.date}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="py-2 px-4 border">
                        <button
                          onClick={handleUpdateIncome}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 px-4 border">{inc.source}</td>
                      <td className="py-2 px-4 border">₹{inc.amount}</td>
                      <td className="py-2 px-4 border">{inc.date}</td>
                      <td className="py-2 px-4 border">
                        <button
                          onClick={() => handleEdit(inc)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteIncome(inc.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
