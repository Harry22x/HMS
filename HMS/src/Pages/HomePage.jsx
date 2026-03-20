import HostelCard from "../components/HostelCard";
import { useEffect, useState } from "react";

export default function Homepage() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:5555/hostels')
      .then((r) => r.json())
      .then((data) => {
        setHostels(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []); 

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl font-bold">Loading Hostels...</h1>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl mb-4 font-bold">Find Your Perfect Hostel</h1>
            <p className="text-xl text-blue-100 mb-6">
              Browse through our wide selection of student accommodation options
            </p>
            <div className="flex gap-4">
              {/* Note: Standard HTML buttons don't have 'variant' or 'size' 
                  unless you're using a UI library like Shadcn/UI */}
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
                Browse Hostels
              </button>
              <button className="bg-transparent border border-white text-white px-6 py-2 rounded-lg hover:bg-white/10 transition">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Available Hostels</h2>
          <p className="text-gray-600">Showing {hostels.length} hostels</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hostels.map((hostel) => (
            
            <HostelCard key={hostel.id} {...hostel} />
          ))}
        </div>
      </div>
    </>
  );
}