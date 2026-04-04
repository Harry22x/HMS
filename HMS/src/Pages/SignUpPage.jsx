import React, { useState } from 'react';
import { User, Building2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' //we'll set student as the default role
  });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { signup } = useAuth();


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    const result = await signup(formData.full_name, formData.email, formData.password, formData.role);

    if (result?.success) {
      navigate('/');
    } else {
      setErrorMessage(result?.errorMessage || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2">Join our hostel management system</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-3 block">I am a</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'student' })}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  formData.role === 'student' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'
                }`}
              >
                <User size={32} />
                <span className="font-bold">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'manager' })}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  formData.role === 'manager' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'
                }`}
              >
                <Building2 size={32} />
                <span className="font-bold">Manager</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Full Name</label>
            <input 
              type="text" name="full_name" placeholder="John Doe" required
              className="w-full p-4 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Email</label>
            <input 
              type="email" name="email" placeholder="john@example.com" required
              className="w-full p-4 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Password</label>
            <input 
              type="password" name="password" placeholder="••••••••" required
              className="w-full p-4 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1">Confirm Password</label>
            <input 
              type="password" name="confirmPassword" placeholder="••••••••" required
              className="w-full p-4 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          {errorMessage && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl p-3 mb-2">
              {errorMessage}
            </div>
          )}

          <button className="w-full bg-black text-white p-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg">
            Create Account
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-blue-600 font-bold">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}