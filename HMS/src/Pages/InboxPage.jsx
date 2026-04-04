import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Mail, Megaphone, Send, PlusCircle, Building2 } from 'lucide-react';
import MessagesTab from '../components/MessagesTab';

export default function InboxPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Manager-specific state
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [targetHostelId, setTargetHostelId] = useState("");

  useEffect(() => {
    if (!user) return;

    if (user.role === 'manager' && user.managed_hostels?.length > 0) {
      setTargetHostelId(user.managed_hostels[0].id);
    }

    fetchAnnouncements();
  }, [user]);

  const fetchAnnouncements = async () => {
    if (!user) return;

    if (user.role !== 'manager' && !user.bookings[0]?.room?.hostel_id) {
      setAnnouncements([]);
      return;
    }

    const url = user.role === 'manager'
      ? 'http://127.0.0.1:5555/announcements'
      : `http://127.0.0.1:5555/hostels/${user.bookings[0]?.room?.hostel_id}/announcements`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Failed to load announcements');
      }

      if (user.role === 'manager') {
        const managedIds = user.managed_hostels?.map(h => h.id) || [];
        setAnnouncements(data.filter(a => managedIds.includes(a.hostel_id)));
      } else {
        setAnnouncements(data);
      }
      setErrorMessage('');
    } catch (err) {
      setAnnouncements([]);
      setErrorMessage(err.message || 'Failed to load announcements');
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;

    try {
      const response = await fetch('http://127.0.0.1:5555/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          hostel_id: targetHostelId,
          content: newAnnouncement
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Failed to post announcement');
      }

      setNewAnnouncement("");
      setErrorMessage('');
      fetchAnnouncements(); // Refresh the list to see the new post
    } catch (err) {
      setErrorMessage(err.message || 'Failed to post announcement');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 flex h-[85vh] gap-6">
      {/* Sidebar - Same as before */}
      <div className="w-64 space-y-2">
        <button onClick={() => setActiveTab('announcements')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold ${activeTab === 'announcements' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}>
          <Megaphone size={20} /> Announcements
        </button>
        <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold ${activeTab === 'messages' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}>
          <Mail size={20} /> Direct Messages
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {activeTab === 'announcements' && (
          <div className="flex flex-col h-full">
            {/* MANAGER ONLY: Post Area */}
            {user.role === 'manager' && (
              <div className="p-6 border-b bg-indigo-50/50">
                <form onSubmit={handlePostAnnouncement} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                       <textarea 
                        placeholder="Write a new announcement..."
                        className="w-full p-4 pr-12 rounded-2xl border-2 border-indigo-100 focus:border-indigo-400 focus:ring-0 text-sm resize-none"
                        rows="2"
                        value={newAnnouncement}
                        onChange={(e) => setNewAnnouncement(e.target.value)}
                       />
                       <button type="submit" className="absolute right-3 bottom-3 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
                         <Send size={18} />
                       </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-1">
                      <Building2 size={14}/> Post to:
                    </label>
                    <select 
                      value={targetHostelId}
                      onChange={(e) => setTargetHostelId(e.target.value)}
                      className="text-xs font-bold bg-white border-none rounded-lg py-1 px-2 text-indigo-900 shadow-sm"
                    >
                      {user.managed_hostels.map(h => (
                        <option key={h.id} value={h.id}>{h.hostel_name}</option>
                      ))}
                    </select>
                  </div>
                </form>
              </div>
            )}

            {/* Announcement List */}
            {errorMessage && (
              <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
                {errorMessage}
              </div>
            )}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <PlusCircle size={20} className="text-indigo-600"/> Feed
              </h2>
              {announcements.length === 0 ? (
                <div className="text-center py-20 text-gray-400">No announcements yet.</div>
              ) : (
                announcements.map(a => (
                  <div key={a.id} className="p-5 bg-white border rounded-2xl hover:border-indigo-200 transition-colors shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase">
                        {a.hostel?.hostel_name || "General"}
                      </span>
                      <span className="text-[10px] text-gray-400 italic">
                        {new Date(a.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{a.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <MessagesTab currentUser={user} />
        )}
      </div>
    </div>
  );
}