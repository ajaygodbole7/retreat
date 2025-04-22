// src/schemas/shoppingListSchemas.ts
import { z } from 'zod';
// Import Enums DIRECTLY from Prisma Client for validation
import { EventType, ShoppingListItemStatus } from '@prisma/client';

// Schema for validating updates to a ShoppingListItem
export const updateShoppingListItemSchema = z.object({
    status: z.nativeEnum(ShoppingListItemStatus).optional(), // Use Prisma enum
    purchasedQuantity: z.number().min(0, "Purchased quantity must be non-negative").optional().nullable(),
    notes: z.string().optional().nullable(),
    orderedFrom: z.string().optional().nullable(),
    orderPickupDate: z.coerce.date().optional().nullable(), // Coerce to Date
}).strict();

// Schema for validating query parameters for the consolidated list endpoint
export const getConsolidatedListQuerySchema = z.object({
    startDate: z.coerce.date({ // Coerce to Date
        required_error: "Start date is required",
        invalid_type_error: "Invalid start date format (YYYY-MM-DD recommended)",
    }),
    endDate: z.coerce.date({ // Coerce to Date
        required_error: "End date is required",
        invalid_type_error: "Invalid end date format (YYYY-MM-DD recommended)",
    }),
    eventIds: z.preprocess(
        (val) => (typeof val === 'string'
            ? val.split(',').map(v => v.trim()).filter(Boolean)
            : (Array.isArray(val) ? val : [])),
        z.array(z.coerce.number().int().positive({ message: "Event IDs must be positive integers" })).optional()
    ).optional(),
    eventTypes: z.preprocess(
        (val) => (typeof val === 'string'
            ? val.split(',').map(v => v.trim()).filter(Boolean)
            : (Array.isArray(val) ? val : [])),
        z.array(z.nativeEnum(EventType, { errorMap: () => ({ message: "Invalid event type provided" }) })).optional() // Use Prisma enum
    ).optional(),
    roundQuantities: z.preprocess(
        (val) => val === 'true' || val === '1' || val === true,
        z.boolean().optional().default(true)
    ).optional(),
}).refine(data => data.endDate >= data.startDate, {
    message: "End date cannot be before start date",
    path: ["endDate"],
});

// Schema for updating a shopping list (top-level fields only)
export const updateShoppingListSchema = z.object({
    notes: z.string().optional().nullable(),
    status: z.enum(["DRAFT", "GENERATED", "PURCHASING", "COMPLETED", "ARCHIVED"]).optional(),
}).strict();

// Type inferred AFTER Zod validation
export type ValidatedUpdateShoppingListItemInput = z.infer<typeof updateShoppingListItemSchema>;
export type ValidatedConsolidatedListCriteria = z.infer<typeof getConsolidatedListQuerySchema>;
export type ValidatedUpdateShoppingListInput = z.infer<typeof updateShoppingListSchema>;