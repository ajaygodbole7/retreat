import { useQuery } from "@tanstack/react-query";
import { ingredientService } from "../services/ingredient-service";

export function useCategoryList() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: () => ingredientService.getCategories()
    });
}

export function useCategory(id: number) {
    return useQuery({
        queryKey: ["category", id],
        queryFn: () => ingredientService.getCategoryById(id),
        enabled: !!id && id > 0
    });
}

export function useSubcategories(categoryId: number) {
    return useQuery({
        queryKey: ["subcategories", categoryId],
        queryFn: () => ingredientService.getSubcategories(categoryId),
        enabled: !!categoryId && categoryId > 0
    });
}
