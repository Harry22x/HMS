import React, { use, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Plus, Check, XCircle, Clock } from 'lucide-react';
import EditHostelModal from '../components/EditHostelModal'; 
import AddHostelForm from '../components/AddHostelForm';    
import HostelManagementCard from '../components/HostelManagementCard';


export default function ManagerDashboard() {
  const { user, checkSession} = useAuth();
  const [hostels, setHostels] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);


 // console.log(user)

 function fetchManagedHostels(){
  checkSession(localStorage.getItem("jwt"))
 }

  useEffect(() => {
setHostels(user.managed_hostels)
  }, [user]);

const pendingBookings = hostels.flatMap(h => 
  h.rooms.flatMap(r => 
    r.bookings.filter(b => b.status === 'pending').map(b => ({
      ...b,
      hostelName: h.hostel_name,
      roomType: r.room_type
    }))
  )
)

const handleStatusChange = async (bookingId, newStatus) => {
  const response = await fetch(`http://127.0.0.1:5555/bookings/${bookingId} `, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });

  if (response.ok) {
    // Refresh the dashboard data
    fetchManagedHostels(); 
  }
};
  if (!user) return <div>Loading...</div>;
  if(user.role !== 'manager') return (
    <div className="p-20 text-center">
      <h1>Must be a manager to access this page!</h1>
      </div>
  )

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

        <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Clock className="text-orange-500" /> Pending Approval ({pendingBookings.length})
      </h2>
      
      {pendingBookings.length === 0 ? (
        <div className="p-10 bg-white border-2 border-dashed rounded-3xl text-center text-gray-400">
          No new booking requests at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingBookings.map(booking => (
            <div key={booking.id} className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 border-l-4 border-l-orange-400">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-black text-gray-900 text-lg">{booking.student?.full_name || "New Student"}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase">{booking.student?.email}</p>
                </div>
                <span className="text-xs font-mono text-gray-400">#{booking.id}</span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl mb-4 text-sm">
                <p className="text-gray-500">Hostel: <span className="font-bold text-gray-700">{booking.hostelName}</span></p>
                <p className="text-gray-500">Room: <span className="font-bold text-gray-700">{booking.roomType}</span></p>
              </div>

              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => handleStatusChange(booking.id, 'approved')}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-1 hover:bg-green-700 transition"
                >
                  <Check size={16} /> Approve
                </button>
                <button 
                  onClick={() => handleStatusChange(booking.id, 'rejected')}
                  className="flex-1 border-2 border-red-100 text-red-500 py-2 rounded-lg font-bold flex items-center justify-center gap-1 hover:bg-red-50 transition"
                >
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
      </div>

      {isAddModalOpen && <AddHostelForm onClose={() => setIsAddModalOpen(false)} onHostelAdded={()=>fetchManagedHostels()} />}
      {editingHostel && (
        <EditHostelModal 
          hostel={editingHostel} 
          onClose={() => setEditingHostel(null)} 
          onUpdate={()=>fetchManagedHostels()}
        />
      )}
    </div>
  );
}

