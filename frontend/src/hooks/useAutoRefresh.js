import { useEffect, useRef } from 'react';

export const useAutoRefresh = (refreshFunction, interval = 30000, enabled = true) => {
  const intervalRef = useRef(null);
  const refreshFunctionRef = useRef(refreshFunction);

  // Update the ref when the function changes
  useEffect(() => {
    refreshFunctionRef.current = refreshFunction;
  }, [refreshFunction]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Set up auto-refresh
    intervalRef.current = setInterval(() => {
      if (refreshFunctionRef.current) {
        refreshFunctionRef.current();
      }
    }, interval);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval, enabled]);

  // Manual cleanup function
  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return { stopAutoRefresh };
};