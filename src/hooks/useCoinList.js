import { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_COINS_API_URL;

// query is a fragment such as 'per_page=10'; null skips the fetch
const useCoinList = (query) => {
  const [coins, setCoins] = useState([]);
  // The query that coins came from, which lags behind query while fetching
  const [loadedQuery, setLoadedQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query === null) return;

    // Abort superseded requests so a stale response can't overwrite newer state
    const controller = new AbortController();

    const fetchCoins = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${API_URL}&order=market_cap_desc&${query}&page=1&sparkline=false`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        setCoins(data);
        setLoadedQuery(query);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchCoins();

    return () => controller.abort();
  }, [query]);

  return { coins, loadedQuery, loading, error };
};

export default useCoinList;
