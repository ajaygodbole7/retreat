"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { recipeService } from "../services/recipe-service"
import { useToast } from "./use-toast"
import type {
    RecipeIngredient,
    CreateRecipeIngredientInput,
    UpdateRecipeIngredientInput,
} from "@server/types/recipe-types"

/**
 * Hook for fetching recipe ingredients
 */
export function useRecipeIngredients(recipeId: number) {
    const query = useQuery<RecipeIngredient[]>({
        queryKey: ["recipe", recipeId, "ingredients"],
        queryFn: () => recipeService.getIngredients(recipeId),
        enabled: !!recipeId && recipeId > 0,
    })

    return {
        ...query,
        ingredients: query.data,
    }
}

/**
 * Hook for creating a recipe ingredient
 */
export function useCreateRecipeIngredient() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: (data: CreateRecipeIngredientInput) => recipeService.createIngredient(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["recipe", variables.recipeId, "ingredients"] })
            toast({
                title: "Success",
                description: "Ingredient added successfully",
            })
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: `Failed to add ingredient: ${error.message}`,
                variant: "destructive",
            })
        },
    })
}

/**
 * Hook for updating a recipe ingredient
 */
export function useUpdateRecipeIngredient(recipeId: number) {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateRecipeIngredientInput }) =>
            recipeService.updateIngredient(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipe", recipeId, "ingredients"] })
            toast({
                title: "Success",
                description: "Ingredient updated successfully",
            })
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: `Failed to update ingredient: ${error.message}`,
                variant: "destructive",
            })
        },
    })
}

/**
 * Hook for deleting a recipe ingredient
 */
export function useDeleteRecipeIngredient(recipeId: number) {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: (id: number) => recipeService.deleteIngredient(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipe", recipeId, "ingredients"] })
            toast({
                title: "Success",
                description: "Ingredient deleted successfully",
            })
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: `Failed to delete ingredient: ${error.message}`,
                variant: "destructive",
            })
        },
    })
}

/**
 * Compatibility function for RecipeIngredientForm
 * This provides the same API as the old hook structure
 */
export function useRecipeIngredientsList() {
    return {
        useIngredientsList: (recipeId: number) => {
            return useRecipeIngredients(recipeId)
        },
        useCreateIngredient: (onComplete?: () => void) => {
            const mutation = useCreateRecipeIngredient()
            const originalMutateAsync = mutation.mutateAsync

            // Wrap the mutateAsync to call onComplete
            mutation.mutateAsync = async (...args) => {
                const result = await originalMutateAsync(...args)
                if (onComplete) onComplete()
                return result
            }

            return mutation
        },
        useUpdateIngredient: (recipeId: number, onComplete?: () => void) => {
            const mutation = useUpdateRecipeIngredient(recipeId)
            const originalMutateAsync = mutation.mutateAsync

            // Wrap the mutateAsync to call onComplete
            mutation.mutateAsync = async (...args) => {
                const result = await originalMutateAsync(...args)
                if (onComplete) onComplete()
                return result
            }

            return mutation
        },
        useDeleteIngredient: (recipeId: number, onComplete?: () => void) => {
            const mutation = useDeleteRecipeIngredient(recipeId)
            const originalMutateAsync = mutation.mutateAsync

            // Wrap the mutateAsync to call onComplete
            mutation.mutateAsync = async (...args) => {
                const result = await originalMutateAsync(...args)
                if (onComplete) onComplete()
                return result
            }

            return mutation
        },
    }
}