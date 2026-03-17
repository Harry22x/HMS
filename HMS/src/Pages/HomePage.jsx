import HostelCard from "../components/HostelCard"

export default function Homepage(){

  const Hostels = [
    {
    id: '1',
    name: 'University Heights Hostel',
    location: 'Campus North, Block A',
    price: 450,
    capacity: 100,
    occupancy: 75,
    amenities: ['WiFi', 'Parking', 'Cafeteria', 'Laundry'],
    image: 'https://images.unsplash.com/photo-1552933440-440952890413?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwaG9zdGVsJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzcyMTIxNjA0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Modern hostel facilities with excellent amenities',
  },
  {
    id: '2',
    name: 'Central Student Residence',
    location: 'Main Campus, Building 5',
    price: 380,
    capacity: 80,
    occupancy: 60,
    amenities: ['WiFi', 'Study Room', 'Gym'],
    image: 'https://images.unsplash.com/photo-1564273795917-fe399b763988?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwZG9ybWl0b3J5JTIwcm9vbXxlbnwxfHx8fDE3NzIxMDQ1Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Comfortable rooms in a central location',
  },
  {
    id: '3',
    name: 'Eastside Dormitory',
    location: 'East Campus, Tower 2',
    price: 420,
    capacity: 120,
    occupancy: 95,
    amenities: ['WiFi', 'Parking', 'Security', 'Common Room'],
    image: 'https://images.unsplash.com/photo-1539606420556-14c457c45507?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3N0ZWwlMjBhY2NvbW1vZGF0aW9ufGVufDF8fHx8MTc3MjEyMTYwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Spacious accommodation with modern facilities',
  },
  {
    id: '4',
    name: 'Westwood Hall',
    location: 'West Campus, Block C',
    price: 400,
    capacity: 90,
    occupancy: 70,
    amenities: ['WiFi', 'Cafeteria', 'Library Access'],
    image: 'https://images.unsplash.com/photo-1689090348341-a5936ec7e79e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwcmVzaWRlbmNlJTIwaGFsbHxlbnwxfHx8fDE3NzIxMjE2MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Quiet and peaceful environment for students',
  },    
    
  ]

    return(
        <>
     <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl mb-4">Find Your Perfect Hostel</h1>
            <p className="text-xl text-blue-100 mb-6">
              Browse through our wide selection of student accommodation options
            </p>
            <div className="flex gap-4">
              <button size="lg" variant="secondary">
                Browse Hostels
              </button>
              <button size="lg"  className="bg-transparent border-white text-white hover:bg-white/10">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
        <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl mb-2">Available Hostels</h2>
          <p className="text-gray-600">Showing {4} hostels</p>
        </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Hostels.map((hostel,index)=>(
        <>
        <HostelCard key={index} {...hostel}/>
        </>
      ))}
        </div>
      
        </>
    )
}