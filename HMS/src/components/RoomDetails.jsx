import React, {useState} from 'react';
import { useAuth } from '../AuthContext'; // Import your custom hook
import { useNavigate } from 'react-router-dom';

export default function RoomDetails({ room,onBookingSuccess }) {
  const { user, checkSession } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const remainingSpace = room.capacity - room.current_occupancy;
  const occupancyRate = (room.current_occupancy / room.capacity) * 100; 
  const isAlmostFull = occupancyRate >= 80 && occupancyRate < 100;
  const isSoldOut = remainingSpace <= 0;
  const isNotStudent = (user && user.role !== 'student')

  const handleBooking = async () => {
    
    if (!user) {
      alert("Please login to book a room!");
      navigate('/login');
      return;
    }

 
    if (user.role !== 'student') {
      alert("Only students can book rooms.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5555/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          room_id: room.id,
        }),
      });

      if (response.ok) {
        alert("Booking Successful! Pack your bags.");
        // Call the parent function to refresh the room data (occupancy will have changed)
        checkSession(localStorage.getItem("jwt"));
        if (onBookingSuccess) onBookingSuccess();
        
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Booking failed");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
      <img 
        src={room.images} 
        alt={room.room_type} 
        className="w-full h-96 object-cover"
      />
      
      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{room.room_type} Suite</h2>
            <p className="text-gray-500">Maximum Capacity: {room.capacity} Students</p>
          </div>
          
          {isAlmostFull && (
            <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
              🔥 Almost Sold Out! Only {remainingSpace} spots left
            </div>
          )}
        </div>

        <div className="prose text-gray-600 mb-8">
            This {room.room_type.toLowerCase()} room is designed for students seeking a 
            balance between privacy and community. Includes high-speed internet, 
            study desks, and shared storage units.
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <div>
            <span className="text-4xl font-black text-gray-900">Ksh. {room.price}</span>
            <span className="text-gray-500 font-medium"> / month</span>
          </div>
          
         <button 
          onClick={handleBooking}
          disabled={loading || isSoldOut || !user || isNotStudent}
          className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all transform 
            ${isSoldOut || !user || isNotStudent
              ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
              : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-lg shadow-blue-200"
            }`}
        >
          {loading ? "Processing..." : isSoldOut ? "Sold Out" : (!user || isNotStudent) ? "Only students can book rooms" : "Book Now"}
        </button>
        </div>
      </div>
    </div>
  );
}