import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  AlertTriangle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { fetchDashboardData, isLoading, getCachedData } = useData();
  const [data, setData] = useState(null);

  // Get cached data immediately
  const cachedData = getCachedData(
    user?.role === 'STUDENT' ? '/student/outpass/mine' :
    user?.role === 'TEACHER' ? '/teacher/outpass/assigned' :
    user?.role === 'HOD' ? '/hod/outpass/assigned' : ''
  );

  const loading = isLoading(
    user?.role === 'STUDENT' ? '/student/outpass/mine' :
    user?.role === 'TEACHER' ? '/teacher/outpass/assigned' :
    user?.role === 'HOD' ? '/hod/outpass/assigned' : ''
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchDashboardData();
        if (result) {
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    // Use cached data immediately if available
    if (cachedData) {
      setData(cachedData);
    }

    // Fetch fresh data
    loadData();
  }, [user?.role, fetchDashboardData, cachedData]);

  const handleRefresh = async () => {
    try {
      const result = await fetchDashboardData(true); // Force refresh
      if (result) {
        setData(result);
      }
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    }
  };

  // Memoize computed stats to avoid recalculation
  const { stats, recentOutpasses } = useMemo(() => {
    if (!data) return { stats: {}, recentOutpasses: [] };

    const outpasses = data.outpasses || [];
    const recent = outpasses.slice(0, 5);

    let computedStats = {};
    
    if (user?.role === 'STUDENT') {
      computedStats = {
        total: outpasses.length,
        pending: outpasses.filter(o => o.status === 'PENDING').length,
        approved: outpasses.filter(o => o.status === 'APPROVED').length,
        rejected: outpasses.filter(o => o.status === 'REJECTED').length,
      };
    } else if (user?.role === 'TEACHER') {
      computedStats = {
        total: outpasses.length,
        pending: outpasses.filter(o => o.status === 'PENDING').length,
        moved: outpasses.filter(o => o.status === 'MOVED').length,
        rejected: outpasses.filter(o => o.status === 'REJECTED').length,
      };
    } else if (user?.role === 'HOD') {
      computedStats = {
        total: outpasses.length,
        moved: outpasses.filter(o => o.status === 'MOVED').length,
        approved: outpasses.filter(o => o.status === 'APPROVED').length,
        rejected: outpasses.filter(o => o.status === 'REJECTED').length,
      };
    }

    return { stats: computedStats, recentOutpasses: recent };
  }, [data, user?.role]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'MOVED': return 'bg-blue-100 text-blue-800';
      case 'EXITED': return 'bg-purple-100 text-purple-800';
      case 'EXPIRED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWelcomeMessage = () => {
    switch (user.role) {
      case 'STUDENT':
        return 'Manage your outpass requests and track their status';
      case 'TEACHER':
        return 'Review and approve outpass requests from your students';
      case 'HOD':
        return 'Final approval for outpass requests in your department';
      case 'ADMIN':
        return 'Verify student outpasses and manage security';
      default:
        return 'Welcome to the OutPass Management System';
    }
  };

  const renderStatsCards = () => {
    if (user.role === 'STUDENT') {
      return (
        <>
          <div className="card p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Outpasses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected || 0}</p>
              </div>
            </div>
          </div>
        </>
      );
    } else if (user.role === 'TEACHER') {
      return (
        <>
          <div className="card p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Moved to HOD</p>
                <p className="text-2xl font-bold text-gray-900">{stats.moved || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected || 0}</p>
              </div>
            </div>
          </div>
        </>
      );
    } else if (user.role === 'HOD') {
      return (
        <>
          <div className="card p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Awaiting Approval</p>
                <p className="text-2xl font-bold text-gray-900">{stats.moved || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected || 0}</p>
              </div>
            </div>
          </div>
        </>
      );
    }
    
    return null;
  };

  // Show loading only if no cached data is available
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">{getWelcomeMessage()}</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {user.role !== 'ADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderStatsCards()}
        </div>
      )}

      {user.role !== 'ADMIN' && recentOutpasses.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Outpasses</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOutpasses.map((outpass) => (
              <div key={outpass.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user.role === 'STUDENT' ? outpass.reason : outpass.student?.user?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(outpass.createdAt).toLocaleDateString()} • {outpass.type}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(outpass.status)}`}>
                    {outpass.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {user.role === 'ADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security Actions</h3>
            <div className="space-y-3">
              <a href="/security/verify" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-blue-900">Verify Student OTP</span>
                </div>
              </a>
              <a href="/outpass/expired" className="block p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-red-600 mr-3" />
                  <span className="text-sm font-medium text-red-900">View Expired Outpasses</span>
                </div>
              </a>
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto-expiry Check</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Security Verification</span>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;