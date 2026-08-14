import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';


const FALLBACK = { delivery_fee: 2.00, free_delivery_threshold: 20.00 };

let cached = null; // module-level cache — fetched once per page load

const usePricing = () => {
  const [pricing, setPricing] = useState(cached ?? FALLBACK);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) return;

    let alive = true;
    axiosInstance.get('/pricing')
      .then((res) => {
        if (!alive) return;
        const data = res.data?.data;
        if (data?.delivery_fee != null && data?.free_delivery_threshold != null) {
          cached = data;
          setPricing(data);
        }
      })
      .catch((err) => {
        console.warn('usePricing: failed to fetch, using fallback values.', err);
      })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, []);

  return { ...pricing, loading };
};

export default usePricing;