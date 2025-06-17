import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8082/api",
});

// Attach token to all requests if user is logged in
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// ====================== Auth ======================
export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);

// ====================== User ======================
// Expenses
export const getExpenses = () => API.get("/expenses");
export const getExpensesByCategory = (category) => API.get(`/expenses/category/${category}`);
export const getExpensesById = (id) => API.get(`/expenses/${id}`);
export const addExpense = (expense) => API.post("/expenses", expense);
export const updateExpense = (id, expense) => API.put(`/expenses/${id}`, expense);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

// Incomes
export const getIncomes = () => API.get("/user/income");
export const addIncome = (income) => API.post("/user/income", income);
export const deleteIncome = (id) => API.delete(`/user/income/${id}`);
export const getExpenseLimit = () => API.get("/user/limit");
export const setExpenseLimit = (limit) => API.post("/user/limit", { monthlyLimit: limit });
export const updateIncome = (id, income) => API.put(`/user/income/${id}`, income);

// User Reports
export const getReports = () => API.get("/user/report");
export const getUserChartData = () => API.get("/user/chart");

// ====================== Admin ======================
export const getAdminOverview = () => API.get("/admin/overview");
export const getAllExpenses = () => API.get("/admin/expenses");
export const getAllIncomes = () => API.get("/admin/incomes");
export const getUserExceedededLimit = () => API.get("/admin/limit-exceeded");
export const getAllUsers = () => API.get("/admin/users");
export const getSpecificExpense = (id) => API.get(`/admin/user/${id}/expenses`);
export const getExpensesByCategoryForAdmin = () => API.get(`/admin/expenses/expenses-by-category`);
export const getSystemWideReports = () => API.get("/admin/report");
export const setExpenseLimitForUser = (userId, limit) => API.post(`/admin/limit/${userId}`, { monthlyLimit: limit });

// currency conversion
export const convertCurrency = (from, to, amount) =>
  API.get(`/currency/convert`, {
    params: {
      from,
      to,
      amount,
    },
  });