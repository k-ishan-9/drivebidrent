// client/src/pages/mechanic/dashboard/Dashboard.jsx
import { useEffect, useState } from 'react';
import { getDashboard } from '../../../services/mechanic.services';
import CurrentTaskCard from '../components/CurrentTaskCard';
import PastTaskCard from '../components/PastTaskCard';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../MechanicDashboard.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  if (!data) {
    return (
      <div className="mechanic-layout min-h-screen flex items-center justify-center">
        <p className="text-2xl text-red-600">Failed to load dashboard</p>
      </div>
    );
  }

  const { showApprovalPopup, displayedVehicles = [], completedTasks = [] } = data;

  return (
    <div className="mechanic-layout min-h-screen py-8 px-4" style={{ position: 'relative', zIndex: 1 }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Premium Page Header */}
        <div className="mechanic-page-header">
          <h1 className="mechanic-page-title">Mechanic Dashboard</h1>
          <p className="mechanic-page-subtitle">Manage your vehicle inspections and tasks</p>
        </div>

        {showApprovalPopup && (
          <div className="mechanic-alert-box">
            <h2 className="mechanic-alert-title">
              <span>⚠️</span> Account Under Review
            </h2>
            <p className="mechanic-alert-text">Your profile is being verified by the admin team. You'll receive access once approved.</p>
            <button onClick={() => window.location.href = '/'} className="mechanic-btn-primary">
              Back to Home
            </button>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="mechanic-stat-card animate-fade-in-up">
            <div className="mechanic-stat-icon">🔧</div>
            <h2 className="mechanic-stat-label">Current Tasks</h2>
            <p className="mechanic-stat-value">{displayedVehicles.length}</p>
          </div>
          
          <div className="mechanic-stat-card animate-fade-in-up">
            <div className="mechanic-stat-icon">✅</div>
            <h2 className="mechanic-stat-label">Completed</h2>
            <p className="mechanic-stat-value">{completedTasks.length}</p>
          </div>
          
          <div className="mechanic-stat-card animate-fade-in-up">
            <div className="mechanic-stat-icon">📊</div>
            <h2 className="mechanic-stat-label">Total Tasks</h2>
            <p className="mechanic-stat-value">{displayedVehicles.length + completedTasks.length}</p>
          </div>
        </div>

        {/* Current Tasks Section */}
        <section className="mechanic-section animate-fade-in-up mb-10">
          <div className="mechanic-section-header">
            <h2 className="mechanic-section-title">Current Assignments</h2>
            {displayedVehicles.length > 0 && (
              <Link to="/mechanic/current-tasks" className="text-orange-600 font-bold text-sm hover:text-orange-700 transition flex items-center gap-2">
                View All <span>→</span>
              </Link>
            )}
          </div>
          {displayedVehicles.length === 0 ? (
            <div className="mechanic-empty-state">
              <div className="mechanic-empty-icon">🔍</div>
              <p className="mechanic-empty-text">No vehicles assigned at this time</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedVehicles.map(v => <CurrentTaskCard key={v._id} vehicle={v} />)}
            </div>
          )}
        </section>

        {/* Past Tasks Section */}
        <section className="mechanic-section animate-fade-in-up">
          <div className="mechanic-section-header">
            <h2 className="mechanic-section-title" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Completed Inspections</h2>
            {completedTasks.length > 0 && (
              <Link to="/mechanic/past-tasks" className="text-green-600 font-bold text-sm hover:text-green-700 transition flex items-center gap-2">
                View All <span>→</span>
              </Link>
            )}
          </div>
          {completedTasks.length === 0 ? (
            <div className="mechanic-empty-state">
              <div className="mechanic-empty-icon">📝</div>
              <p className="mechanic-empty-text">No completed tasks yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedTasks.slice(0, 6).map(v => <PastTaskCard key={v._id} vehicle={v} />)}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}