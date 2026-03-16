// client/src/pages/mechanic/components/MechanicNavbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../../redux/slices/authSlice';
import '../MechanicDashboard.css';

export default function MechanicNavbar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const isActive = (path) => currentPath.includes(path);

  return (
    <nav className="mechanic-navbar fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo with Premium Gradient */}
          <Link 
            to="/mechanic/dashboard" 
            className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
          >
            DriveBidRent
          </Link>

          {/* Navigation Links with Premium Styling */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/mechanic/dashboard"
              className={`relative px-4 py-2 font-semibold transition-all duration-300 group ${
                isActive('/dashboard') 
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Dashboard
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-600 to-amber-500 transform origin-left transition-transform duration-300 ${
                isActive('/dashboard') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </Link>
            <Link
              to="/mechanic/current-tasks"
              className={`relative px-4 py-2 font-semibold transition-all duration-300 group ${
                isActive('/current-tasks') 
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Current Tasks
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-600 to-amber-500 transform origin-left transition-transform duration-300 ${
                isActive('/current-tasks') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </Link>
            <Link
              to="/mechanic/past-tasks"
              className={`relative px-4 py-2 font-semibold transition-all duration-300 group ${
                isActive('/past-tasks') 
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Past Tasks
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-600 to-amber-500 transform origin-left transition-transform duration-300 ${
                isActive('/past-tasks') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </Link>
            <Link
              to="/mechanic/chats"
              className={`relative px-4 py-2 font-semibold transition-all duration-300 group ${
                isActive('/chats') 
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Chats
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-600 to-amber-500 transform origin-left transition-transform duration-300 ${
                isActive('/chats') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </Link>
          </div>

          {/* Profile and Logout with Premium Buttons */}
          <div className="flex items-center space-x-3">
            <Link
              to="/mechanic/profile"
              className="relative px-5 py-2.5 font-semibold text-orange-600 bg-orange-50/50 rounded-xl border border-orange-200/50 hover:bg-orange-100/80 hover:border-orange-300 hover:shadow-[0_4px_20px_rgba(255,107,0,0.15)] transition-all duration-300 hover:scale-105"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="relative overflow-hidden px-6 py-2.5 font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl shadow-[0_4px_20px_rgba(255,107,0,0.25)] hover:shadow-[0_6px_30px_rgba(255,107,0,0.35)] transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 group"
            >
              <span className="relative z-10">Logout</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}