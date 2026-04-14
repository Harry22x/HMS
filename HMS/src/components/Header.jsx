import { Link, useNavigate } from 'react-router';
import { Building2, LogOut, Upload, Mail } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useEffect, useState } from 'react';



export default function Header() {

  const { user, logout, loading } = useAuth();
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      const fetchCount = () => {
        fetch(`http://127.0.0.1:5555/users/${user.id}/unread-count`)
          .then(r => r.json())
          .then(data => setUnreadCount(data.unread_count));
      };

      fetchCount();
      const interval = setInterval(fetchCount, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return null;
  //console.log(user)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-semibold">Strathmore HostelHub</span>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, {user.full_name} ({user.role})
                </span>
                {user.role === 'student' && (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    <Link to="/my-bookings">My Bookings</Link>
                  </button>
                )}
                {user.role === 'manager' && (
                  <button variant="outline" size="sm" asChild className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold  transition">
                    <Link to="/manager-dashboard">

                      Manage Hostels
                    </Link>
                  </button>
                )}
                {user.role === 'admin' && (
                  <button variant="outline" size="sm" asChild className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold  transition">
                    <Link to="/admin-dashboard">

                      Admin Dashboard
                    </Link>
                  </button>
                )}
                <button variant="outline" size="sm" asChild className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold  transition">
                  <Link to="/inbox" className="relative flex items-center gap-2 font-bold">

                    <Mail size={20} />
                    <span>Inbox</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white items-center justify-center font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      </span>
                    )}
                  </Link>
                </button>
                <button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button variant="ghost" size="sm" asChild>
                  <Link to="/login">Log In</Link>
                </button>
                <button size="sm" asChild>
                  <Link to="/signup">Sign Up</Link>
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}