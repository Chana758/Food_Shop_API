import { useState, useEffect, useCallback } from 'react';
import favoriteService from '../service/favoriteService';

const useFavorite = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Fetch favorites
  const fetchFavorites = useCallback(async () => {
    // ✅ Fix: ប្តូរពី localStorage មក sessionStorage
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
      // Not logged in — use localStorage for guest favorites
      setFavorites(JSON.parse(localStorage.getItem('favorites') || '[]'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await favoriteService.getAll();
      // data = [{ id, product: {...} }] — extract products
      const products = data.map(f => f.product ?? f);
      setFavorites(products);
    } catch (err) {
      console.error('Failed to fetch favorites:', err.response ?? err);
      setError('Failed to load favorites.');
      // Fallback to localStorage
      setFavorites(JSON.parse(localStorage.getItem('favorites') || '[]'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
    window.addEventListener('favoritesUpdated', fetchFavorites);
    return () => window.removeEventListener('favoritesUpdated', fetchFavorites);
  }, [fetchFavorites]);

  // Check if product is favorite
  const isFavorite = (productId) => favorites.some(f => f.id === productId);

  // Toggle favorite
  const toggleFavorite = async (item, navigateFn) => {
    // ✅ Fix: ប្តូរពី localStorage មក sessionStorage
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) { navigateFn?.('/login'); return; }

    const alreadyFav = isFavorite(item.id);

    // Optimistic update
    setFavorites(prev =>
      alreadyFav
        ? prev.filter(f => f.id !== item.id)
        : [...prev, item]
    );

    try {
      if (alreadyFav) {
        await favoriteService.remove(item.id);
      } else {
        await favoriteService.add(item.id);
      }
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (err) {
      console.error('Toggle favorite failed:', err.response ?? err);
      // Revert on error
      setFavorites(prev =>
        alreadyFav ? [...prev, item] : prev.filter(f => f.id !== item.id)
      );
    }
  };

  return {
    favorites,
    loading,
    error,
    isFavorite,
    toggleFavorite,
    fetchFavorites,
  };
};

export default useFavorite;