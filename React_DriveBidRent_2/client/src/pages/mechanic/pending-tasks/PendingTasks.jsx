// client/src/pages/mechanic/pending-tasks/PendingTasks.jsx
import { useEffect, useState } from 'react';
import { getPendingTasks, acceptPendingTask, declinePendingTask } from '../../../services/mechanic.services';
import { Link } from 'react-router-dom';

export default function PendingTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPendingTasks()
      .then(res => setTasks(res.data.data.tasks || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (id) => {
    if (!confirm('Accept this inspection task?')) return;
    await acceptPendingTask(id);
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  const handleDecline = async (id) => {
    if (!confirm('Decline this task?')) return;
    await declinePendingTask(id); 
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
          <p className="mt-6 text-xl text-gray-700 font-medium">Loading pending tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-orange-600 mb-12">Pending Inspection Requests</h1>

        {tasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow">
            <p className="text-2xl text-gray-600">No pending requests at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tasks.map(t => {
              const v = t.vehicle;
              return (
                <div key={t._id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border-2 border-amber-300 overflow-hidden">
                  <Link to={`/mechanic/car-details/${v._id}`}>
                    <img src={v.vehicleImage} alt={v.vehicleName} className="w-full h-56 object-cover" />
                  </Link>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{v.vehicleName}</h3>
                    <p className="text-gray-600 mb-2"><strong>Owner:</strong> {t.ownerName || 'Unknown'}</p>
                    <p className="text-gray-600"><strong>Mileage:</strong> {v.mileage.toLocaleString()} km</p>
                    <div className="flex justify-center gap-4 mt-6">
                      <button
                        onClick={() => handleAccept(t._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
                      >
                        Accept Task
                      </button>
                      <button
                        onClick={() => handleDecline(t._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}