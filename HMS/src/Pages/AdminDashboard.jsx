import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { CheckCircle, XCircle, Shield } from 'lucide-react';
import {Link} from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [filter, setFilter] = useState('all'); // filters the hostels by status ie 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    fetch('http://127.0.0.1:5555/hostels')
      .then(r => r.json())
      .then(setHostels);
  }, []);

 const handleUpdateStatus = async (id, newStatus) => {
  try {
    const response = await fetch(`http://127.0.0.1:5555/hostels/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status: newStatus,
        current_user_role: user.role 
      })
    });

    if (response.ok) {
      const updatedData = await response.json();
      
      setHostels(prevHostels => prevHostels.map(h => {
        if (h.id === id) {
          // Merger logic: Keep old data, overwrite with new data
          // This prevents losing 'manager' if the backend forgot to send it back
          return { ...h, ...updatedData }; 
        }
        return h;
      }));
    }
  } catch (error) {
    console.error("Failed to update status:", error);
  }
};

  const filteredHostels = hostels.filter(h => filter === 'all' || h.status === filter);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-2">
            <Shield className="text-indigo-600" /> Admin Panel
          </h1>
          <p className="text-gray-500">Global Hostel Oversight</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition ${
                filter === f ? "bg-white shadow-sm text-indigo-600" : "text-gray-500"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {filteredHostels.map(hostel => (
           
          <div key={hostel.id} className="bg-white border rounded-2xl p-5 flex items-center gap-6">
             <Link to={`/hostels/${hostel.id}`} >
            <img src={hostel.images} className="w-24 h-24 rounded-xl object-cover" alt="" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg">{hostel.hostel_name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  hostel.status === 'approved' ? 'bg-green-100 text-green-700' :
                  hostel.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                }`}>
                  {hostel.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">Manager: {hostel.manager_name} ({hostel.manager_email})</p>
            </div>

            <div className="flex gap-2">
              {hostel.status !== 'approved' && (
                <button 
                  onClick={() => handleUpdateStatus(hostel.id, 'approved')}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                  title="Approve"
                >
                  <CheckCircle size={24} />
                </button>
              )}
              {hostel.status !== 'rejected' && (
                <button 
                  onClick={() => handleUpdateStatus(hostel.id, 'rejected')}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Reject/Revoke"
                >
                  <XCircle size={24} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}