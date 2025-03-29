"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { recipeService } from "../services/recipe-service"
import { useToast } from "./use-toast"
import type { Recipe, CreateRecipeInput, UpdateRecipeInput, RecipeFilters } from "@server/types/recipe-types"

/**
 * Hook for fetching a list of recipes with optional filters
 */
export function useRecipeList(filters: RecipeFilters = {}) {
    console.log("useRecipeList hook called with filters:", filters)
    return useQuery<Recipe[]>({
        queryKey: ["recipes", filters],
        queryFn: () => recipeService.getAll(filters),
    })
}

/**
 * Hook for fetching a single recipe by ID
 */
export function useRecipe(id: number, options = {}) {
    // Add debugging logs
    console.log("useRecipe hook called with ID:", id)

    return useQuery<Recipe>({
        queryKey: ["recipe", id],
        queryFn: () => recipeService.getById(id),
        enabled: !!id && id > 0 && !isNaN(id),
        ...options,
    })
}

/**
 * Hook for scaling a recipe to a target serving size
 */
export function useScaleRecipe(id: number, targetServingSize: number) {
    console.log("useScaleRecipe hook called with ID:", id, "and target serving size:", targetServingSize)
    return useQuery<Recipe>({
        queryKey: ["recipe", id, "scale", targetServingSize],
        queryFn: () => recipeService.scale(id, targetServingSize),
        enabled: !!id && id > 0 && targetServingSize > 0,
    })
}

/**
 * Hook for creating a new recipe
 */
export function useCreateRecipe() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: (data: CreateRecipeInput) => recipeService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] })
            toast({
                title: "Success",
                description: "Recipe created successfully",
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
 * Hook for updating an existing recipe
 */
export function useUpdateRecipe() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateRecipeInput }) => recipeService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] })
            queryClient.invalidateQueries({ queryKey: ["recipe", variables.id] })
            toast({
                title: "Success",
                description: "Recipe updated successfully",
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

/**
 * Hook for deleting a recipe
 */
export function useDeleteRecipe() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: (id: number) => recipeService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] })
            toast({
                title: "Success",
                description: "Recipe deleted successfully",
            })
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: `Failed to delete recipe: ${error.message}`,
                variant: "destructive",
            })
        },
    })
}

/**
 * Hook for creating a complete recipe with ingredients and steps
 */
export function useCreateCompleteRecipe() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: (data: any) => recipeService.createComplete(data),
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
 * Hook for updating a complete recipe with ingredients and steps
 */
export function useUpdateCompleteRecipe() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => recipeService.updateComplete(id, data),
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