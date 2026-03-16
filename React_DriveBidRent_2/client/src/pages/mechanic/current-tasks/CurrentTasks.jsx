// client/src/pages/mechanic/current-tasks/CurrentTasks.jsx
import { useEffect, useState } from 'react';
import { getCurrentTasks } from '../../../services/mechanic.services';
import CurrentTaskCard from '../components/CurrentTaskCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../MechanicDashboard.css';

export default function CurrentTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentTasks()
      .then(res => {
        // Filter to only show pending review status (not completed)
        const activeTasks = (res.data.data.assignedVehicles || []).filter(
          task => task.reviewStatus === 'pending'
        );
        setTasks(activeTasks);
      })
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mechanic-layout min-h-screen py-8 px-4" style={{ position: 'relative', zIndex: 1 }}>
      <div className="max-w-7xl mx-auto">
        {/* Premium Page Header */}
        <div className="mechanic-page-header">
          <h1 className="mechanic-page-title">Current Tasks</h1>
          <p className="mechanic-page-subtitle">Active vehicle inspection assignments</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="mechanic-stat-card animate-fade-in-up">
            <div className="mechanic-stat-icon">🔧</div>
            <h2 className="mechanic-stat-label">Active Tasks</h2>
            <p className="mechanic-stat-value">{tasks.length}</p>
          </div>
          <div className="mechanic-stat-card animate-fade-in-up">
            <div className="mechanic-stat-icon">⏳</div>
            <h2 className="mechanic-stat-label">Status</h2>
            <p className="mechanic-stat-value" style={{ fontSize: '1.5rem' }}>{tasks.length > 0 ? 'In Progress' : 'No Tasks'}</p>
          </div>
          <div className="mechanic-stat-card animate-fade-in-up">
            <div className="mechanic-stat-icon">📋</div>
            <h2 className="mechanic-stat-label">Pending</h2>
            <p className="mechanic-stat-value">{tasks.length}</p>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="mechanic-section animate-fade-in-up">
          <div className="mechanic-section-header">
            <h2 className="mechanic-section-title">All Current Assignments</h2>
          </div>
          {tasks.length === 0 ? (
            <div className="mechanic-empty-state">
              <div className="mechanic-empty-icon">🔍</div>
              <p className="mechanic-empty-text">No vehicles assigned at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map(v => <CurrentTaskCard key={v._id} vehicle={v} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}