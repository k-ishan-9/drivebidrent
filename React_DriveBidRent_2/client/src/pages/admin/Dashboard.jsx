import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminServices from "../../services/admin.services";
import LoadingSpinner from "../components/LoadingSpinner";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminServices.getDashboard();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError("Failed to load dashboard");
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-700 mt-8">{error}</div>;

  return (
    <>
      <section className="py-8 max-w-6xl mx-auto px-6">
        <h1 className="text-center text-3xl font-bold text-orange-600 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[
            { label: 'Total Users', value: data.totalUsers },
            { label: 'Total Buyers', value: data.totalBuyers },
            { label: 'Total Sellers', value: data.totalSellers },
            { label: 'Total Mechanics', value: data.totalMechanics },
          ].map((item, i) => (
            <div key={i} className="bg-white p-5 rounded-lg shadow text-center">
              <h2 className="text-orange-600">{item.label}</h2>
              <p className="text-2xl font-bold mt-2">{item.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6 text-center">
          <h2 className="text-orange-600">Total Earnings</h2>
          <div className="text-2xl font-bold text-orange-600 mt-2">₹{data.totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-orange-600 mb-4">Recent Activity</h2>
          {data.recentActivity.length > 0 ? (
            <ul className="divide-y">
              {data.recentActivity.map((act, i) => (
                <li key={i} className="py-3 flex justify-between items-center">
                  <span className="text-gray-700">{act.description}</span>
                  <span className="text-gray-500 text-sm">{new Date(act.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No recent activity available.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Dashboard;