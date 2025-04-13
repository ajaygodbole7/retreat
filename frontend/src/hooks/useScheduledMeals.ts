// src/hooks/useScheduledMeals.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { scheduledMealApi } from "../lib/api";
import { useToast } from "./use-toast";
import { parseStringsToDates } from "../utils/date-utils";
import type {
    ScheduledMeal, CreateScheduledMealInput, UpdateScheduledMealInput
} from '@server/types/event-types';

/** Hook for creating a scheduled meal */
export function useCreateScheduledMeal(eventId: number) {
    const queryClient = useQueryClient(); // Get query client instance
    const { toast } = useToast();
    return useMutation<ScheduledMeal, Error, { dayId: number; data: CreateScheduledMealInput }>({
        mutationFn: async ({ dayId, data }) => {
            console.log("Creating scheduled meal for day:", dayId, "with data:", data);
            const result = await scheduledMealApi.create(dayId, data);
            return parseStringsToDates(result);
        },
        onSuccess: (newMeal, variables) => {
            console.log("Successfully created meal:", newMeal);
            const dayId = variables.dayId;
            // Invalidate both parent event and specific day's meals
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
            queryClient.invalidateQueries({ queryKey: ["scheduledMeals", dayId] });
            toast({ title: "Success", description: "Meal scheduled." });
            // Note: Removed force refetch with setTimeout, rely on TanStack Query's automatic refetching
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

/** Hook for updating a scheduled meal */
export function useUpdateScheduledMeal(eventId: number) {
    const queryClient = useQueryClient(); // Get query client instance
    const { toast } = useToast();
    return useMutation<ScheduledMeal, Error, { mealId: number; data: UpdateScheduledMealInput }>({
        mutationFn: async ({ mealId, data }) => {
            console.log("Updating scheduled meal:", mealId, "with data:", data);
            const result = await scheduledMealApi.update(mealId, data);
            return parseStringsToDates(result);
        },
        onSuccess: (updatedMeal) => {
            console.log("Successfully updated meal:", updatedMeal);
            // Invalidate both the parent event and the specific day's meals
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
            // Invalidate with the correct dayId (eventDayId from backend type)
            if (updatedMeal.dayId) { // Use dayId (frontend context) or eventDayId (backend) if available
                queryClient.invalidateQueries({ queryKey: ["scheduledMeals", updatedMeal.dayId] });
            } else {
                // Fallback if dayId isn't directly available on the response
                console.warn("dayId not found on updatedMeal response, invalidating all scheduledMeals");
                queryClient.invalidateQueries({ queryKey: ["scheduledMeals"] });
            }
            toast({ title: "Success", description: "Meal updated." });
            // Note: Removed force refetch with setTimeout
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

/** Hook for deleting a scheduled meal */
export function useDeleteScheduledMeal(eventId: number) {
    const queryClient = useQueryClient(); // Get query client instance
    const { toast } = useToast();
    return useMutation<boolean, Error, { mealId: number; dayId: number }>({
        mutationFn: ({ mealId }) => scheduledMealApi.delete(mealId),
        onSuccess: (_, variables) => {
            console.log("Successfully deleted meal:", variables.mealId, "from day:", variables.dayId);
            // Invalidate the parent event query
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
            // Invalidate the specific day's meals query
            queryClient.invalidateQueries({ queryKey: ["scheduledMeals", variables.dayId] });
            toast({ title: "Success", description: "Meal deleted." });
            // Note: Removed force refetch with setTimeout
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

/** Hook for fetching all scheduled meals for a specific day */
export function useScheduledMealsForDay(dayId: number, enabled = true) {
    return useQuery<ScheduledMeal[]>({
        queryKey: ["scheduledMeals", dayId],
        queryFn: async () => {
            console.log(`Fetching scheduled meals for day: ${ dayId }`);
            if (!dayId || dayId <= 0) {
                console.warn(`Invalid dayId in useScheduledMealsForDay: ${ dayId }`);
                return [];
            }
            try {
                const meals = await scheduledMealApi.getAllForDay(dayId);
                console.log(`Received ${ meals.length } meals for day ${ dayId }:`, meals);
                // Parse dates, excluding the 'time' field as it should be treated as a string
                return parseStringsToDates(meals || [], ['time']);
            } catch (error) {
                console.error(`Error fetching meals for day ${ dayId }:`, error);
                throw error;
            }
        },
        enabled: enabled && !!dayId && dayId > 0,
        // Keep staleTime and refetch options as they are good for ensuring data freshness
        staleTime: 1000 * 15, // 15 seconds
        refetchOnMount: true,
        refetchOnWindowFocus: true
    });
}