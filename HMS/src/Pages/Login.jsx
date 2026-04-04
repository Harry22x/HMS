import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Ensure correct import
import { useAuth } from '../AuthContext';
import { Building2, AlertCircle } from 'lucide-react'; // For the icon

export default function Login() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result?.success) {
        navigate('/');
      } else {
        setError(result?.errorMessage || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-50 rounded-full text-blue-600">
            <Building2 size={32} />
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Log in to your hostel management account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm animate-shake">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-bold text-gray-700 ml-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label htmlFor="password" className="text-sm font-bold text-gray-700">
                Password
              </label>
              <Link to="#" className="text-sm text-blue-600 font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#050505] text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>

          {/* Footer Link */}
          <p className="text-center text-sm text-gray-500 pt-2">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}