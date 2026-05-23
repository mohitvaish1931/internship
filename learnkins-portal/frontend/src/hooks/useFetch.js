import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const useFetch = (url, options = { lazy: false }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!options.lazy);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(url);
      setData(response.data);
    } catch (err) {
      console.error(`useFetch Error for URL ${url}:`, err);
      setError(err.response?.data?.message || 'Failed to fetch content.');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (!options.lazy) {
      fetchData();
    }
  }, [fetchData, options.lazy]);

  return { data, loading, error, refresh: fetchData, setData };
};

export default useFetch;
