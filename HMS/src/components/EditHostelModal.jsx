import React, { useState } from 'react';
import { X, Save, MapPin, Image as ImageIcon } from 'lucide-react';
import MapPicker from './MapPicker'; 



export default function EditHostelModal({ hostel, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    hostel_name: hostel.hostel_name,
    description: hostel.description,
    amenities: hostel.amenities.split(', '), 
    latitude: hostel.latitude,
    longitude: hostel.longitude,
  });



  const [newImage, setNewImage] = useState(null);
  const [mapPos, setMapPos] = useState([hostel.latitude, hostel.longitude]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const AMENITY_OPTIONS = [
  "WiFi", "Laundry", "Security", "Parking", "Gym", 
  "Cafeteria", "Study Room", "Common Room", "Backup Generator"
]

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append('hostel_name', formData.hostel_name);
    data.append('description', formData.description);
    data.append('latitude', mapPos[0]);
    data.append('longitude', mapPos[1]);
    data.append('amenities', formData.amenities.join(', '));
    
    // this makes sure that it only appends image if a new one was selected
    if (newImage) {
      data.append('hostel_image', newImage);
    }

    try {
      const response = await fetch(`http://127.0.0.1:5555/hostels/${hostel.id}`, {
        method: 'PATCH', 
        body: data,
      });

      if (response.ok) {
        const updated = await response.json();
        await onUpdate();
        onClose();
      }
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">Edit {hostel.hostel_name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name & Description */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Hostel Name</label>
                <input 
                  type="text" value={formData.hostel_name}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData({...formData, hostel_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  value={formData.description} rows="4"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            {/* Image Preview & Upload */}
            <div className="space-y-4">
               <label className="block text-sm font-bold text-gray-700 mb-1">Update Cover Image</label>
               <div className="relative group">
                 <img 
                   src={newImage ? URL.createObjectURL(newImage) : hostel.images} 
                   className="w-full h-40 object-cover rounded-2xl border" 
                   alt="Preview" 
                 />
                 <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-2xl cursor-pointer text-white font-bold">
                    <ImageIcon className="mr-2" /> Change Photo
                    <input type="file" className="hidden" onChange={(e) => setNewImage(e.target.files[0])} />
                 </label>
               </div>
            </div>
          </div>

          {/* Amenities Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map(opt => (
                <button
                  key={opt} type="button"
                  onClick={() => handleAmenityChange(opt)}
                  className={`px-4 py-2 rounded-full border-2 transition ${
                    formData.amenities.includes(opt) 
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : "bg-white border-gray-200 text-gray-500"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

         
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Update Location</label>
            <MapPicker position={mapPos} setPosition={setMapPos} />
          </div>

          
          <div className="pt-6 border-t flex gap-4">
            <button 
              type="submit" disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Save size={20} /> {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
            <button 
              type="button" onClick={onClose}
              className="px-8 py-4 border-2 rounded-2xl font-bold text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}