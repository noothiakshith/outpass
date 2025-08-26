import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Clock, CheckCircle, XCircle, Eye, QrCode, RefreshCw } from 'lucide-react';

const OutpassHistory = () => {
  const { fetchOutpassHistory, isLoading, getCachedData } = useData();
  const [outpasses, setOutpasses] = useState([]);
  const [selectedOutpass, setSelectedOutpass] = useState(null);

  // Get cached data immediately
  const cachedData = getCachedData('/student/outpass/mine');
  const loading = isLoading('/student/outpass/mine');

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchOutpassHistory();
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
  }, [fetchOutpassHistory, cachedData]);

  const handleRefresh = async () => {
    try {
      const result = await fetchOutpassHistory(true); // Force refresh
      if (result?.outpasses) {
        setOutpasses(result.outpasses);
      }
    } catch (error) {
      console.error('Error refreshing outpasses:', error);
    }
  };

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'MOVED': return <Clock className="h-4 w-4" />;
      case 'EXITED': return <CheckCircle className="h-4 w-4" />;
      case 'EXPIRED': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'PENDING': return 'Waiting for teacher approval';
      case 'APPROVED': return 'Approved - Ready to use';
      case 'REJECTED': return 'Request was rejected';
      case 'MOVED': return 'Moved to HOD for final approval';
      case 'EXITED': return 'Student has exited campus';
      case 'EXPIRED': return 'Outpass has expired';
      default: return status;
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">My Outpasses</h1>
          <p className="text-gray-600">Track the status of your outpass requests</p>
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

      {outpasses.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No outpasses yet</h3>
          <p className="text-gray-500 mb-4">You haven't created any outpass requests</p>
          <a href="/outpass/create" className="btn btn-primary">
            Create Your First Outpass
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {outpasses.map((outpass) => (
            <div key={outpass.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(outpass.status)}`}>
                      {getStatusIcon(outpass.status)}
                      <span className="ml-1">{outpass.status}</span>
                    </span>
                    <span className="text-xs text-gray-500">{outpass.type}</span>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {outpass.reason}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {getStatusDescription(outpass.status)}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Created: {new Date(outpass.createdAt).toLocaleDateString()}</span>
                    {outpass.otpTimeRemaining && (
                      <span className="text-green-600 font-medium">
                        OTP expires in: {outpass.otpTimeRemaining}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {outpass.status === 'APPROVED' && outpass.qrCode && (
                    <button
                      onClick={() => setSelectedOutpass(outpass)}
                      className="btn btn-primary btn-sm"
                    >
                      <QrCode className="h-4 w-4 mr-1" />
                      View QR
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOutpass(outpass)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for outpass details */}
      {selectedOutpass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Outpass Details</h2>
                <button
                  onClick={() => setSelectedOutpass(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOutpass.status)}`}>
                    {getStatusIcon(selectedOutpass.status)}
                    <span className="ml-1">{selectedOutpass.status}</span>
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="text-sm text-gray-900">{selectedOutpass.type}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <p className="text-sm text-gray-900">{selectedOutpass.reason}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedOutpass.createdAt).toLocaleString()}
                  </p>
                </div>
                
                {selectedOutpass.status === 'APPROVED' && selectedOutpass.otp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">OTP</label>
                    <p className="text-lg font-mono font-bold text-green-600">
                      {selectedOutpass.otp}
                    </p>
                    {selectedOutpass.otpTimeRemaining && (
                      <p className="text-xs text-gray-500">
                        Expires in: {selectedOutpass.otpTimeRemaining}
                      </p>
                    )}
                  </div>
                )}
                
                {selectedOutpass.status === 'APPROVED' && selectedOutpass.qrCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">QR Code</label>
                    <div className="flex justify-center">
                      <img 
                        src={selectedOutpass.qrCode} 
                        alt="Outpass QR Code"
                        className="w-48 h-48 border border-gray-200 rounded"
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Show this QR code to security for verification
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedOutpass(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutpassHistory;