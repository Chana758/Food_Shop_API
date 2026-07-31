// src/hooks/useServerSearch.js

import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Custom hook for server-side search.
 *
 * @param {string} endpoint  API path e.g. '/search'
 * @returns {{ query, setQuery, results, isLoading }}
 *
 * results.products   → array of Product objects
 * results.categories → array of Category objects
 */
export const useServerSearch = (endpoint) => {
  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState({ products: [], categories: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Clear results for short / empty queries
    if (!query || query.trim().length < 2) {
      setResults({ products: [], categories: [] });
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(endpoint, {
          params: { q: query.trim() },
        });

        const data = response.data?.data ?? {};

        // Backend returns paginated objects — extract .data array from each
        setResults({
          products:   data.products?.data   ?? [],
          categories: data.categories?.data ?? [],
        });

      } catch (error) {
        console.error('Search failed:', error);
        setResults({ products: [], categories: [] });
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce — wait 500ms after user stops typing
    const timer = setTimeout(fetchResults, 500);
    return () => clearTimeout(timer);

  }, [query, endpoint]);

  return { query, setQuery, results, isLoading };
};