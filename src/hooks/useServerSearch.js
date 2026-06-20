// src/hooks/useServerSearch.js
import { useState, useEffect } from 'react';
// ជំនួសការ import axios ពីខាងក្រៅ មកប្រើ api instance របស់អ្នកវិញ
import api from '../api/axios';

export const useServerSearch = (endpoint) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], categories: [] }); // កំណត់ជា Object ដូចដែល Backend ផ្ញើមក
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ products: [], categories: [] });
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        // ប្រើ 'q' ឱ្យត្រូវនឹង Controller (ដូចគ្នានឹង productService.search) — មិនមែន 'query' ទេ
        // encodeURIComponent ការពារកុំឱ្យ break ពេល query មាន space ឬតួអក្សរពិសេស
        const response = await api.get(`${endpoint}?q=${encodeURIComponent(query)}`);
        setResults(response.data.data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchResults, 500);
    return () => clearTimeout(timeoutId);
  }, [query, endpoint]);

  return { query, setQuery, results, isLoading };
};