"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { recipeService } from "../services/recipe-service"
import { useToast } from "./use-toast"
import type { RecipeStep, CreateRecipeStepInput, UpdateRecipeStepInput } from "@server/types/recipe-types"

/**
 * Hook for fetching recipe steps
 */
export function useRecipeSteps(recipeId: number) {
    return useQuery<RecipeStep[]>({
        queryKey: ["recipe", recipeId, "steps"],
        queryFn: () => recipeService.getSteps(recipeId),
        enabled: !!recipeId && recipeId > 0,
    })
}

/**
 * Hook for creating a recipe step
 */
export function useCreateRecipeStep() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: (data: CreateRecipeStepInput) => recipeService.createStep(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["recipe", variables.recipeId, "steps"] })
            toast({
                title: "Success",
                description: "Step added successfully",
            })
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: `Failed to add step: ${error.message}`,
                variant: "destructive",
            })
        },
    })
}

/**
 * Hook for updating a recipe step
 */
export function useUpdateRecipeStep(recipeId: number) {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateRecipeStepInput }) => recipeService.updateStep(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipe", recipeId, "steps"] })
            toast({
                title: "Success",
                description: "Step updated successfully",
            })
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: `Failed to update step: ${error.message}`,
                variant: "destructive",
            })
        },
    })
}

/**
 * Hook for deleting a recipe step
 */
export function useDeleteRecipeStep(recipeId: number) {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: (id: number) => recipeService.deleteStep(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipe", recipeId, "steps"] })
            toast({
                title: "Success",
                description: "Step deleted successfully",
            })
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: `Failed to delete step: ${error.message}`,
                variant: "destructive",
            })
        },
    })
}

/**
 * Compatibility function for RecipeStepForm
 * This provides the same API as the old hook structure
 */
export function useRecipeStepsList() {
    const useStepsList = (recipeId: number) => useRecipeSteps(recipeId)

    const useCreateStep = (onComplete?: () => void) => {
        const mutation = useCreateRecipeStep()
        const originalMutateAsync = mutation.mutateAsync

        // Wrap the mutateAsync to call onComplete
        mutation.mutateAsync = async (...args) => {
            const result = await originalMutateAsync(...args)
            if (onComplete) onComplete()
            return result
        }

        return mutation
    }

    const useUpdateStep = (recipeId: number, onComplete?: () => void) => {
        const mutation = useUpdateRecipeStep(recipeId)
        const originalMutateAsync = mutation.mutateAsync

        // Wrap the mutateAsync to call onComplete
        mutation.mutateAsync = async (...args) => {
            const result = await originalMutateAsync(...args)
            if (onComplete) onComplete()
            return result
        }

        return mutation
    }

    const useDeleteStep = (recipeId: number, onComplete?: () => void) => {
        const mutation = useDeleteRecipeStep(recipeId)
        const originalMutateAsync = mutation.mutateAsync

        // Wrap the mutateAsync to call onComplete
        mutation.mutateAsync = async (...args) => {
            const result = await originalMutateAsync(...args)
            if (onComplete) onComplete()
            return result
        }

        return mutation
    }

    return {
        useStepsList,
        useCreateStep,
        useUpdateStep,
        useDeleteStep,
    }
}