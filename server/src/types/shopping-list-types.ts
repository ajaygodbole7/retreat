// src/types/shopping-list-types.ts

// --- Enums for Frontend Use ---
// These should mirror the enums defined in prisma/schema.prisma
export enum ShoppingListStatus {
    DRAFT = "DRAFT",
    GENERATED = "GENERATED",
    PURCHASING = "PURCHASING",
    COMPLETED = "COMPLETED",
    ARCHIVED = "ARCHIVED",
}

export enum ShoppingListItemStatus {
    NEEDED = "NEEDED",
    PURCHASED = "PURCHASED",
    PARTIAL = "PARTIAL",
    OUT_OF_STOCK = "OUT_OF_STOCK",
    SUBSTITUTED = "SUBSTITUTED",
    NOT_NEEDED = "NOT_NEEDED",
}

// Basic nested types for relations (adjust fields as needed by frontend)
export interface SimpleIngredientRef {
    id: number;
    name: string;
    categoryId?: number | null;
    category?: { name: string | null } | null;
}

export interface SimpleUnitRef {
    id: number;
    name: string;
    abbreviation: string;
}

// Updated to use string | null for date fields in API responses
export interface ShoppingListItemData {
    id: number;
    shoppingListId: number;
    ingredientId: number;
    unitId: number;
    ingredientName: string;
    unitAbbreviation: string;
    categoryId?: number | null;
    categoryName?: string | null;
    calculatedQuantity: number;
    purchasedQuantity?: number | null;
    status: ShoppingListItemStatus; // Use shared enum
    notes?: string | null;
    orderedFrom?: string | null;
    orderPickupDate?: string | null; // API returns as string
    ingredient?: SimpleIngredientRef;
    unit?: SimpleUnitRef;
    createdAt: string; // API returns as string
    updatedAt: string; // API returns as string
}

// Updated to use string | null for date fields in API responses
export interface ShoppingListData {
    id: number;
    eventId: number;
    status: ShoppingListStatus; // Use shared enum
    generatedAt?: string | null; // API returns as string
    notes?: string | null;
    createdAt: string; // API returns as string
    updatedAt: string; // API returns as string
    eventName?: string; // Added for convenience when joining with event
}

export interface ShoppingListWithItems extends ShoppingListData {
    items: ShoppingListItemData[];
}

export interface AggregatedShoppingItem {
    ingredientId: number;
    ingredientName: string;
    unitId: number;
    unitAbbreviation: string;
    totalQuantity: number;
    roundedQuantity?: number; // Added for rounded quantities
    categoryId: number | null;
    categoryName: string | null;
}

export interface GroupedShoppingList {
    [categoryName: string]: AggregatedShoppingItem[];
}

// Pagination interface
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}