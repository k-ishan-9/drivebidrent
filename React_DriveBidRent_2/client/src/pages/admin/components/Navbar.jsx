// src/components/Navbar.jsx  (or your preferred location)
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../../redux/slices/authSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("user");
      navigate("/", { replace: true });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/admin/dashboard"
              className="text-2xl font-bold text-orange-600 tracking-tight hover:text-orange-700 transition-colors"
            >
              DriveBidRent
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/admin/dashboard"
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/manage-users"
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              Manage Users
            </Link>
            <Link
              to="/admin/manage-earnings"
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              Earnings
            </Link>
            <Link
              to="/admin/analytics"
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              Analytics
            </Link>
            <Link
              to="/admin/auction-managers"
              className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              Auction Managers
            </Link>
          </div>

          {/* Profile + Logout */}
          <div className="flex items-center gap-4">
            <img
              src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              alt="Admin"
              className="h-9 w-9 rounded-full object-cover border-2 border-orange-100"
            />
            <Link
              to="/admin/admin-profile"
              className="text-orange-600 font-semibold uppercase tracking-wide text-sm hover:text-orange-700 transition-colors hidden sm:block"
            >
              My Profile
            </Link>

            <button
              onClick={handleLogout}
              className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;