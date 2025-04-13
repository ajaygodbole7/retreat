// src/services/scheduled-meal-service.ts
import { scheduledMealApi } from "../lib/api";
import { parseStringsToDates } from "../utils/date-utils";

// Import backend types
import type {
    ScheduledMeal, CreateScheduledMealInput, UpdateScheduledMealInput
} from '@server/types/event-types';

export const scheduledMealService = {
    /** Create a new scheduled meal */
    async create(dayId: number, mealData: CreateScheduledMealInput): Promise<ScheduledMeal> {
        try {
            console.log(`Creating scheduled meal for day ${ dayId } with data:`, mealData);
            const data = await scheduledMealApi.create(dayId, mealData);
            console.log(`API response for create meal:`, data);

            return parseStringsToDates(data) as ScheduledMeal;
        } catch (error) {
            console.error(`Error creating scheduled meal for day ${ dayId }:`, error);
            throw error;
        }
    },

    /** Update an existing scheduled meal */
    async update(mealId: number, mealData: UpdateScheduledMealInput): Promise<ScheduledMeal> {
        try {
            console.log(`Updating scheduled meal ${ mealId } with data:`, mealData);
            const data = await scheduledMealApi.update(mealId, mealData);
            console.log(`API response for update meal:`, data);
            return parseStringsToDates(data) as ScheduledMeal;
        } catch (error) {
            console.error(`Error updating scheduled meal ${ mealId }:`, error);
            throw error;
        }
    },

    /** Delete a scheduled meal */
    async delete(mealId: number): Promise<boolean> {
        try {
            console.log(`Deleting scheduled meal ${ mealId }`);
            const result = await scheduledMealApi.delete(mealId);
            console.log(`API response for delete meal:`, result);
            return result;
        } catch (error) {
            console.error(`Error deleting scheduled meal ${ mealId }:`, error);
            throw error;
        }
    },

    /** 
     * Get all scheduled meals for a day
     * This should align with the API endpoint format /events/days/${dayId}/meals
     */
    async getAllForDay(dayId: number): Promise<ScheduledMeal[]> {
        try {
            if (!dayId || dayId <= 0) {
                console.warn(`Invalid dayId: ${ dayId }, returning empty array`);
                return [];
            }

            console.log(`Fetching all scheduled meals for day ${ dayId }`);
            // Make sure this matches the API test script endpoint
            const data = await scheduledMealApi.getAllForDay(dayId);
            console.log(`API response for get all meals for day ${ dayId }:`, data);

            // Critical fix: Make sure we properly handle potential null/undefined/empty response
            if (!data) {
                console.warn(`No data returned for day ${ dayId } meals`);
                return [];
            }

            // Ensure we're processing an array
            const mealsArray = Array.isArray(data) ? data : [data];

            // Apply date parsing and return
            return parseStringsToDates(mealsArray) as ScheduledMeal[];
        } catch (error) {
            console.error(`Error getting scheduled meals for day ${ dayId }:`, error);
            throw error;
        }
    }
};