import HostelCard from "../components/HostelCard";
import { useEffect, useState } from "react";
import { Search } from "lucide-react"; // Import a search icon

export default function Homepage() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // 1. New state for search

  useEffect(() => {
    fetch('http://127.0.0.1:5555/hostels')
      .then((r) => r.json())
      .then((data) => {
        const visibleHostels = data.filter(hostel => hostel.status === 'approved');
        setHostels(visibleHostels);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  // 2. Filter logic: This runs every time 'searchTerm' or 'hostels' changes
  const filteredHostels = hostels.filter((hostel) => {
    const nameMatch = hostel.hostel_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check amenities - assuming it's a string like "Wifi, Gym, Laundry"
    const amenityMatch = hostel.amenities?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return nameMatch || amenityMatch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl font-bold">Loading Hostels...</h1>
      </div>
    );
  }

  return (
    <>
      <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl mb-4 font-bold">Find Your Perfect Hostel</h1>
            <p className="text-xl text-blue-100 mb-8">
              Browse through our wide selection of student accommodation options
            </p>
            
            {/* 3. The Search Bar UI */}
            <div className="relative max-w-xl group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-blue-400 group-focus-within:text-white-600 transition-colors" size={20} />
              </div>
              <input 
                type="text"
                placeholder="Search by name or amenities (e.g. Wifi, Gym)..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-900 border-none focus:ring-4 focus:ring-blue-400/50 shadow-xl transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Available Hostels</h2>
            <p className="text-gray-600">
              {searchTerm 
                ? `Found ${filteredHostels.length} matches for "${searchTerm}"` 
                : `Showing all ${hostels.length} hostels`}
            </p>
          </div>
        </div>
        
        {/* 4. Render filteredHostels instead of hostels */}
        {filteredHostels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHostels.map((hostel) => (
              <HostelCard key={hostel.id} {...hostel} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">No hostels found matching your search.</p>
            <button 
              onClick={() => setSearchTerm("")}
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}