import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaUserMd, FaUserTie, FaShoppingCart } from 'react-icons/fa';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('owner');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { value: 'owner', label: 'Owner / Admin', icon: <FaUserTie className="text-3xl" />, demo: { username: 'admin', password: 'admin123' } },
    { value: 'staff', label: 'Staff / Pharmacist', icon: <FaUserMd className="text-3xl" />, demo: { username: 'staff', password: 'staff123' } },
    { value: 'customer', label: 'Customer', icon: <FaShoppingCart className="text-3xl" />, demo: { username: 'customer', password: 'customer123' } }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(username, password);
    
    if (result.success) {
      // Redirect based on role
      if (result.user.role === 'owner' || result.user.role === 'staff') {
        navigate('/dashboard');
      } else if (result.user.role === 'customer') {
        navigate('/billing'); // Customers can access billing page to see their purchases
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
    }
  };

  const handleDemoLogin = (demoCredentials) => {
    setUsername(demoCredentials.username);
    setPassword(demoCredentials.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Branding */}
        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-3">
              MediStock <span className="text-primary-600">AI</span>
            </h1>
            <p className="text-2xl text-gray-600 font-semibold mb-2">
              Smart Inventory. Safer Care.
            </p>
            <p className="text-gray-500">
              AI-powered pharmacy inventory management system
            </p>
          </div>

          <div className="space-y-4 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Demo Credentials:</h3>
            {roles.map((role) => (
              <div key={role.value} className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold text-sm text-gray-700">{role.label}</p>
                <p className="text-xs text-gray-600">
                  Username: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{role.demo.username}</span>
                </p>
                <p className="text-xs text-gray-600">
                  Password: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{role.demo.password}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white p-8 rounded-2xl shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Login to MediStock
          </h2>

          {/* Role Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.value);
                    handleDemoLogin(role.demo);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedRole === role.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className={selectedRole === role.value ? 'text-primary-600' : 'text-gray-400'}>
                    {role.icon}
                  </div>
                  <span className="text-xs font-medium text-center">{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>🎓 Academic Project - Demo Version</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
