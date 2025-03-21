import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ingredientService } from "../services/ingredient-service";
import type { CreateIngredientInput, UpdateIngredientInput, IngredientFilters } from "@server/types/ingredient-types";
import { useToast } from "./use-toast";
import { convertDatesToStrings } from "../utils/date-utils";

export function useIngredientList(filters: IngredientFilters = {}) {
    return useQuery({
        queryKey: ["ingredients", filters],
        queryFn: () => ingredientService.getAll(filters)
    });
}

export function useIngredient(id: number) {
    return useQuery({
        queryKey: ["ingredient", id],
        queryFn: () => ingredientService.getById(id),
        enabled: !!id && id > 0
    });
}

export function useCreateIngredient() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: CreateIngredientInput) => {
            // Convert any Date objects to strings before sending to API
            const processedData = convertDatesToStrings(data);
            return ingredientService.create(processedData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ingredients"] });
            toast({
                title: "Success",
                description: "Ingredient created successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: `Failed to create ingredient: ${error.message}`,
                variant: "destructive"
            });
        }
    });
}

export function useUpdateIngredient() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateIngredientInput }) => {
            // Convert any Date objects to strings before sending to API
            const processedData = convertDatesToStrings(data);
            return ingredientService.update(id, processedData);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["ingredients"] });
            queryClient.invalidateQueries({ queryKey: ["ingredient", variables.id] });
            toast({
                title: "Success",
                description: "Ingredient updated successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: `Failed to update ingredient: ${error.message}`,
                variant: "destructive"
            });
        }
    });
}

export function useDeleteIngredient() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: number) => ingredientService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ingredients"] });
            toast({
                title: "Success",
                description: "Ingredient deleted successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: `Failed to delete ingredient: ${error.message}`,
                variant: "destructive"
            });
        }
    });
}
