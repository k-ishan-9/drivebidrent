// client/src/pages/superadmin/UserActivities.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";

const UserActivities = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState('all');
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserActivities();
  }, [userType, currentPage]);

  const fetchUserActivities = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/superadmin/user-activities?userType=${userType}&page=${currentPage}&limit=20`, { 
        withCredentials: true 
      });
      if (res.data.success) {
        setUsers(res.data.data.users);
        setPagination(res.data.data.pagination);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Failed to load user activities");
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    setDetailsLoading(true);
    try {
      const res = await axios.get(`/api/superadmin/user-details/${userId}`, { withCredentials: true });
      if (res.data.success) {
        setUserDetails(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchUserDetails(user._id);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserDetails(null);
  };

  const getUserTypeColor = (type) => {
    const colors = {
      buyer: 'bg-blue-100 text-blue-800',
      seller: 'bg-green-100 text-green-800',
      mechanic: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-red-100 text-red-800',
      driver: 'bg-orange-100 text-orange-800',
      superadmin: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen py-8 relative" style={{ zIndex: 1 }}>
      <section className="max-w-7xl mx-auto px-6">
        <div className="premium-page-header animate-fade-in-up">
          <h1 className="premium-page-title">User Activities</h1>
          <p className="premium-page-subtitle">Monitor what each user is doing on the platform</p>
        </div>

        {/* Filter */}
        <div className="premium-chart-container mb-6 flex items-center gap-4 py-3">
          <label className="font-bold text-gray-700">Filter by User Type:</label>
          <select 
            value={userType} 
            onChange={(e) => { setUserType(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Users</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="mechanic">Mechanics</option>
            <option value="driver">Drivers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {error && <div className="text-center text-red-500 mb-4">{error}</div>}

        {/* User Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {users.map((user) => (
            <div 
              key={user._id} 
              className="premium-stat-card animate-fade-in-up cursor-pointer hover-lift"
              onClick={() => handleUserClick(user)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">{user.phone}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUserTypeColor(user.userType)}`}>
                  {user.userType.toUpperCase()}
                </span>
              </div>

              {/* Activity Data */}
              <div className="space-y-2 text-sm">
                {user.userType === 'buyer' && user.activityData && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Bids:</span>
                      <span className="font-bold text-orange-600">{user.activityData.bidsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchases:</span>
                      <span className="font-bold text-green-600">{user.activityData.purchasesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rentals:</span>
                      <span className="font-bold text-blue-600">{user.activityData.rentalsCount}</span>
                    </div>
                  </>
                )}
                {user.userType === 'seller' && user.activityData && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Auctions:</span>
                      <span className="font-bold text-orange-600">{user.activityData.auctionsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rentals:</span>
                      <span className="font-bold text-blue-600">{user.activityData.rentalsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-bold text-green-600">₹{user.activityData.totalRevenue.toLocaleString()}</span>
                    </div>
                  </>
                )}
                {user.userType === 'mechanic' && user.activityData && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assigned Tasks:</span>
                      <span className="font-bold text-orange-600">{user.activityData.assignedTasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-bold ${user.activityData.approved ? 'text-green-600' : 'text-red-600'}`}>
                        {user.activityData.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-semibold text-gray-700">
                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                {user.isBlocked && (
                  <div className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-center font-semibold">
                    ⚠️ BLOCKED
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700"
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700"
            >
              Next
            </button>
          </div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-orange-600 text-white p-6 rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedUser.firstName} {selectedUser.lastName}</h2>
                    <p className="text-orange-100 mt-1">{selectedUser.email}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold bg-white text-orange-800`}>
                      {selectedUser.userType.toUpperCase()}
                    </span>
                  </div>
                  <button onClick={closeModal} className="text-2xl hover:bg-orange-700 rounded-full w-10 h-10 flex items-center justify-center">
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {detailsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                  </div>
                ) : userDetails ? (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h3 className="text-xl font-bold text-gray-800 mb-3">📋 Basic Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-semibold">{userDetails.user.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Joined Date</p>
                          <p className="font-semibold">{new Date(userDetails.user.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-semibold">{userDetails.user.city}, {userDetails.user.state}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className={`font-semibold ${userDetails.user.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                            {userDetails.user.isBlocked ? 'Blocked' : 'Active'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Activity Details based on user type */}
                    {userDetails.user.userType === 'buyer' && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">🛒 Buyer Activity</h3>
                        
                        {userDetails.detailedActivity.bids && userDetails.detailedActivity.bids.length > 0 && (
                          <div className="bg-blue-50 p-4 rounded-xl mb-4">
                            <h4 className="font-bold text-blue-800 mb-2">Recent Bids ({userDetails.detailedActivity.bids.length})</h4>
                            <div className="space-y-2">
                              {userDetails.detailedActivity.bids.slice(0, 5).map((bid) => (
                                <div key={bid._id} className="bg-white p-3 rounded flex justify-between items-center">
                                  <span className="text-sm">{bid.auctionId?.vehicleName || 'Unknown Vehicle'}</span>
                                  <span className="font-bold text-blue-600">₹{bid.bidAmount?.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {userDetails.detailedActivity.purchases && userDetails.detailedActivity.purchases.length > 0 && (
                          <div className="bg-green-50 p-4 rounded-xl mb-4">
                            <h4 className="font-bold text-green-800 mb-2">Purchases ({userDetails.detailedActivity.purchases.length})</h4>
                            <div className="space-y-2">
                              {userDetails.detailedActivity.purchases.slice(0, 5).map((purchase) => (
                                <div key={purchase._id} className="bg-white p-3 rounded flex justify-between items-center">
                                  <span className="text-sm">{purchase.vehicleName}</span>
                                  <span className="font-bold text-green-600">₹{purchase.purchasePrice?.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {userDetails.detailedActivity.rentals && userDetails.detailedActivity.rentals.length > 0 && (
                          <div className="bg-orange-50 p-4 rounded-xl">
                            <h4 className="font-bold text-orange-800 mb-2">Rentals ({userDetails.detailedActivity.rentals.length})</h4>
                            <div className="space-y-2">
                              {userDetails.detailedActivity.rentals.slice(0, 5).map((rental) => (
                                <div key={rental._id} className="bg-white p-3 rounded">
                                  <p className="text-sm font-semibold">{rental.vehicleName || 'Unknown Vehicle'}</p>
                                  <p className="text-xs text-gray-600">Status: {rental.status || 'unavailable'}</p>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-500">₹{rental.costPerDay}/day</span>
                                    {rental.driverAvailable && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Driver Available</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {userDetails.user.userType === 'seller' && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Seller Activity</h3>
                        
                        {userDetails.detailedActivity.auctions && userDetails.detailedActivity.auctions.length > 0 && (
                          <div className="bg-orange-50 p-4 rounded-xl mb-4">
                            <h4 className="font-bold text-orange-800 mb-2">Auctions ({userDetails.detailedActivity.auctions.length})</h4>
                            <div className="space-y-2">
                              {userDetails.detailedActivity.auctions.slice(0, 5).map((auction) => (
                                <div key={auction._id} className="bg-white p-3 rounded">
                                  <p className="font-semibold">{auction.vehicleName}</p>
                                  <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-600">Status: {auction.status}</span>
                                    <span className="font-bold text-orange-600">₹{auction.currentPrice?.toLocaleString()}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {userDetails.detailedActivity.rentals && userDetails.detailedActivity.rentals.length > 0 && (
                          <div className="bg-orange-50 p-4 rounded-xl">
                            <h4 className="font-bold text-orange-800 mb-2">Rental Listings ({userDetails.detailedActivity.rentals.length})</h4>
                            <div className="space-y-2">
                              {userDetails.detailedActivity.rentals.slice(0, 5).map((rental) => (
                                <div key={rental._id} className="bg-white p-3 rounded">
                                  <p className="font-semibold">{rental.vehicleName}</p>
                                  <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-600">Status: {rental.status}</span>
                                    <span className="font-bold text-orange-600">₹{rental.costPerDay?.toLocaleString()}/day</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">No details available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default UserActivities;
