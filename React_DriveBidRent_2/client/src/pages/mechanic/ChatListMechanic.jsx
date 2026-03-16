import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance.util';
import { Link } from 'react-router-dom';

export default function ChatListMechanic({ onSelect, selectedId }) {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')?._id;

  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get('/inspection-chat/my-chats');
        setChats(res.data.data || []);
      } catch (err) {
        console.error('Error fetching chats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChats();
    
    // Refresh chats every 30 seconds
    const intervalId = setInterval(fetchChats, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      try {
        const { chatId } = e.detail || {};
        if (!chatId) return;
        setChats(prev => prev.map(c => {
          if (String(c._id) === String(chatId)) {
            return { ...c, unreadCount: 0 };
          }
          return c;
        }));
      } catch (err) { 
        console.error('Chat read handler error:', err); 
      }
    };
    
    window.addEventListener('chatRead', handler);
    return () => window.removeEventListener('chatRead', handler);
  }, []);

  // Helper function to get manager initials
  const getManagerInitials = (manager) => {
    if (!manager) return 'M';
    const firstName = manager.firstName || manager.first_name || '';
    const lastName = manager.lastName || manager.last_name || '';
    
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    return 'M';
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Helper function to get time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  // Helper function to get last message preview
  const getLastMessagePreview = (chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    const content = chat.lastMessage.content || '';
    return content.length > 30 ? content.substring(0, 30) + '...' : content;
  };

  // Filter chats based on search
  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const managerFirstName = chat.auctionManager?.firstName?.toLowerCase() || '';
    const managerLastName = chat.auctionManager?.lastName?.toLowerCase() || '';
    const managerFullName = `${managerFirstName} ${managerLastName}`.trim();
    const vehicleName = chat.inspectionTask?.vehicleName?.toLowerCase() || '';
    const inspectionId = chat.inspectionTask?._id?.toLowerCase() || '';
    
    return managerFullName.includes(searchLower) || 
           vehicleName.includes(searchLower) ||
           inspectionId.includes(searchLower);
  });

  // Sort chats
  const sortedChats = [...filteredChats].sort((a, b) => {
    // Sort by unread first, then by last message time
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
    
    const timeA = new Date(a.updatedAt || a.createdAt || 0);
    const timeB = new Date(b.updatedAt || b.createdAt || 0);
    return timeB - timeA;
  });

  return (
    <div className="w-full h-full bg-white flex flex-col border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Messages</h2>
        <p className="text-sm text-gray-500">Vehicle inspection chats</p>
        
        {/* Search */}
        <div className="relative mt-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600">Loading chats...</p>
          </div>
        ) : sortedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-4">
            <div className="w-16 h-16 mb-3 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              {searchTerm ? 'No matches found' : 'No conversations'}
            </h3>
            <p className="text-gray-500 text-center text-sm max-w-xs">
              {searchTerm 
                ? 'Try different search terms'
                : 'Inspection chats will appear here'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-3 px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedChats.map(chat => {
              const isSelected = String(selectedId) === String(chat._id);
              const isUnread = chat.unreadCount > 0;
              const managerFirstName = chat.auctionManager?.firstName || '';
              const managerLastName = chat.auctionManager?.lastName || '';
              const managerName = managerFirstName && managerLastName 
                ? `${managerFirstName} ${managerLastName}` 
                : managerFirstName || 'Auction Manager';
              const vehicleName = chat.inspectionTask?.vehicleName || 'Vehicle';
              const status = chat.status || 'ASSIGNED';
              const lastUpdated = chat.updatedAt || chat.createdAt;
              const lastMessagePreview = getLastMessagePreview(chat);
              const inspectionDate = chat.inspectionTask?.createdAt || lastUpdated;
              
              return onSelect ? (
                <div
                  key={chat._id}
                  onClick={() => onSelect(chat._id)}
                  className={`cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {getManagerInitials(chat.auctionManager)}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="font-semibold text-gray-900 truncate">
                              {managerName}
                            </h3>
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {vehicleName}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {getTimeAgo(lastUpdated)}
                            </span>
                            {isUnread && (
                              <span className="mt-1 w-2 h-2 rounded-full bg-orange-500"></span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              status === 'ASSIGNED' 
                                ? 'bg-blue-100 text-blue-800'
                                : status === 'IN_PROGRESS'
                                ? 'bg-yellow-100 text-yellow-800'
                                : status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {status}
                            </span>
                            <p className="text-xs text-gray-500">
                              {formatDate(inspectionDate)}
                            </p>
                          </div>
                        </div>
                        
                        {lastMessagePreview && (
                          <p className="mt-2 text-sm text-gray-600 truncate">
                            {lastMessagePreview}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  key={chat._id} 
                  to={`/mechanic/chats/${chat._id}`}
                  className={`block ${
                    isSelected 
                      ? 'bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {getManagerInitials(chat.auctionManager)}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="font-semibold text-gray-900 truncate">
                              {managerName}
                            </h3>
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {vehicleName}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {getTimeAgo(lastUpdated)}
                            </span>
                            {isUnread && (
                              <span className="mt-1 w-2 h-2 rounded-full bg-orange-500"></span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              status === 'ASSIGNED' 
                                ? 'bg-blue-100 text-blue-800'
                                : status === 'IN_PROGRESS'
                                ? 'bg-yellow-100 text-yellow-800'
                                : status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {status}
                            </span>
                            <p className="text-xs text-gray-500">
                              {formatDate(inspectionDate)}
                            </p>
                          </div>
                        </div>
                        
                        {lastMessagePreview && (
                          <p className="mt-2 text-sm text-gray-600 truncate">
                            {lastMessagePreview}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          {sortedChats.length} chat{sortedChats.length !== 1 ? 's' : ''}
          {chats.some(c => c.unreadCount > 0) && (
            <span className="ml-2">
              • {chats.filter(c => c.unreadCount > 0).length} unread
            </span>
          )}
        </div>
      </div>
    </div>
  );
}