// src/hooks/useIngredientMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientApi } from "../lib/api";

/**
 * A custom hook for creating or updating ingredients
 * 
 * @param isEditing - Whether we're editing an existing ingredient or creating a new one
 * @param ingredientId - The ID of the ingredient being edited (only needed when isEditing is true)
 * @param onSuccess - Optional callback to run after successful mutation
 * @returns A mutation object from React Query
 */
export const useIngredientMutation = (
    isEditing: boolean,
    ingredientId?: number,
    onSuccess?: (data: any) => void
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values: any) => {
            console.log("Submitting form with values:", values);

            if (isEditing && ingredientId) {
                return ingredientApi.update(ingredientId, values);
            } else {
                return ingredientApi.create(values);
            }
        },
        onSuccess: (data) => {
            console.log("Mutation succeeded with data:", data);
            // Invalidate the ingredients list query to refresh data
            queryClient.invalidateQueries({ queryKey: ["ingredients"] });

            // Call the onSuccess callback if provided
            if (onSuccess) {
                onSuccess(data);
            }
        },
        onError: (error) => {
            console.error("Mutation failed with error:", error);
        }
    });
};