import React, { useState } from 'react';
import { X, Plus, Trash2, Home, BedDouble } from 'lucide-react';
import { useAuth } from '../AuthContext';
import MapPicker from './MapPicker';

export default function AddHostelForm({ onClose, onHostelAdded }) {
  const { user } = useAuth();

  const AMENITY_OPTIONS = [
  "WiFi", "Laundry", "Security", "Parking", "Gym", 
  "Cafeteria", "Study Room", "Common Room", "Backup Generator"
];
const [selectedAmenities, setSelectedAmenities] = useState([]);  
const [mapPos, setMapPos] = useState([-1.2921, 36.8219]);

  const [hostelData, setHostelData] = useState({
    hostel_name: '',
    description: '',
    hostel_image: '',
    location_coordinates: 0.0,
    amenities: ''
  });

  const [rooms, setRooms] = useState([
    { room_type: 'Premium', capacity: 1, price: 0, room_image: '', description: '' }
  ]);

  const handleAddRoom = () => {
    setRooms([...rooms, { room_type: '', capacity: 1, price: 0, room_image: '', description: '' }]);
  };

  const handleRemoveRoom = (index) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleRoomChange = (index, field, value) => {
    const updatedRooms = [...rooms];
    updatedRooms[index][field] = value;
    setRooms(updatedRooms);
  };

  const handleAmenityChange = (amenity) => {
  setSelectedAmenities(prev => 
    prev.includes(amenity) 
      ? prev.filter(a => a !== amenity) // Remove if already there
      : [...prev, amenity]              // Add if not there
  );
};

 const handleSubmit = async (e) => {
  e.preventDefault();

  // Create a FormData instance
  const formData = new FormData();

  
  formData.append('hostel_name', hostelData.hostel_name);
  formData.append('description', hostelData.description);
  formData.append('manager_id', user.id);
  formData.append('location_coordinates', hostelData.location_coordinates);
  formData.append('amenities', selectedAmenities.join(', '));
  formData.append('latitude', mapPos[0]);
  formData.append('longitude', mapPos[1])

  formData.append('hostel_image', hostelData.hostel_image);

  formData.append('rooms_info', JSON.stringify(rooms.map(r => ({
    room_type: r.room_type,
    capacity: r.capacity,
    price: r.price,
    description: r.description
  }))));

  
  rooms.forEach((room, index) => {
    if (room.room_image) {
      formData.append(`room_image_${index}`, room.room_image);
    }
  });

  const response = await fetch('http://127.0.0.1:5555/hostels', {
    method: 'POST',
    // DO NOT set 'Content-Type' header! 
    // The browser will automatically set it to 'multipart/form-data' with the boundary.
    body: formData 
  });

  if (response.ok) {
    alert("Success!");
    onClose();
  }
};

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Home className="text-blue-600" /> List New Hostel
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Hostel Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block font-semibold">Hostel Name</label>
              <input 
                type="text" required className="w-full p-3 border rounded-xl"
                onChange={(e) => setHostelData({...hostelData, hostel_name: e.target.value})}
              />
              <label className="block font-semibold">Hostel Image </label>
              <input 
                type="file" accept='image/*' required className="w-full p-3 border rounded-xl"
                onChange={(e) => setHostelData({...hostelData, hostel_image: e.target.files[0]})}
              />
            </div>
            <div className="space-y-4">
              <label className="block font-semibold">Description</label>
              <textarea 
                required className="w-full p-3 border rounded-xl h-32"
                onChange={(e) => setHostelData({...hostelData, description: e.target.value})}
              ></textarea>
            </div>
            <div className="col-span-full">
  <label className="block font-bold text-gray-700">Pin Location on Map</label>
  <MapPicker position={mapPos} setPosition={setMapPos} />
</div>
          </div>
           <div className="space-y-4 col-span-full">
  <label className="block font-bold text-gray-700">Hostel Amenities</label>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
    {AMENITY_OPTIONS.map((amenity) => (
      <label key={amenity} className="flex items-center gap-3 p-2 cursor-pointer hover:bg-white rounded-lg transition-colors">
        <input
          type="checkbox"
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={selectedAmenities.includes(amenity)}
          onChange={() => handleAmenityChange(amenity)}
        />
        <span className="text-gray-700 font-medium">{amenity}</span>
      </label>
    ))}
  </div>
</div>

          <hr />

          {/* Dynamic Rooms Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BedDouble className="text-blue-600" /> Define Room Types
              </h3>
              <button 
                type="button" onClick={handleAddRoom}
                className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-100"
              >
                + Add Another Type
              </button>
            </div>

            <div className="space-y-4">
              {rooms.map((room, index) => (
                <div key={index} className="p-4 border rounded-2xl bg-gray-50 flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-37.5">
                    <label className="text-xs font-bold uppercase text-gray-400">Type (e.g. Twin)</label>
                    <input 
                      type="text" className="w-full p-2 border rounded-lg mt-1"
                      onChange={(e) => handleRoomChange(index, 'room_type', e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-xs font-bold uppercase text-gray-400">Beds</label>
                    <input 
                      type="number" className="w-full p-2 border rounded-lg mt-1"
                      onChange={(e) => handleRoomChange(index, 'capacity', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-xs font-bold uppercase text-gray-400">Price (Kes)</label>
                    <input 
                      type="number" className="w-full p-2 border rounded-lg mt-1"
                      onChange={(e) => handleRoomChange(index, 'price', parseFloat(e.target.value))}
                    />
                  </div>
                    <div className="w-32">
                    <label className="text-xs font-bold uppercase text-gray-400">Image</label>
                    <input 
                      type="file" accept='image/*' className="w-full p-2 border rounded-lg mt-1"
                      onChange={(e) => handleRoomChange(index, 'room_image', e.target.files[0])}
                    />
                  </div>
                 
                  <button 
                    type="button" onClick={() => handleRemoveRoom(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
          >
            Create Property Listing
          </button>
        </form>
      </div>
    </div>
  );
}