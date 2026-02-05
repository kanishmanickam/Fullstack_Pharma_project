import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaTachometerAlt, FaBoxes, FaFileInvoice, FaUsers, 
  FaChartLine, FaBrain, FaFileUpload, FaSignOutAlt, FaRobot 
} from 'react-icons/fa';
import { useState } from 'react';
import Chatbot from './Chatbot';

const Layout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showChatbot, setShowChatbot] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt />, roles: ['owner', 'staff'] },
    { path: '/inventory', label: 'Inventory', icon: <FaBoxes />, roles: ['owner', 'staff'] },
    { path: '/billing', label: 'Billing', icon: <FaFileInvoice />, roles: ['owner', 'staff'] },
    { path: '/customers', label: 'Customers', icon: <FaUsers />, roles: ['owner', 'staff'] },
    { path: '/excel-upload', label: 'Excel Upload', icon: <FaFileUpload />, roles: ['owner', 'staff'] },
    { path: '/stock-intelligence', label: 'Stock Intelligence', icon: <FaBrain />, roles: ['owner'] },
    { path: '/reports', label: 'Reports & Analytics', icon: <FaChartLine />, roles: ['owner'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(currentUser?.role)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed h-full overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            MediStock <span className="text-primary-600">AI</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Smart Inventory. Safer Care.</p>
        </div>

        <nav className="px-4">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 absolute bottom-0 w-64 bg-white border-t">
          <div className="bg-gray-50 p-3 rounded-lg mb-3">
            <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>

      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setShowChatbot(!showChatbot)}
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-2xl hover:bg-primary-700 transition-all z-50"
      >
        <FaRobot className="text-2xl" />
      </button>

      {/* Chatbot Component */}
      {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} />}
    </div>
  );
};

export default Layout;
