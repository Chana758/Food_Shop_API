import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productService } from '../service/productService';

// Products query hook (supports pagination, search, category filter)
export const useProducts = ({
    page = 1,
    per_page = 15,
    search = '',
    category_slug = '',
} = {}) => {
    return useQuery({
        // Cache key depends on filters
        queryKey: ['products', { page, per_page, search, category_slug }],

        // Fetch products from API
        queryFn: () =>
            productService.getAll({
                page,
                per_page,
                search,
                category_slug,
            }),

        // Short cache time to keep data fresh
        staleTime: 30 * 1000,

        // Keep previous data while fetching new page (smooth UI)
        placeholderData: keepPreviousData,

        // Prevent refetch when switching tabs
        refetchOnWindowFocus: false,
    });
};