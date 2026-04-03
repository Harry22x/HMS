import React, { use, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import {  Users, DollarSign, Bed, Edit3, Trash2, AlertCircle, Clock } from 'lucide-react';  
import EditRoomModal from '../components/EditRoomModal'; 
import {Link} from 'react-router'



export default function HostelManagementCard({ hostel, onEdit }) {


  const{checkSession} = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null); 


  
  const totalStudents = hostel.rooms.reduce((sum, r) => sum + r.current_occupancy, 0);
  const totalRevenue = hostel.rooms.reduce((sum, r) => sum + (r.current_occupancy * r.price), 0);
  const remainingBeds = hostel.rooms.reduce((sum, r) => sum + (r.capacity - r.current_occupancy), 0);


function fetchManagedHostels(){
  checkSession(localStorage.getItem("jwt"));
}

  const handleDeleteHostel = async () => {
    if (!window.confirm(`Are you sure you want to delete ${hostel.hostel_name}? This will remove all rooms and cannot be undone.`)) return;

    const response = await fetch(`http://127.0.0.1:5555/hostels/${hostel.id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      alert("Hostel deleted.");
       fetchManagedHostels(); 
    } else {
      const err = await response.json();
      alert(err.error);
    }
  };

  const handleDeleteRoom = async (roomId) => {
  if (!window.confirm("Delete this room type? This will only work if the room is currently empty.")) return;

  const response = await fetch(`http://127.0.0.1:5555/rooms/${roomId}`, {
    method: 'DELETE'
  });

  if (response.ok) {
     fetchManagedHostels(); 
  } else {
    const data = await response.json();
    alert(data.error || "Could not delete room.");
  }
};

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
      <Link to={`/hostels/${hostel.id}`}>
        <div className="flex items-center gap-4">
          <img src={hostel.images} className="w-16 h-16 rounded-lg object-cover" alt="" />
          <h2 className="text-xl font-bold">{hostel.hostel_name}</h2>
        </div>
        <div className="mt-2 flex items-center gap-2">
  {hostel.status === 'pending' && (
    <p className="text-orange-500 text-sm font-medium flex items-center gap-1">
      <Clock size={14} /> Under Review by Admin
    </p>
  )}
  {hostel.status === 'rejected' && (
    <p className="text-red-500 text-sm font-medium flex items-center gap-1">
      <AlertCircle size={14} /> This listing was rejected. Contact support.
    </p>
  )}
</div>
        </Link>
        <button onClick={onEdit} className="text-blue-600 flex items-center gap-1 font-semibold hover:underline">
          <Edit3 size={16} /> Edit Details
        </button>
        <button 
              onClick={handleDeleteHostel} 
              className="text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold"
            >
              <Trash2 size={16} /> Delete Hostel
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
            <p className="text-2xl font-black">Ksh. {totalRevenue.toLocaleString()}</p>
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
                <td className="py-4 text-gray-600 font-semibold">Ksh. {room.price}</td>
              <td className="py-4 text-right">
                <button 
                  onClick={() => setEditingRoom(room)} 
                  className="text-gray-400 hover:text-blue-600 transition p-2"
                >
                  <Edit3 size={18} />
                </button>
                <button 
     onClick={() => handleDeleteRoom(room.id)}
     className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg"
   >
     <Trash2 size={18} />
   </button>
              </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingRoom && (
  <EditRoomModal 
    room={editingRoom} 
    onClose={() => setEditingRoom(null)} 
    onUpdate={() => {
        
        fetchManagedHostels(); 
    }}
  />
)}
      
    </div>
    
  );
}