import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Plus, Users, DollarSign, Bed, Edit3, Trash2 } from 'lucide-react';
import EditHostelModal from '../components/EditHostelModal'; // We'll build this
import AddHostelForm from '../components/AddHostelForm';    // We'll build this

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);

 // console.log(user)

  useEffect(() => {
setHostels(user.managed_hostels)
  }, [user.id]);


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

      {isAddModalOpen && <AddHostelForm onClose={() => setIsAddModalOpen(false)} />}
      {editingHostel && (
        <EditHostelModal 
          hostel={editingHostel} 
          onClose={() => setEditingHostel(null)} 
        />
      )}
    </div>
  );
}

// Sub-component for individual Hostel Stats & Management
function HostelManagementCard({ hostel, onEdit }) {
  // Calculate Totals
  const totalStudents = hostel.rooms.reduce((sum, r) => sum + r.current_occupancy, 0);
  const totalRevenue = hostel.rooms.reduce((sum, r) => sum + (r.current_occupancy * r.price), 0);
  const remainingBeds = hostel.rooms.reduce((sum, r) => sum + (r.capacity - r.current_occupancy), 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-4">
          <img src={hostel.images} className="w-16 h-16 rounded-lg object-cover" alt="" />
          <h2 className="text-xl font-bold">{hostel.hostel_name}</h2>
        </div>
        <button onClick={onEdit} className="text-blue-600 flex items-center gap-1 font-semibold hover:underline">
          <Edit3 size={16} /> Edit Details
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-100">
        <div className="p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Users /></div>
          <div>
            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Students</p>
            <p className="text-2xl font-black">{totalStudents}</p>
          </div>
        </div>
        <div className="p-6 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl"><DollarSign /></div>
          <div>
            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Monthly Revenue</p>
            <p className="text-2xl font-black">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="p-6 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Bed /></div>
          <div>
            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Remaining Beds</p>
            <p className="text-2xl font-black">{remainingBeds}</p>
          </div>
        </div>
      </div>

      {/* Nested Room Management */}
      <div className="p-6 bg-white">
        <h3 className="font-bold text-gray-700 mb-4">Room Inventory</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-400 text-sm uppercase">
              <th className="pb-4 font-medium">Room Type</th>
              <th className="pb-4 font-medium">Capacity</th>
              <th className="pb-4 font-medium">Occupied</th>
              <th className="pb-4 font-medium">Price</th>
              <th className="pb-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hostel.rooms.map(room => (
              <tr key={room.id} className="border-t border-gray-50 group">
                <td className="py-4 font-bold text-gray-800">{room.room_type}</td>
                <td className="py-4 text-gray-600">{room.capacity} Beds</td>
                <td className="py-4 text-gray-600">{room.current_occupancy} Students</td>
                <td className="py-4 text-gray-600 font-semibold">${room.price}</td>
                <td className="py-4 text-right">
                   <button className="text-gray-400 hover:text-blue-600 transition p-2">
                     <Edit3 size={18} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}