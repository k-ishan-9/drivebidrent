import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatListMechanic from './ChatListMechanic';
import ChatRoomMechanic from './ChatRoomMechanic';

export default function ChatPageMechanic() {
  const { chatId: chatIdFromParam } = useParams();
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState(chatIdFromParam || null);

  useEffect(() => { 
    setSelectedChatId(chatIdFromParam || null); 
  }, [chatIdFromParam]);

  const handleSelect = (id) => { 
    setSelectedChatId(id); 
    navigate(`/mechanic/chats/${id}`); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="flex h-[calc(100vh-100px)] min-h-[700px]">
            <aside className="w-96 border-r border-gray-200">
              <ChatListMechanic onSelect={handleSelect} selectedId={selectedChatId} />
            </aside>
            <main className="flex-1">
              <ChatRoomMechanic chatIdProp={selectedChatId} />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}