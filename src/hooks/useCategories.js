// src/hooks/useCategories.js

import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../service/categoryService';

// Custom hook for fetching categories
export const useCategories = ({
    page = 1,
    per_page = 15,
    search = '',
} = {}) => {
    return useQuery({
        // Unique cache key
        queryKey: ['categories', { page, per_page, search }],

        // Fetch categories from API
        queryFn: () =>
            categoryService.getAll({
                page,
                per_page,
                search,
            }),

        // Keep data fresh for 5 minutes
        staleTime: 1000 * 60 * 5,

        // Prevent UI flicker during pagination
        keepPreviousData: true,
    });
};