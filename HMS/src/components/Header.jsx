import { Link, useNavigate } from 'react-router';
import { Building2,LogOut, Upload } from 'lucide-react';
import { useAuth } from '../AuthContext';


export default function Header(){

    const { user, logout, loading } = useAuth();
    const navigate = useNavigate()

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
                {user.role === 'manager' && (
                  <button variant="outline" size="sm" asChild>
                    <Link to="/manager-dashboard">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Hostel
                    </Link>
                  </button>
                )}
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