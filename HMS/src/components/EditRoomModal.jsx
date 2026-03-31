import React, { useState } from 'react';
import { X, Save, Bed } from 'lucide-react';

export default function EditRoomModal({ room, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    room_type: room.room_type,
    capacity: room.capacity,
    price: room.price,
    description: room.description
  });
  const [newImage, setNewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append('room_type', formData.room_type);
    data.append('capacity', formData.capacity);
    data.append('price', formData.price);
    data.append('description', formData.description);
    
    if (newImage) data.append('room_image', newImage);

    try {
      const response = await fetch(`http://127.0.0.1:5555/rooms/${room.id}`, {
        method: 'PATCH',
        body: data,
      });

      if (response.ok) {
        const updatedRoom = await response.json();
        onUpdate(updatedRoom); 
        onClose();
      }
    } catch (err) {
      console.error("Room update failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg">Edit {room.room_type} Room</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 uppercase">Room Type</label>
              <input 
                type="text" value={formData.room_type}
                className="w-full p-2 border rounded-lg"
                onChange={(e) => setFormData({...formData, room_type: e.target.value})}
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-bold text-gray-400 uppercase">Beds</label>
              <input 
                type="number" value={formData.capacity}
                className="w-full p-2 border rounded-lg"
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase">Price (Kes)</label>
            <input 
              type="number" value={formData.price}
              className="w-full p-2 border rounded-lg font-mono"
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase">Room Image</label>
            <input 
              type="file" className="w-full text-sm mt-1"
              onChange={(e) => setNewImage(e.target.files[0])}
            />
          </div>

          <button 
            type="submit" disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {isSubmitting ? "Updating..." : "Update Room"}
          </button>
        </form>
      </div>
    </div>
  );
}