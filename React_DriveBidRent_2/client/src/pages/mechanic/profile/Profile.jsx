// client/src/pages/mechanic/profile/Profile.jsx
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { changePassword } from '../../../services/mechanic.services';
import useProfile from '../../../hooks/useProfile';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../MechanicDashboard.css';

export default function Profile() {
  const { profile: user, loading } = useProfile();
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordMatch, setPasswordMatch] = useState('');

  const handleNewPasswordChange = (value) => {
    setForm({ ...form, newPassword: value });
    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!value) {
      setPasswordStrength('');
    } else if (!strongRegex.test(value)) {
      setPasswordStrength('❌ Weak: needs uppercase, number, special char');
    } else {
      setPasswordStrength('✅ Strong password');
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setForm({ ...form, confirmPassword: value });
    if (!value) {
      setPasswordMatch('');
    } else if (form.newPassword !== value) {
      setPasswordMatch('❌ Passwords do not match');
    } else {
      setPasswordMatch('✅ Passwords match');
    }
  };

  const handleOldPasswordChange = (value) => {
    setForm({ ...form, oldPassword: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.oldPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (form.oldPassword === form.newPassword) {
      toast.error('New password cannot be the same as current password');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (form.newPassword.length < 8) {
      toast.error('New password must be 8+ characters');
      return;
    }

    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!strongRegex.test(form.newPassword)) {
      toast.error('Password must include uppercase letter, number, and special character');
      return;
    }

    setSubmitting(true);
    try {
      const res = await changePassword(form);
      toast.success(res.data.message || 'Password updated successfully');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStrength('');
      setPasswordMatch('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mechanic-layout min-h-screen py-8 px-4" style={{ position: 'relative', zIndex: 1 }}>
      <div className="max-w-6xl mx-auto">
        {/* Premium Page Header */}
        <div className="mechanic-page-header">
          <h1 className="mechanic-page-title">My Profile</h1>
          <p className="mechanic-page-subtitle">Manage your account and security settings</p>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="mechanic-stat-card animate-fade-in-up">
            <div className="mechanic-stat-icon">👤</div>
            <h2 className="mechanic-stat-label">Status</h2>
            <p className="mechanic-stat-value" style={{ fontSize: '1.5rem', background: user?.approved_status === 'Yes' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {user?.approved_status === 'Yes' ? 'Approved' : 'Pending'}
            </p>
          </div>
          <div className="mechanic-stat-card animate-fade-in-up">
            <div className="mechanic-stat-icon">🔧</div>
            <h2 className="mechanic-stat-label">Experience</h2>
            <p className="mechanic-stat-value">{user?.experienceYears} <span style={{ fontSize: '1.25rem' }}>Years</span></p>
          </div>
          <div className="mechanic-stat-card animate-fade-in-up">
            <div className="mechanic-stat-icon">🛠️</div>
            <h2 className="mechanic-stat-label">Services</h2>
            <p className="mechanic-stat-value" style={{ fontSize: '1.25rem' }}>{user?.repairCars && user?.repairBikes ? 'Cars & Bikes' : user?.repairCars ? 'Cars' : 'Bikes'}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Personal Information Card */}
          <div className="mechanic-section animate-fade-in-up">
            <div className="mechanic-section-header">
              <h3 className="mechanic-section-title" style={{ fontSize: '1.5rem' }}>Personal Information</h3>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-lg">
                <span className="font-semibold text-gray-700">Name:</span>
                <span className="text-gray-900 font-bold">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-lg">
                <span className="font-semibold text-gray-700">Email:</span>
                <span className="text-gray-900 font-bold">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-lg">
                <span className="font-semibold text-gray-700">Phone:</span>
                <span className="text-gray-900 font-bold">{user?.phone || '—'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-lg">
                <span className="font-semibold text-gray-700">Shop:</span>
                <span className="text-gray-900 font-bold">{user?.shopName || '—'}</span>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="mechanic-section animate-fade-in-up">
            <div className="mechanic-section-header">
              <h3 className="mechanic-section-title" style={{ fontSize: '1.5rem' }}>Change Password</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                <input 
                  type="password" 
                  placeholder="Enter current password" 
                  required 
                  value={form.oldPassword} 
                  onChange={e => handleOldPasswordChange(e.target.value)}
                  className="w-full p-3 text-sm border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none transition-all backdrop-blur-sm bg-white/80" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                <input 
                  type="password" 
                  placeholder="Enter new password" 
                  required 
                  value={form.newPassword} 
                  onChange={e => handleNewPasswordChange(e.target.value)}
                  className="w-full p-3 text-sm border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none transition-all backdrop-blur-sm bg-white/80" 
                />
                {passwordStrength && (
                  <div className={`text-xs mt-2 px-3 py-2 rounded-lg ${passwordStrength.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {passwordStrength}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="Confirm new password" 
                  required 
                  value={form.confirmPassword} 
                  onChange={e => handleConfirmPasswordChange(e.target.value)}
                  className="w-full p-3 text-sm border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none transition-all backdrop-blur-sm bg-white/80" 
                />
                {passwordMatch && (
                  <div className={`text-xs mt-2 px-3 py-2 rounded-lg ${passwordMatch.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {passwordMatch}
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="mechanic-btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}