import React, { use, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Plus, Users, DollarSign, Bed, Edit3, Trash2 } from 'lucide-react';
import EditHostelModal from '../components/EditHostelModal'; 
import AddHostelForm from '../components/AddHostelForm';    
import HostelManagementCard from '../components/HostelManagementCard';


export default function ManagerDashboard() {
  const { user, checkSession} = useAuth();
  const [hostels, setHostels] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);

 // console.log(user)

  useEffect(() => {
setHostels(user.managed_hostels)
  }, [user]);


  if (!user) return <div>Loading...</div>;


  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user.full_name}</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            <Plus size={20} /> Add New Hostel
          </button>
        </div>

        {/* Hostel Cards List */}
        <div className="grid grid-cols-1 gap-8">
          {hostels.map((hostel) => (
            <HostelManagementCard 
              key={hostel.id} 
              hostel={hostel} 
              onEdit={() => setEditingHostel(hostel)} 
            />
          ))}
        </div>
      </div>

      {isAddModalOpen && <AddHostelForm onClose={() => setIsAddModalOpen(false)} onHostelAdded={()=>checkSession(localStorage.getItem("jwt"))} />}
      {editingHostel && (
        <EditHostelModal 
          hostel={editingHostel} 
          onClose={() => setEditingHostel(null)} 
          onUpdate={()=>checkSession(localStorage.getItem("jwt"))}
        />
      )}
    </div>
  );
}

