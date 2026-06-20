import { useQuery } from '@tanstack/react-query';
// Import the object exported from your service file
import { productService } from '../service/productService';

export const useProducts = () => {
    return useQuery({
        queryKey: ['products'],
        // Access the function through the object
        queryFn: productService.getAll,
        staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: true,
    });
};