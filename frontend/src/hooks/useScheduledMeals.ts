// src/hooks/useScheduledMeals.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { scheduledMealApi } from "../lib/api";
import { useToast } from "./use-toast";
import { parseStringsToDates } from "../utils/date-utils";
import type {
    ScheduledMeal, CreateScheduledMealInput, UpdateScheduledMealInput,
    ScheduledMealRecipe, // Keep this
    Menu // Keep this
} from '@server/types/event-types';
import type { Recipe } from "@server/types/recipe-types"; // Keep this

// Define more specific type for query results
type ScheduledMealWithRelations = ScheduledMeal & {
    menu?: Menu | null;
    scheduledMealRecipes?: (ScheduledMealRecipe & { recipe?: Recipe })[];
    // No scheduledMealConsumables relation expected here
};

// --- Hooks for Meal Slot ---
export function useCreateScheduledMeal(eventId: number) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation<ScheduledMeal, Error, { dayId: number; data: CreateScheduledMealInput }>({
        mutationFn: async ({ dayId, data }) => {
            console.log("Creating scheduled meal for day:", dayId, "with data:", data);
            const result = await scheduledMealApi.create(dayId, data);
            return parseStringsToDates(result); // Keep date parsing
        },
        onSuccess: (newMeal, variables) => {
            console.log("Successfully created meal:", newMeal);
            const dayId = variables.dayId;
            // Invalidate relevant queries to refetch data
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
            queryClient.invalidateQueries({ queryKey: ["scheduledMeals", dayId] });
            toast({ title: "Success", description: "Meal scheduled." });
        },
        onError: (error: Error) => {
            console.error("Error creating meal:", error);
            toast({
                title: "Error",
                description: `Failed to schedule meal: ${ error.message }`,
                variant: "destructive"
            });
        },
    });
}

export function useUpdateScheduledMeal(eventId: number) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation<ScheduledMeal, Error, { mealId: number; data: UpdateScheduledMealInput }>({
        mutationFn: async ({ mealId, data }) => {
            console.log("Updating scheduled meal:", mealId, "with data:", data);
            const result = await scheduledMealApi.update(mealId, data);
            return parseStringsToDates(result); // Keep date parsing
        },
        onSuccess: (updatedMeal) => {
            console.log("Successfully updated meal:", updatedMeal);
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
            if (updatedMeal.dayId) {
                queryClient.invalidateQueries({ queryKey: ["scheduledMeals", updatedMeal.dayId] });
            } else {
                // Fallback if dayId isn't directly available on the response
                console.warn("dayId not found on updatedMeal response, invalidating all scheduledMeals");
                queryClient.invalidateQueries({ queryKey: ["scheduledMeals"] });
            }
            toast({ title: "Success", description: "Meal updated." });
        },
        onError: (error: Error) => {
            console.error("Error updating meal:", error);
            toast({
                title: "Error",
                description: `Failed to update meal: ${ error.message }`,
                variant: "destructive"
            });
        },
    });
}

export function useDeleteScheduledMeal(eventId: number) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation<boolean, Error, { mealId: number; dayId: number }>({
        mutationFn: ({ mealId }) => scheduledMealApi.delete(mealId),
        onSuccess: (_, variables) => {
            console.log("Successfully deleted meal:", variables.mealId, "from day:", variables.dayId);
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
            queryClient.invalidateQueries({ queryKey: ["scheduledMeals", variables.dayId] });
            toast({ title: "Success", description: "Meal deleted." });
        },
        onError: (error: Error) => {
            console.error("Error deleting meal:", error);
            toast({
                title: "Error",
                description: `Failed to delete meal: ${ error.message }`,
                variant: "destructive"
            });
        },
    });
}

// --- Hook for fetching meals ---
export function useScheduledMealsForDay(dayId: number, enabled = true) {
    // Use the specific type for query results
    return useQuery<ScheduledMealWithRelations[]>({
        queryKey: ["scheduledMeals", dayId],
        queryFn: async () => {
            console.log(`Fetching scheduled meals for day: ${ dayId }`);
            if (!dayId || dayId <= 0) {
                console.warn(`Invalid dayId in useScheduledMealsForDay: ${ dayId }, returning empty array.`);
                return [];
            }
            try {
                // Assume API returns the correct shape including recipes
                const meals = await scheduledMealApi.getAllForDay(dayId) as ScheduledMealWithRelations[];
                console.log(`Received ${ meals.length } meals for day ${ dayId }:`, meals);
                // Parse dates recursively, excluding the 'time' field
                return parseStringsToDates(meals || [], ['time']);
            } catch (error) {
                console.error(`Error fetching meals for day ${ dayId }:`, error);
                throw error;
            }
        },
        enabled: enabled && !!dayId && dayId > 0,
        staleTime: 1000 * 5, // Reduced stale time
        refetchOnMount: true,
        refetchOnWindowFocus: true
    });
}

// --- Meal Recipe Hooks (Keep these) ---
export function useAddRecipeToMeal(eventId: number, dayId: number) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation<ScheduledMealRecipe, Error, { mealId: number; data: { recipeId: number; notes?: string } }>({
        mutationFn: ({ mealId, data }) => scheduledMealApi.addRecipeToMeal(mealId, data),
        onSuccess: (_, variables) => {
            // Invalidate only the meals for the specific day
            queryClient.invalidateQueries({ queryKey: ["scheduledMeals", dayId] });
            toast({ title: "Success", description: "Recipe added to meal." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: `Failed to add recipe: ${ error.message }`, variant: "destructive" });
        },
    });
}
export function useRemoveRecipeFromMeal(eventId: number, dayId: number) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation<boolean, Error, { mealId: number; recipeId: number }>({
        mutationFn: ({ mealId, recipeId }) => scheduledMealApi.removeRecipeFromMeal(mealId, recipeId),
        onSuccess: (_, variables) => {
            // Invalidate only the meals for the specific day
            queryClient.invalidateQueries({ queryKey: ["scheduledMeals", dayId] });
            toast({ title: "Success", description: "Recipe removed from meal." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: `Failed to remove recipe: ${ error.message }`, variant: "destructive" });
        },
    });
}