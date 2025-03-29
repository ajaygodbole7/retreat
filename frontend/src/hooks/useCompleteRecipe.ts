"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { recipeService } from "../services/recipe-service"
import { useToast } from "./use-toast"
import type { CreateRecipeInput, UpdateRecipeInput } from "@server/types/recipe-types"
import type { CreateRecipeIngredientInput, UpdateRecipeIngredientInput } from "@server/types/recipe-types"
import type { CreateRecipeStepInput, UpdateRecipeStepInput } from "@server/types/recipe-types"

// Type for creating a complete recipe
interface CreateCompleteRecipeInput {
    recipe: CreateRecipeInput
    ingredients?: Omit<CreateRecipeIngredientInput, "recipeId">[]
    steps?: Omit<CreateRecipeStepInput, "recipeId">[]
}

// Type for updating a complete recipe
interface UpdateCompleteRecipeInput {
    recipe: UpdateRecipeInput
    ingredients?: (Omit<UpdateRecipeIngredientInput, "recipeId"> & { id?: number; ingredientId: number })[]
    steps?: (Omit<UpdateRecipeStepInput, "recipeId"> & { id?: number; stepNumber: number; instruction: string })[]
}

/**
 * Hook for creating a complete recipe with ingredients and steps in one operation
 */
export function useCreateCompleteRecipe() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: (data: CreateCompleteRecipeInput) => recipeService.createComplete(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] })
            queryClient.invalidateQueries({ queryKey: ["recipe", data.id] })
            toast({
                title: "Success",
                description: "Recipe created successfully with all ingredients and steps",
            })
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: `Failed to create recipe: ${error.message}`,
                variant: "destructive",
            })
        },
    })
}

/**
 * Hook for updating a complete recipe with ingredients and steps in one operation
 */
export function useUpdateCompleteRecipe() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCompleteRecipeInput }) =>
            recipeService.updateComplete(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] })
            queryClient.invalidateQueries({ queryKey: ["recipe", data.id] })
            toast({
                title: "Success",
                description: "Recipe updated successfully with all ingredients and steps",
            })
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: `Failed to update recipe: ${error.message}`,
                variant: "destructive",
            })
        },
    })
}