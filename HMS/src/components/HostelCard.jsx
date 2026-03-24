import React from 'react';
import { Wifi, Car, UtensilsCrossed, WashingMachine, MapPin } from 'lucide-react';
import {Link} from 'react-router-dom';

const HostelCard = ({id,name,location,image,description}) => {
  const amenities = [
    { name: 'WiFi', icon: <Wifi size={16} /> },
    { name: 'Parking', icon: <Car size={16} /> },
    { name: 'Cafeteria', icon: <UtensilsCrossed size={16} /> },
    { name: 'Laundry', icon: <WashingMachine size={16} /> },
  ];

  return (
    <Link to={`hostels/${id}`}>
    <div className="max-w-sm rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100 font-sans">
      
      <div className="relative h-56">
        <img 
          src={image} 
          alt="University Heights Hostel" 
          className="w-full h-full object-cover"
        />
      </div>

      
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
        
        <div className="flex items-center text-gray-500 mt-2 mb-4">
          <MapPin size={18} className="mr-1" />
          <span className="text-lg">{location}</span>
        </div>

        <p className="text-gray-600 leading-relaxed mb-6">
         {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {amenities.map((item) => (
            <div 
              key={item.name} 
              className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700 font-medium"
            >
              {item.icon}
              <span className="text-sm">{item.name}</span>
            </div>
          ))}
        </div>

        
        <button className="w-full bg-[#050510] text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors">
          View Details
        </button>
      </div>
    </div>
    </Link>
  );
};

export default HostelCard;