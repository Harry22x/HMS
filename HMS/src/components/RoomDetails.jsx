import React from 'react';

export default function RoomDetails({ room }) {

  const remainingSpace = room.capacity - room.current_occupancy;
  const occupancyRate = (room.current_occupancy / room.capacity) * 100;
  
 
  const isAlmostFull = occupancyRate >= 80 && occupancyRate < 100;

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
          
          <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}