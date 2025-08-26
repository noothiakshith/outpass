import { useAuth } from '../context/AuthContext';
import { LogOut, User, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getRoleColor = (role) => {
    switch (role) {
      case 'STUDENT': return 'bg-blue-100 text-blue-800';
      case 'TEACHER': return 'bg-green-100 text-green-800';
      case 'HOD': return 'bg-purple-100 text-purple-800';
      case 'ADMIN': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNavLinks = () => {
    switch (user?.role) {
      case 'STUDENT':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: Home },
          { path: '/outpass/create', label: 'Create Outpass' },
          { path: '/outpass/history', label: 'My Outpasses' }
        ];
      case 'TEACHER':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: Home },
          { path: '/outpass/pending', label: 'Pending Approvals' },
          { path: '/students', label: 'My Students' }
        ];
      case 'HOD':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: Home },
          { path: '/outpass/pending', label: 'Pending Approvals' },
          { path: '/students', label: 'Department Students' }
        ];
      case 'ADMIN':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: Home },
          { path: '/security/verify', label: 'Verify OTP' },
          { path: '/outpass/expired', label: 'Expired Outpasses' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-gray-900">
                OutPass System
              </Link>
              <div className="hidden md:flex ml-8 space-x-4">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user?.role)}`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;