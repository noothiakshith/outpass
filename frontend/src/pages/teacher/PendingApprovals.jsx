import { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, User, Calendar, RefreshCw } from 'lucide-react';

const PendingApprovals = () => {
  const { fetchPendingApprovals, approveOutpass, rejectOutpass, isLoading, getCachedData } = useData();
  const [outpasses, setOutpasses] = useState([]);
  const [actionLoading, setActionLoading] = useState({});

  // Get cached data immediately
  const cachedData = getCachedData('/teacher/outpass/assigned');
  const loading = isLoading('/teacher/outpass/assigned');

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchPendingApprovals();
        if (result?.outpasses) {
          setOutpasses(result.outpasses);
        }
      } catch (error) {
        console.error('Error fetching outpasses:', error);
      }
    };

    // Use cached data immediately if available
    if (cachedData?.outpasses) {
      setOutpasses(cachedData.outpasses);
    }

    // Fetch fresh data
    loadData();
  }, [fetchPendingApprovals, cachedData]);

  const handleRefresh = async () => {
    try {
      const result = await fetchPendingApprovals(true); // Force refresh
      if (result?.outpasses) {
        setOutpasses(result.outpasses);
      }
    } catch (error) {
      console.error('Error refreshing outpasses:', error);
    }
  };

  const handleApprove = async (outpassId) => {
    setActionLoading(prev => ({ ...prev, [outpassId]: 'approve' }));

    try {
      await approveOutpass(outpassId, 'TEACHER');
      toast.success('Outpass approved and moved to HOD');

      // Update local state optimistically
      setOutpasses(prev => prev.map(outpass =>
        outpass.id === outpassId
          ? { ...outpass, status: 'MOVED', updatedAt: new Date().toISOString() }
          : outpass
      ));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve outpass');
    } finally {
      setActionLoading(prev => ({ ...prev, [outpassId]: null }));
    }
  };

  const handleReject = async (outpassId) => {
    setActionLoading(prev => ({ ...prev, [outpassId]: 'reject' }));

    try {
      await rejectOutpass(outpassId, 'TEACHER');
      toast.success('Outpass rejected');

      // Update local state optimistically
      setOutpasses(prev => prev.map(outpass =>
        outpass.id === outpassId
          ? { ...outpass, status: 'REJECTED', updatedAt: new Date().toISOString() }
          : outpass
      ));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject outpass');
    } finally {
      setActionLoading(prev => ({ ...prev, [outpassId]: null }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'MOVED': return 'bg-blue-100 text-blue-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'EMERGENCY': return 'bg-red-100 text-red-800';
      case 'CASUAL': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Memoize filtered outpasses to avoid recalculation
  const { pendingOutpasses, processedOutpasses } = useMemo(() => {
    return {
      pendingOutpasses: outpasses.filter(o => o.status === 'PENDING'),
      processedOutpasses: outpasses.filter(o => o.status !== 'PENDING')
    };
  }, [outpasses]);

  // Auto-refresh every 30 seconds for pending approvals
  useAutoRefresh(handleRefresh, 30000, pendingOutpasses.length > 0);

  // Show loading only if no cached data is available
  if (loading && outpasses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outpass Approvals</h1>
          <p className="text-gray-600">Review and approve outpass requests from your students</p>
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

      {/* Pending Approvals */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pending Approvals ({pendingOutpasses.length})
        </h2>

        {pendingOutpasses.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
            <p className="text-gray-500">All outpass requests have been processed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOutpasses.map((outpass) => (
              <div key={outpass.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {outpass.student.user.name}
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(outpass.type)}`}>
                        {outpass.type}
                      </span>
                      {outpass.type === 'EMERGENCY' && (
                        <span className="text-xs text-red-600 font-medium">URGENT</span>
                      )}
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {outpass.reason}
                    </h3>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Requested: {new Date(outpass.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleReject(outpass.id)}
                      disabled={actionLoading[outpass.id]}
                      className="btn btn-danger btn-sm"
                    >
                      {actionLoading[outpass.id] === 'reject' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleApprove(outpass.id)}
                      disabled={actionLoading[outpass.id]}
                      className="btn btn-success btn-sm"
                    >
                      {actionLoading[outpass.id] === 'approve' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Outpasses */}
      {processedOutpasses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recently Processed ({processedOutpasses.length})
          </h2>

          <div className="space-y-4">
            {processedOutpasses.slice(0, 10).map((outpass) => (
              <div key={outpass.id} className="card p-6 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {outpass.student.user.name}
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(outpass.type)}`}>
                        {outpass.type}
                      </span>
                    </div>

                    <h3 className="text-base font-medium text-gray-900 mb-1">
                      {outpass.reason}
                    </h3>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Processed: {new Date(outpass.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(outpass.status)}`}>
                    {outpass.status === 'MOVED' ? 'Sent to HOD' : outpass.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;