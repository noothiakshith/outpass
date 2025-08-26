import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState({});

  // Generic cache key generator
  const getCacheKey = (endpoint, params = {}) => {
    const paramString = Object.keys(params).length ? JSON.stringify(params) : '';
    return `${endpoint}_${user?.id}_${paramString}`;
  };

  // Generic fetch with caching
  const fetchWithCache = useCallback(async (endpoint, options = {}) => {
    const { 
      cacheTime = 5 * 60 * 1000, // 5 minutes default
      forceRefresh = false,
      params = {}
    } = options;
    
    const cacheKey = getCacheKey(endpoint, params);
    const now = Date.now();
    
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && cache[cacheKey] && (now - cache[cacheKey].timestamp < cacheTime)) {
      return cache[cacheKey].data;
    }

    // Prevent multiple simultaneous requests
    if (loading[cacheKey]) {
      return new Promise((resolve) => {
        const checkCache = () => {
          if (cache[cacheKey] && !loading[cacheKey]) {
            resolve(cache[cacheKey].data);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    try {
      setLoading(prev => ({ ...prev, [cacheKey]: true }));
      const response = await api.get(endpoint, { params });
      const data = response.data;
      
      // Cache the response
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data,
          timestamp: now
        }
      }));
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, [cacheKey]: false }));
    }
  }, [cache, loading, user?.id]);

  // Invalidate cache for specific endpoints
  const invalidateCache = useCallback((pattern) => {
    setCache(prev => {
      const newCache = { ...prev };
      Object.keys(newCache).forEach(key => {
        if (key.includes(pattern)) {
          delete newCache[key];
        }
      });
      return newCache;
    });
  }, []);

  // Clear all cache
  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  // Check if data is loading
  const isLoading = useCallback((endpoint, params = {}) => {
    const cacheKey = getCacheKey(endpoint, params);
    return loading[cacheKey] || false;
  }, [loading, user?.id]);

  // Get cached data without fetching
  const getCachedData = useCallback((endpoint, params = {}) => {
    const cacheKey = getCacheKey(endpoint, params);
    return cache[cacheKey]?.data || null;
  }, [cache, user?.id]);

  // Role-specific data fetchers
  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    if (!user) return null;

    const endpoint = user.role === 'STUDENT' ? '/student/outpass/mine' :
                    user.role === 'TEACHER' ? '/teacher/outpass/assigned' :
                    user.role === 'HOD' ? '/hod/outpass/assigned' : null;

    if (!endpoint) return null;

    return fetchWithCache(endpoint, { 
      cacheTime: 2 * 60 * 1000, // 2 minutes for dashboard
      forceRefresh 
    });
  }, [user, fetchWithCache]);

  const fetchOutpassHistory = useCallback(async (forceRefresh = false) => {
    if (user?.role !== 'STUDENT') return null;
    
    return fetchWithCache('/student/outpass/mine', { 
      cacheTime: 1 * 60 * 1000, // 1 minute for history
      forceRefresh 
    });
  }, [user, fetchWithCache]);

  const fetchPendingApprovals = useCallback(async (forceRefresh = false) => {
    if (!['TEACHER', 'HOD'].includes(user?.role)) return null;
    
    const endpoint = user.role === 'TEACHER' ? '/teacher/outpass/assigned' : '/hod/outpass/assigned';
    
    return fetchWithCache(endpoint, { 
      cacheTime: 30 * 1000, // 30 seconds for pending approvals (more frequent updates)
      forceRefresh 
    });
  }, [user, fetchWithCache]);

  const fetchExpiredOutpasses = useCallback(async (forceRefresh = false) => {
    if (user?.role !== 'ADMIN') return null;
    
    return fetchWithCache('/security/outpass/expired', { 
      cacheTime: 5 * 60 * 1000, // 5 minutes for expired outpasses
      forceRefresh 
    });
  }, [user, fetchWithCache]);

  // Mutation helpers that invalidate relevant cache
  const createOutpass = useCallback(async (data) => {
    const response = await api.post('/student/outpass/request', data);
    // Invalidate student outpass cache
    invalidateCache('/student/outpass/mine');
    invalidateCache('/teacher/outpass/assigned');
    invalidateCache('/hod/outpass/assigned');
    return response.data;
  }, [invalidateCache]);

  const approveOutpass = useCallback(async (id, role) => {
    const endpoint = role === 'TEACHER' ? `/teacher/outpass/approve/${id}` : `/hod/outpass/approve/${id}`;
    const response = await api.post(endpoint);
    
    // Invalidate relevant caches
    invalidateCache('/teacher/outpass/assigned');
    invalidateCache('/hod/outpass/assigned');
    invalidateCache('/student/outpass/mine');
    
    return response.data;
  }, [invalidateCache]);

  const rejectOutpass = useCallback(async (id, role) => {
    const endpoint = role === 'TEACHER' ? `/teacher/outpass/reject/${id}` : `/hod/outpass/reject/${id}`;
    const response = await api.post(endpoint);
    
    // Invalidate relevant caches
    invalidateCache('/teacher/outpass/assigned');
    invalidateCache('/hod/outpass/assigned');
    invalidateCache('/student/outpass/mine');
    
    return response.data;
  }, [invalidateCache]);

  const verifyOTP = useCallback(async (otp) => {
    const response = await api.post('/security/outpass/verify', { otp });
    
    // Invalidate security-related caches
    invalidateCache('/security/outpass/expired');
    invalidateCache('/student/outpass/mine');
    
    return response.data;
  }, [invalidateCache]);

  const value = {
    // Data fetchers
    fetchDashboardData,
    fetchOutpassHistory,
    fetchPendingApprovals,
    fetchExpiredOutpasses,
    
    // Mutations
    createOutpass,
    approveOutpass,
    rejectOutpass,
    verifyOTP,
    
    // Cache management
    invalidateCache,
    clearCache,
    isLoading,
    getCachedData,
    
    // Direct cache access
    cache
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};