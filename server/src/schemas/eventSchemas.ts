// server/src/schemas/eventSchemas.ts
import { z } from 'zod';
import { EventType, EventPhase, EventStatus } from '@prisma/client';

// --- Event Schemas ---

// ** STEP 1: Define the base object structure **
const eventBaseSchema = z.object({
    eventName: z.string().min(1, 'Event name is required'),
    description: z.string().optional().nullable(),
    eventType: z.nativeEnum(EventType).default(EventType.RETREAT),
    eventStartDate: z.coerce.date({
        required_error: "Start date is required",
        invalid_type_error: "Invalid start date format",
    }),
    eventEndDate: z.coerce.date({
        required_error: "End date is required",
        invalid_type_error: "Invalid end date format",
    }),
    location: z.string().optional().nullable(),
    defaultAttendeeCount: z.number().int().nonnegative().default(0),
    defaultVolunteerCount: z.number().int().nonnegative().default(0),
    status: z.nativeEnum(EventStatus).default(EventStatus.PLANNING),
});

// ** STEP 2: Create the partial schema for updates from the BASE **
export const updateEventSchema = eventBaseSchema.partial();

// ** STEP 3: Create the full schema for creation by refining the BASE **
export const createEventSchema = eventBaseSchema
    .refine(data => data.eventEndDate >= data.eventStartDate, {
        message: "End date cannot be before start date",
        path: ["eventEndDate"], // Point error to endDate field
    });

// Types are inferred correctly from the final schemas
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;


// --- EventDay Schemas --- 
export const createEventDaySchema = z.object({
    // eventId will come from the route parameter, not the body
    date: z.coerce.date({ required_error: "Date is required", invalid_type_error: "Invalid date format" }),
    dayNumber: z.number().int().nonnegative({ message: "Day number must be 0 or positive" }),
    phase: z.nativeEnum(EventPhase).default(EventPhase.MAIN_RETREAT),
    attendeeHeadcountForDay: z.number().int().nonnegative().optional(),
    volunteerHeadcountForDay: z.number().int().nonnegative().optional(),
    notes: z.string().optional().nullable(),
});

export const updateEventDaySchema = createEventDaySchema.partial();

export type CreateEventDayInput = z.infer<typeof createEventDaySchema>;
export type UpdateEventDayInput = z.infer<typeof updateEventDaySchema>;


// --- EventDayConsumable Schemas --- 
export const eventDayConsumableSchema = z.object({
    // dayId will come from route params typically
    ingredientId: z.number().int().positive({ message: "Ingredient ID required" }),
    baseServingQuantity: z.number().positive({ message: "Base serving quantity must be positive" }),
    baseServingSize: z.number().int().positive().optional().default(8), // Default to 8 as per Prisma
    unitId: z.number().int().positive({ message: "Unit ID required" }),
    notes: z.string().optional().nullable(),
    purchaseTiming: z.string().optional().nullable(),
});

//export const updateEventDayConsumableSchema = eventDayConsumableSchema.omit({ ingredientId: true }).partial();

// Only allow updating quantity, size, notes, and timing
export const updateEventDayConsumableSchema = eventDayConsumableSchema
    .pick({ // Select fields that CAN be updated
        baseServingQuantity: true,
        baseServingSize: true,
        notes: true,
        purchaseTiming: true,
    })
    .partial(); // Make them optional for update

export type EventDayConsumableInput = z.infer<typeof eventDayConsumableSchema>;
export type UpdateEventDayConsumableInput = z.infer<typeof updateEventDayConsumableSchema>;