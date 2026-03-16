// client/src/pages/mechanic/past-tasks/PastTasks.jsx
import { useEffect, useState } from 'react';
import { getPastTasks } from '../../../services/mechanic.services';
import PastTaskCard from '../components/PastTaskCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../MechanicDashboard.css';

export default function PastTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPastTasks()
      .then(res => setTasks(res.data.data.completedTasks || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mechanic-layout min-h-screen py-8 px-4" style={{ position: 'relative', zIndex: 1 }}>
      <div className="max-w-7xl mx-auto">
        {/* Premium Page Header */}
        <div className="mechanic-page-header">
          <h1 className="mechanic-page-title" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Completed Inspections</h1>
          <p className="mechanic-page-subtitle">History of completed vehicle inspections</p>
        </div>

        {/* Completed Tasks Grid */}
        <div className="mechanic-section animate-fade-in-up" style={{ borderColor: 'rgba(16, 185, 129, 0.1)' }}>
          <div className="mechanic-section-header">
            <h2 className="mechanic-section-title" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Inspection History</h2>
          </div>
          {tasks.length === 0 ? (
            <div className="mechanic-empty-state">
              <div className="mechanic-empty-icon">📝</div>
              <p className="mechanic-empty-text">No past inspections found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tasks.map(v => <PastTaskCard key={v._id} vehicle={v} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}