import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import IncomesPage from "./pages/IncomesPage";
import ReportsPage from "./pages/ReportsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReport from "./pages/AdminReport";

// 👇 Import new admin components
import AllUsers from "./pages/AllUsers";
import AllExpenses from "./pages/AllExpenses";
import AllIncomes from "./pages/AllIncomes";

import "./index.css";

const PrivateRoute = ({ element, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;

  return element;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 text-gray-900">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} roles={["USER"]} />} />
            <Route path="/expenses" element={<PrivateRoute element={<ExpensesPage />} />} />
            <Route path="/incomes" element={<PrivateRoute element={<IncomesPage />} />} />
            <Route path="/report" element={<PrivateRoute element={<ReportsPage />} />} />
            <Route path="/admin/report" element={<PrivateRoute element={<AdminReport />} />} />
            <Route path="/admin" element={<PrivateRoute element={<AdminDashboard />} roles={["ADMIN"]} />} />
            
            {/* 👇 Admin Sub-Routes */}
            <Route path="/admin/users" element={<PrivateRoute element={<AllUsers />} roles={["ADMIN"]} />} />
            <Route path="/admin/expenses" element={<PrivateRoute element={<AllExpenses />} roles={["ADMIN"]} />} />
            <Route path="/admin/incomes" element={<PrivateRoute element={<AllIncomes />} roles={["ADMIN"]} />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
