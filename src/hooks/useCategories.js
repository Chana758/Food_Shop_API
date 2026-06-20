import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../service/categoryService'; // Import Object ទាំងមូល

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getAll, // ហៅ method 'getAll' ដែលមានក្នុង Object
        staleTime: 1000 * 60 * 5,
    });
};