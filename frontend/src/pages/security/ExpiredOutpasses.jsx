import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Clock, User, Calendar, AlertTriangle } from 'lucide-react';

const ExpiredOutpasses = () => {
  const [expiredOutpasses, setExpiredOutpasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpiredOutpasses();
  }, []);

  const fetchExpiredOutpasses = async () => {
    try {
      const response = await api.get('/security/outpass/expired');
      setExpiredOutpasses(response.data.expiredOutpasses);
    } catch (error) {
      console.error('Error fetching expired outpasses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'EMERGENCY': return 'bg-red-100 text-red-800';
      case 'CASUAL': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Expired Outpasses</h1>
        <p className="text-gray-600">View all expired outpass requests</p>
      </div>

      {expiredOutpasses.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No expired outpasses</h3>
          <p className="text-gray-500">All outpasses are within their validity period</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Expired Outpasses ({expiredOutpasses.length})
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  These outpasses have exceeded their validity period and are no longer usable.
                </p>
              </div>
            </div>
          </div>

          {expiredOutpasses.map((outpass) => (
            <div key={outpass.id} className="card p-6 border-l-4 border-red-500">
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
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      EXPIRED
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {outpass.reason}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Created</p>
                        <p>{new Date(outpass.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Expired</p>
                        <p>{new Date(outpass.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {outpass.validUntil && (
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Was Valid Until</p>
                          <p>{new Date(outpass.validUntil).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpiredOutpasses;