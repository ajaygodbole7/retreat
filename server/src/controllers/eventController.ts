// server/src/controllers/eventController.ts
import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { HttpStatus } from '../constants/httpStatus';
import { parseBody, parseIdParam } from '../utils/validateRequestUtils';
import { addCreationTracking, addUpdateTracking, getCurrentUserId } from '../utils/whoUtils';
import {
    createEventSchema,
    updateEventSchema,
    createEventDaySchema,
    updateEventDaySchema,
    eventDayConsumableSchema,
    updateEventDayConsumableSchema
} from '../schemas/eventSchemas';

// --- Event CRUD ---

export const getAllEvents = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        // Read operation, transaction not needed
        const events = await prisma.event.findMany({
            orderBy: { eventStartDate: 'desc' }, // Correct field name
            include: { _count: { select: { days: true } } }
        });
        res.status(HttpStatus.OK).json(events);
    } catch (error) { next(error); }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const eventId = parseIdParam(req, 'eventId');
        // Read operation, transaction usually not needed
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                days: {
                    orderBy: { dayNumber: 'asc' },
                    include: {
                        _count: { select: { scheduledMeals: true, consumables: true } },
                        consumables: {
                            include: {
                                ingredient: { select: { id: true, name: true } },
                                unit: { select: { id: true, abbreviation: true } }
                            }, // Select needed fields
                            orderBy: { ingredient: { name: 'asc' } }
                        }
                    }
                }
            }
        });
        if (!event) throw new AppError('Event not found', HttpStatus.NOT_FOUND);
        res.status(HttpStatus.OK).json(event);
    } catch (error) { next(error); }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = parseBody(req, createEventSchema);
        const userId = getCurrentUserId(req);
        const trackedData = addCreationTracking(data, userId);

        const newEvent = await prisma.$transaction(async (tx) => {
            // Name uniqueness is handled by DB constraint P2002
            return tx.event.create({
                data: {
                    ...trackedData,
                    // Ensure Date objects if Zod doesn't guarantee it (coerce should)
                    eventStartDate: new Date(trackedData.eventStartDate),
                    eventEndDate: new Date(trackedData.eventEndDate),
                }
            });
        });
        res.status(HttpStatus.CREATED).json(newEvent);
    } catch (error) {
        if ((error as any)?.code === 'P2002' &&
            (error as any)?.meta?.target?.includes('name')) {
            next(new AppError('An event with this name already exists.', HttpStatus.CONFLICT));
        } else { next(error); }
    }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const eventId = parseIdParam(req, 'eventId');
        const data = parseBody(req, updateEventSchema);
        const userId = getCurrentUserId(req);
        const trackedData = addUpdateTracking(data, userId);

        // ** Use transaction **
        const updatedEvent = await prisma.$transaction(async (tx) => {
            const existing = await tx.event.findUnique({ where: { id: eventId }, select: { id: true } });
            if (!existing) throw new AppError('Event not found', HttpStatus.NOT_FOUND);

            // Ensure dates are Date objects if provided
            const updatePayload: any = { ...trackedData };
            if (trackedData.eventStartDate) updatePayload.eventStartDate = new Date(trackedData.eventStartDate);
            if (trackedData.eventEndDate) updatePayload.eventEndDate = new Date(trackedData.eventEndDate);

            // Add refine validation check if both dates are present in the update
            if (updatePayload.eventStartDate && updatePayload.eventEndDate && updatePayload.eventEndDate < updatePayload.eventStartDate) {
                throw new AppError('End date cannot be before start date', HttpStatus.BAD_REQUEST);
            } else if (updatePayload.eventStartDate || updatePayload.eventEndDate) {
                // If only one is provided, fetch the other to validate
                const currentEvent = await tx.event.findUnique({ where: { id: eventId }, select: { eventStartDate: true, eventEndDate: true } });
                const finalStartDate = updatePayload.eventStartDate || currentEvent?.eventStartDate;
                const finalEndDate = updatePayload.eventEndDate || currentEvent?.eventEndDate;
                if (finalEndDate && finalStartDate && finalEndDate < finalStartDate) {
                    throw new AppError('End date cannot be before start date', HttpStatus.BAD_REQUEST);
                }
            }

            return tx.event.update({ where: { id: eventId }, data: updatePayload });
        });
        res.status(HttpStatus.OK).json(updatedEvent);
    } catch (error) {
        if ((error as any)?.code === 'P2002' &&
            (error as any)?.meta?.target?.includes('name')) {
            next(new AppError('An event with this name already exists.', HttpStatus.CONFLICT));
        }
        else if (error instanceof AppError) { next(error); }
        else if ((error as any)?.code === 'P2025') { next(new AppError('Event not found during update.', HttpStatus.NOT_FOUND)); }
        else { next(error); }
    }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const eventId = parseIdParam(req, 'eventId');

        await prisma.$transaction(async (tx) => {
            const existing = await tx.event.findUnique({ where: { id: eventId }, select: { id: true } });
            if (!existing) throw new AppError('Event not found', HttpStatus.NOT_FOUND);
            // Cascade delete handles EventDays, which cascade to Meals and Consumables
            await tx.event.delete({ where: { id: eventId } });
        });
        res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
        if (error instanceof AppError) { next(error); } // Propagate known errors
        else if ((error as any)?.code === 'P2025') { next(new AppError('Event not found during delete.', HttpStatus.NOT_FOUND)); } // Handle potential race condition
        else { next(error); }
    }
};

// --- EventDay CRUD ---

export const addEventDay = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const eventId = parseIdParam(req, 'eventId');
        const data = parseBody(req, createEventDaySchema);
        const userId = getCurrentUserId(req);
        const trackedData = addCreationTracking(data, userId);

        const newDay = await prisma.$transaction(async (tx) => {
            const eventExists = await tx.event.findUnique({ 
                where: { id: eventId }, 
                select: { id: true } 
            });
            if (!eventExists) throw new AppError('Event not found', HttpStatus.NOT_FOUND);

            // Check unique constraints (date, dayNumber within event) manually before create
            // Alternatively, let the DB handle it and catch P2002
            return tx.eventDay.create({
                data: {
                    eventId: eventId,
                    date: new Date(trackedData.date), // Ensure Date object
                    dayNumber: trackedData.dayNumber,
                    phase: trackedData.phase,
                    notes: trackedData.notes,
                    // Add new headcount fields
                    attendeeHeadcountForDay: trackedData.attendeeHeadcountForDay,
                    volunteerHeadcountForDay: trackedData.volunteerHeadcountForDay,
                    createdBy: trackedData.createdBy,
                    lastUpdatedBy: trackedData.lastUpdatedBy,
                }
            });
        });
        res.status(HttpStatus.CREATED).json(newDay);
    } catch (error) {
        if ((error as any)?.code === 'P2002') { // Handle unique constraint violations (e.g., eventId_dayNumber)
            const target = (error as any)?.meta?.target as string[] | undefined;
            if (target?.includes('eventId') && target?.includes('dayNumber')) {
                next(new AppError('Day number already exists for this event.', HttpStatus.CONFLICT));
            } else if (target?.includes('eventId') && target?.includes('date')) {
                next(new AppError('Date already exists for this event.', HttpStatus.CONFLICT));
            } else {
                 next(new AppError('Failed to add event day due to a conflict.', HttpStatus.CONFLICT));
            }
        } else if (error instanceof AppError) {
             next(error);
        }
        else { next(error); }
    }
};

export const updateEventDay = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dayId = parseIdParam(req, 'dayId');
        const data = parseBody(req, updateEventDaySchema);
        const userId = getCurrentUserId(req);
        const trackedData = addUpdateTracking(data, userId);

        const updatedDay = await prisma.$transaction(async (tx) => {
            const existingDay = await tx.eventDay.findUnique({ where: { id: dayId } });
            if (!existingDay) throw new AppError('Event day not found', HttpStatus.NOT_FOUND);

            // Prepare payload, ensuring date is Date object
            const updatePayload: any = { ...trackedData };
            if (trackedData.date) updatePayload.date = new Date(trackedData.date);

            if (trackedData.attendeeHeadcountForDay !== undefined) {
                updatePayload.attendeeHeadcountForDay = trackedData.attendeeHeadcountForDay;
            }
            if (trackedData.volunteerHeadcountForDay !== undefined) {
                updatePayload.volunteerHeadcountForDay = trackedData.volunteerHeadcountForDay;
            }

            // Check unique constraints if date or dayNumber changed
            // (Can be complex, relying on DB error P2002 might be simpler)

            return tx.eventDay.update({
                where: { id: dayId },
                 data: updatePayload
                 });
        });
        res.status(HttpStatus.OK).json(updatedDay);
    } catch (error) { 
        if ((error as any)?.code === 'P2025') { next(new AppError('Event day not found', HttpStatus.NOT_FOUND)); }
        else if ((error as any)?.code === 'P2002') {
             const target = (error as any)?.meta?.target as string[] | undefined;
            if (target?.includes('eventId') && target?.includes('dayNumber')) {
                next(new AppError('Day number conflicts with another day for this event.', HttpStatus.CONFLICT));
            } else if (target?.includes('eventId') && target?.includes('date')) {
                 next(new AppError('Date conflicts with another day for this event.', HttpStatus.CONFLICT));
            } else {
                 next(new AppError('Failed to update event day due to a conflict.', HttpStatus.CONFLICT));
            }
        }
        else if (error instanceof AppError) { next(error); }
        else { next(error); }
    }
};

export const deleteEventDay = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dayId = parseIdParam(req, 'dayId');
        await prisma.$transaction(async (tx) => {
            const existing = await tx.eventDay.findUnique({ where: { id: dayId }, select: { id: true } });
            if (!existing) throw new AppError('Event day not found', HttpStatus.NOT_FOUND);
            // Cascade delete handles meals/consumables
            await tx.eventDay.delete({ where: { id: dayId } });
        });
        res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) { 
        if (error instanceof AppError) { next(error); } 
        else if ((error as any)?.code === 'P2025') { 
            next(new AppError('Event day not found', HttpStatus.NOT_FOUND)); } 
            else { next(error); 
            } 
        }
};

// --- EventDayConsumable CRUD ---

export const addEventDayConsumable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dayId = parseIdParam(req, 'dayId');
        const data = parseBody(req, eventDayConsumableSchema);
        const userId = getCurrentUserId(req);
        const trackedData = addCreationTracking(data, userId);

        const newConsumable = await prisma.$transaction(async (tx) => {
            // Verify day, ingredient, unit exist
            const [dayExists, ingExists, unitExists] = await Promise.all([
                tx.eventDay.findUnique({ where: { id: dayId }, select: { id: true } }),
                tx.ingredient.findUnique({ where: { id: trackedData.ingredientId }, select: { id: true } }),
                tx.unitOfMeasure.findUnique({ where: { id: trackedData.unitId }, select: { id: true } })
            ]);
            if (!dayExists) throw new AppError('Event day not found', HttpStatus.NOT_FOUND);
            if (!ingExists) throw new AppError('Ingredient not found', HttpStatus.NOT_FOUND);
            if (!unitExists) throw new AppError('Unit not found', HttpStatus.NOT_FOUND);

            return tx.eventDayConsumable.create({ 
                data: {
                    dayId: dayId,
                    ingredientId: trackedData.ingredientId,
                    baseServingQuantity: trackedData.baseServingQuantity,
                    baseServingSize: trackedData.baseServingSize,
                    unitId: trackedData.unitId,
                    notes: trackedData.notes,
                    purchaseTiming: trackedData.purchaseTiming,
                    createdBy: trackedData.createdBy,
                    lastUpdatedBy: trackedData.lastUpdatedBy,
                } 
            });
        });
        res.status(HttpStatus.CREATED).json(newConsumable);
    } catch (error) { 
        if ((error as any)?.code === 'P2002') { // Unique constraint dayId_ingredientId
            next(new AppError('This ingredient already exists as a consumable for this day.', HttpStatus.CONFLICT));
       } else if (error instanceof AppError) {
           next(error);
       } else {
           next(error);
       }
    }
};

export const updateEventDayConsumable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const consumableId = parseIdParam(req, 'consumableId');
        // Allow updating quantity, notes, timing - not ingredient/unit/day
        const data = parseBody(req, updateEventDayConsumableSchema);
        const userId = getCurrentUserId(req);
        const trackedData = addUpdateTracking(data, userId);

        const updatedConsumable = await prisma.$transaction(async (tx) => {
            const existing = await tx.eventDayConsumable.findUnique({ where: { id: consumableId }, select: { id: true } });
            if (!existing) throw new AppError('Consumable item not found', HttpStatus.NOT_FOUND);

            // trackedData already contains only the allowed fields due to parseBody using updateEventDayConsumableSchema
            return tx.eventDayConsumable.update({
                where: { id: consumableId },
                data: trackedData // Pass directly as it contains only allowed + tracking fields
            });
        });
        res.status(HttpStatus.OK).json(updatedConsumable);
    } catch (error) {
            if (error instanceof AppError) { next(error); }
            else if ((error as any)?.code === 'P2025') { next(new AppError('Consumable item not found', HttpStatus.NOT_FOUND)); }
            else { next(error); }
        }
};

export const deleteEventDayConsumable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const consumableId = parseIdParam(req, 'consumableId');
        await prisma.$transaction(async (tx) => {
            const existing = await tx.eventDayConsumable.findUnique({ where: { id: consumableId }, select: { id: true } });
            if (!existing) throw new AppError('Consumable item not found', HttpStatus.NOT_FOUND);
            await tx.eventDayConsumable.delete({ where: { id: consumableId } });
        });
        res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
            if (error instanceof AppError) { next(error); } 
            else if ((error as any)?.code === 'P2025') { next(new AppError('Consumable item not found', HttpStatus.NOT_FOUND)); } 
            else { next(error); } 
        }    
};