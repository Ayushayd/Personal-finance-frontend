import React, { useEffect, useState } from "react";
import { getAllUsers } from "../api/api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserCircle, Mail, Shield } from "lucide-react";

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch users");
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">👥 All Registered Users</h1>

      <button
        onClick={() => navigate("/admin")}
        className="mb-6 bg-gray-600 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded"
      >
        ← Back to Dashboard
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-xl shadow-md p-4 border hover:shadow-lg transition duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <UserCircle className="text-blue-500" size={28} />
              <div>
                <p className="text-lg font-semibold">{user.username}</p>
                <p className="text-sm text-gray-500">User ID: {user.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Mail className="text-gray-600" size={18} />
              <span className="text-sm">{user.email}</span>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="text-gray-600" size={18} />
              <span
                className={`text-sm font-medium px-2 py-1 rounded ${
                  user.role === "admin"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {user.role}
              </span>
            </div>
          </div>
        ))}
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
