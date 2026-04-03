import React from 'react';
import { useAuth } from '../AuthContext';
import { Calendar, MapPin, Hash, Trash2, Clock } from 'lucide-react';

export default function MyBookings() {
  const { user, checkSession } = useAuth(); // checkSession helps refresh the context after a change

  // Guard clause for when user isn't loaded yet
  if (!user) return <div className="p-20 text-center">Loading...</div>;

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;

    const response = await fetch(`http://127.0.0.1:5555/bookings/${bookingId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      const token = localStorage.getItem("jwt");
      await checkSession(token); 
      alert("Booking cancelled.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-4xl font-black text-gray-900 mb-2">My Bookings</h1>
      
      {/* Accessing user.bookings directly! */}
      {user.bookings.length === 0 ? (
        <div className="bg-gray-50 rounded-3xl p-20 text-center border-2 border-dashed">
          <p className="text-xl text-gray-400 font-medium">No bookings found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {user.bookings.map((booking) => (
            <div key={booking.id} className="bg-white border rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row">
              <img 
                src={booking.room.images} 
                className="w-full md:w-64 h-48 md:h-auto object-cover" 
                alt="Room" 
              />
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      booking.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900">{booking.room.hostel.hostel_name}</h2>
                  <p className="text-blue-600 font-semibold mb-4">{booking.room.room_type} Suite</p>
                  
                  <div className="text-sm text-gray-600 flex items-center gap-4">
                    <span className="flex items-center gap-1"><Hash size={14}/> Room #{booking.room.id}</span>
                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(booking.booking_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex justify-between items-center">
                  <p className="text-xl font-black text-gray-900">Ksh. {booking.room.price}</p>
                  <button 
                    onClick={() => handleCancel(booking.id)}
                    className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition font-bold flex items-center gap-2"
                  >
                    <Trash2 size={18} /> Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}