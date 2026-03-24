import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RoomDetails from "../components/RoomDetails";

export default function HostelPage() {
  const { id } = useParams();
  const [hostel, setHostel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5555/hostels/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setHostel(data);
        if (data.rooms && data.rooms.length > 0) {
          setSelectedRoom(data.rooms[0]);
        }
      });
  }, [id]);

  if (!hostel) return <div className="p-10 text-center">Loading Hostel...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        
        <div className="lg:col-span-1">
          <img src={hostel.images} alt={hostel.hostel_name} className="w-full h-64 object-cover rounded-2xl mb-4" />
          <h1 className="text-3xl font-bold">{hostel.hostel_name}</h1>
          <p className="text-gray-500 mb-6">{hostel.description}</p>
          
          <h3 className="text-xl font-semibold mb-4">Select Room Type</h3>
          <div className="space-y-3">
            {hostel.rooms.map((room) => {
              const isFull = room.current_occupancy >= room.capacity;
              
              return (
                <button
                  key={room.id}
                  disabled={isFull}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isFull 
                      ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed" 
                      : selectedRoom?.id === room.id 
                        ? "border-blue-600 bg-blue-50" 
                        : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">{room.room_type}</span>
                    <span className="text-blue-600 font-semibold">Ksh. {room.price}/mo</span>
                  </div>
                  <p className="text-sm text-gray-500">{room.capacity} beds per room</p>
                  {isFull && <span className="text-xs font-bold text-red-500 uppercase">Sold Out</span>}
                </button>
              );
            })}
          </div>
        </div>

       
        <div className="lg:col-span-2">
          {selectedRoom ? (
            <RoomDetails room={selectedRoom} />
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed rounded-2xl text-gray-400">
              Select a room type to see details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}