import { useState, useEffect, useCallback, useMemo } from 'react';
import { reviewService } from '../service/reviewService';

// ======================================
// Public — reviews តាម product
// ======================================
export const useProductReviews = (productId) => {
  const [reviews, setReviews]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await reviewService.getByProduct(productId);
      // ✅ FIXED — controller returns { status, data: <laravel paginator> }.
      // There is no separate "stats" object from the backend; we compute
      // rating stats client-side from the returned page below.
      const paginator = res?.data?.data ?? null;
      setReviews(Array.isArray(paginator?.data) ? paginator.data : []);
    } catch (err) {
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // ✅ NEW — average rating / count / distribution computed from the
  // loaded reviews, since the backend doesn't provide this yet.
  // Note: this only reflects the currently loaded page, not every review
  // ever made for the product, unless per_page is set high enough.
  const stats = useMemo(() => {
    if (!reviews.length) return { average: 0, count: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach(r => {
      const rating = Number(r.rating) || 0;
      sum += rating;
      if (distribution[rating] !== undefined) distribution[rating] += 1;
    });

    return {
      average: Number((sum / reviews.length).toFixed(1)),
      count: reviews.length,
      distribution,
    };
  }, [reviews]);

  return { reviews, stats, loading, error, refetch: fetchReviews };
};

// ======================================
// Customer — សរសេរ / កែ / លុប review
// ======================================
export const useReview = () => {
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const fetchMyReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reviewService.getMyReviews();
      // ✅ FIXED — unwrap { status, data: <paginator> } → paginator.data (array)
      const paginator = res?.data?.data ?? null;
      setMyReviews(Array.isArray(paginator?.data) ? paginator.data : []);
    } catch (err) {
      setError('Failed to load your reviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMyReviews(); }, [fetchMyReviews]);

  const createReview = async (data) => {
    const res = await reviewService.create(data);
    // ✅ FIXED — controller returns { status, message, data: <review> }
    const review = res?.data?.data ?? null;
    if (review) setMyReviews(prev => [review, ...prev]);
    return review;
  };

  const updateReview = async (id, data) => {
    const res = await reviewService.update(id, data);
    const updated = res?.data?.data ?? null;
    if (updated) {
      setMyReviews(prev => prev.map(r => r.id === id ? updated : r));
    }
    return updated;
  };

  const deleteReview = async (id) => {
    await reviewService.delete(id);
    setMyReviews(prev => prev.filter(r => r.id !== id));
  };

  return {
    myReviews,
    loading,
    error,
    refetch: fetchMyReviews,
    createReview,
    updateReview,
    deleteReview,
  };
};

// ======================================
// Admin + Staff version
// ======================================
export const useAdminReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchReviews = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await reviewService.getAll(params);
      // res.data.data was the paginator object itself, not an
      // array. The actual rows are one level deeper, at .data.data.data
      const paginator = res?.data?.data ?? null;
      setReviews(Array.isArray(paginator?.data) ? paginator.data : []);
    } catch (err) {
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const approveReview = async (id) => {
    await reviewService.approve(id); // ✅ FIXED — now hits the real /status endpoint
    setReviews(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'approved' } : r)
    );
  };

  const rejectReview = async (id) => {
    await reviewService.reject(id); // ✅ FIXED — now hits the real /status endpoint
    setReviews(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r)
    );
  };

  const deleteReview = async (id) => {
    await reviewService.adminDelete(id);
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
    approveReview,
    rejectReview,
    deleteReview,
  };
};