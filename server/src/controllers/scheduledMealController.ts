import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { createScheduledMealSchema, updateScheduledMealSchema, scheduledMealRecipeSchema } from '../schemas/scheduledMealSchemas';
import { HttpStatus } from '../constants/httpStatus';
import { parseBody, parseIdParam } from '../utils/validateRequestUtils';
import { addCreationTracking, addUpdateTracking, getCurrentUserId } from '../utils/whoUtils';
//import { MealType } from '@prisma/client';

// Helper to combine Date (from EventDay) and Time string (from input) into a DateTime for Prisma
// Note: Assumes timeString is HH:MM or HH:MM:SS. Uses UTC for consistency.
function combineDateAndTime(datePart: Date, timeString: string): Date {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    // Create a new Date object from the date part to avoid modifying the original
    const dateTime = new Date(datePart.toISOString().split('T')[0] + 'T00:00:00Z'); // Get date part in UTC
    dateTime.setUTCHours(hours || 0, minutes || 0, seconds || 0, 0);
    return dateTime;
}

// Get all meals for a specific EventDay
export const getMealsForEventDay = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dayId = parseIdParam(req, 'dayId');
        // Ensure day exists
        const dayExists = await prisma.eventDay.findUnique({ where: { id: dayId }, select: { id: true } });
        if (!dayExists) throw new AppError('Event day not found', HttpStatus.NOT_FOUND);

        // Read operation
        const meals = await prisma.scheduledMeal.findMany({
            where: { dayId: dayId },
            orderBy: { time: 'asc' },
            include: {
                menu: { select: { id: true, name: true } },
                scheduledMealRecipes: {
                    include: { recipe: { select: { id: true, name: true } } },
                    orderBy: { recipe: { name: 'asc' } }
                }
            }
        });
        res.status(HttpStatus.OK).json(meals);
    } catch (error) { next(error); }
};

// Create a new ScheduledMeal for an EventDay
export const createMealForEventDay = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dayId = parseIdParam(req, 'dayId');
        const data = parseBody(req, createScheduledMealSchema);
        const userId = getCurrentUserId(req);
        const trackedData = addCreationTracking(data, userId);

        // ** Use transaction **
        const newMeal = await prisma.$transaction(async (tx) => {
            const day = await tx.eventDay.findUnique({ where: { id: dayId }, select: { id: true, date: true } });
            if (!day) throw new AppError('Event day not found', HttpStatus.NOT_FOUND);

            if (trackedData.menuId) {
                const menuExists = await tx.menu.findUnique({ where: { id: trackedData.menuId }, select: { id: true } });
                if (!menuExists) throw new AppError('Selected Menu template not found', HttpStatus.BAD_REQUEST);
            }

            const mealDateTime = combineDateAndTime(day.date, trackedData.time); // Convert time string

            return tx.scheduledMeal.create({
                data: {
                    dayId: dayId,
                    time: mealDateTime, // Store as DateTime (Prisma maps to Time)
                    mealType: trackedData.mealType,
                    attendeeHeadcount: trackedData.attendeeHeadcount,
                    volunteerHeadcount: trackedData.volunteerHeadcount,
                    menuId: trackedData.menuId,
                    notes: trackedData.notes,
                    createdBy: trackedData.createdBy,
                    lastUpdatedBy: trackedData.lastUpdatedBy,
                },
                include: { menu: true }
            });
        });
        res.status(HttpStatus.CREATED).json(newMeal);
    } catch (error) { next(error); }
};

// Update an existing ScheduledMeal
export const updateMeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const mealId = parseIdParam(req, 'mealId');
        const data = parseBody(req, updateScheduledMealSchema);
        const userId = getCurrentUserId(req);
        const trackedData = addUpdateTracking(data, userId);

        // ** Use transaction **
        const updatedMeal = await prisma.$transaction(async (tx) => {
            const existingMeal = await tx.scheduledMeal.findUnique({ where: { id: mealId }, include: { day: { select: { date: true } } } });
            if (!existingMeal) throw new AppError('Scheduled meal not found', HttpStatus.NOT_FOUND);
            if (!existingMeal.day) throw new AppError('Internal Error: Meal has no associated day.', HttpStatus.INTERNAL_SERVER_ERROR);

            // Prepare payload, converting time if necessary
            const updatePayload: any = { ...trackedData };
            if (trackedData.time) {
                updatePayload.time = combineDateAndTime(existingMeal.day.date, trackedData.time);
            }
            if (trackedData.menuId) { // Also check menu existence if ID provided
                const menuExists = await tx.menu.findUnique({ where: { id: trackedData.menuId }, select: { id: true } });
                if (!menuExists) throw new AppError('Selected Menu template not found', HttpStatus.BAD_REQUEST);
            } else if (trackedData.menuId === null) { // Explicitly setting menu to null
                updatePayload.menuId = null;
            }


            return tx.scheduledMeal.update({
                where: { id: mealId },
                data: updatePayload,
                include: { menu: { select: { id: true, name: true } }, scheduledMealRecipes: { include: { recipe: { select: { id: true, name: true } } } } }
            });
        });
        res.status(HttpStatus.OK).json(updatedMeal);
    } catch (error) { if (error instanceof AppError) { next(error); } else if ((error as any)?.code === 'P2025') { next(new AppError('Scheduled meal not found', HttpStatus.NOT_FOUND)); } else { next(error); } }
};

// Delete a ScheduledMeal
export const deleteMeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const mealId = parseIdParam(req, 'mealId');
        // ** Use transaction **
        await prisma.$transaction(async (tx) => {
            const existing = await tx.scheduledMeal.findUnique({ where: { id: mealId }, select: { id: true } });
            if (!existing) throw new AppError('Scheduled meal not found', HttpStatus.NOT_FOUND);
            // Cascade delete handles ScheduledMealRecipes
            await tx.scheduledMeal.delete({ where: { id: mealId } });
        });
        res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) { if (error instanceof AppError) { next(error); } else if ((error as any)?.code === 'P2025') { next(new AppError('Scheduled meal not found', HttpStatus.NOT_FOUND)); } else { next(error); } }
};

// --- ScheduledMealRecipe ---
export const addRecipeToScheduledMeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const mealId = parseIdParam(req, 'mealId');
        const data = parseBody(req, scheduledMealRecipeSchema);
        // const userId = getCurrentUserId(req); // Optional: track who added recipe to meal

        // ** Use transaction **
        const newItem = await prisma.$transaction(async (tx) => {
            const [mealExists, recipeExists] = await Promise.all([
                tx.scheduledMeal.findUnique({ where: { id: mealId }, select: { id: true } }),
                tx.recipe.findUnique({ where: { id: data.recipeId }, select: { id: true } })
            ]);
            if (!mealExists) throw new AppError('Scheduled meal not found', HttpStatus.NOT_FOUND);
            if (!recipeExists) throw new AppError('Recipe not found', HttpStatus.NOT_FOUND);

            return tx.scheduledMealRecipe.create({
                data: { scheduledMealId: mealId, recipeId: data.recipeId }
            });
        });
        res.status(HttpStatus.CREATED).json(newItem);
    } catch (error) { if ((error as any)?.code === 'P2002') { next(new AppError('Recipe already exists for this meal.', HttpStatus.CONFLICT)); } else { next(error); } }
};

export const removeRecipeFromScheduledMeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const mealId = parseIdParam(req, 'mealId');
        const recipeId = parseIdParam(req, 'recipeId');

        // ** Use transaction **
        await prisma.$transaction(async (tx) => {
            await tx.scheduledMealRecipe.delete({
                where: { scheduledMealId_recipeId: { scheduledMealId: mealId, recipeId: recipeId } }
            });
        });
        res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) { if ((error as any)?.code === 'P2025') { next(new AppError('Recipe link not found for this meal.', HttpStatus.NOT_FOUND)); } else { next(error); } }
};