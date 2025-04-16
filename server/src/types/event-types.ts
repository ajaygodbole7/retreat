// server/src/types/event-types.ts

import type { Ingredient, UnitOfMeasure } from './ingredient-types'; 
import type { Recipe } from './recipe-types'; 


export enum EventType {
  RETREAT = "RETREAT",
  PRANAM = "PRANAM",
  TALK = "TALK",
  EVENING_PROGRAM = "EVENING_PROGRAM",
  SCREENING = "SCREENING",
}

export enum EventPhase {
  PRE_RETREAT = "PRE_RETREAT",
  MAIN_RETREAT = "MAIN_RETREAT",
  POST_RETREAT = "POST_RETREAT",
}

export enum EventStatus {
  PLANNING = "PLANNING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum MealType {
  BREAKFAST = "BREAKFAST",
  MORNING_SNACK = "MORNING_SNACK",
  LUNCH = "LUNCH",
  AFTERNOON_SNACK = "AFTERNOON_SNACK",
  DINNER = "DINNER",
  BRUNCH = "BRUNCH",
  LIGHT_SNACKS = "LIGHT_SNACKS",
  REGISTRATION = "REGISTRATION",
}


export interface Event {
  id: number;
  eventName: string;
  description?: string | null;
  eventType: EventType;
  eventStartDate: Date; // Use Date type - conversion handled by service/API layer
  eventEndDate: Date;
  location?: string | null;
  defaultAttendeeCount: number;
  defaultVolunteerCount: number;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  lastUpdatedBy?: string | null;

  // Relationships (optional, depends on Prisma query includes)
  days?: EventDay[];
}

export interface EventDay {
  id: number;
  eventId: number;
  date: Date; // Use Date type
  dayNumber: number;
  phase: EventPhase;
  attendeeHeadcountForDay: number;
  volunteerHeadcountForDay: number;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  lastUpdatedBy?: string | null;

  // Relationships
  event?: Event; // Link back to parent
  scheduledMeals?: ScheduledMeal[];
  consumables?: EventDayConsumable[];
}

export interface Menu {
  id: number;
  name: string;
  description?: string | null;
  mealType?: MealType | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  lastUpdatedBy?: string | null;

  // Relationships
  scheduledMeals?: ScheduledMeal[];
  menuItems?: MenuRecipe[];
}

export interface MenuRecipe {
  id: number;
  menuId: number;
  recipeId: number;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  menu?: Menu;
  recipe?: Recipe;
}

export interface ScheduledMeal {
  id: number;
  dayId: number;
  // Prisma returns time as string in ISO format from db.Time
  // It's often easier to handle as string unless specific Time manipulation is needed
  time: string;
  mealType: MealType;
  attendeeHeadcount: number;
  volunteerHeadcount: number;
  menuId?: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  lastUpdatedBy?: string | null;

  // Relationships
  day?: EventDay;
  menu?: Menu;
  scheduledMealRecipes?: ScheduledMealRecipe[];
}

export interface ScheduledMealRecipe {
  id: number; // Prisma adds an ID here automatically if not composite
  scheduledMealId: number;
  recipeId: number;
  createdAt: Date;
  updatedAt: Date;

  // Relationships
  scheduledMeal?: ScheduledMeal;
  recipe?: Recipe;
}

export interface EventDayConsumable {
  id: number;
  dayId: number;
  ingredientId: number;
  baseServingQuantity: number;
  baseServingSize: number;
  unitId: number;
  notes?: string | null;
  purchaseTiming?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  lastUpdatedBy?: string | null;

  // Relationships
  day?: EventDay;
  ingredient?: Ingredient;
  unit?: UnitOfMeasure;
}

// --- Input/Update Interfaces (Based on settable fields, align with Zod schemas) ---
// These define the shapes expected by the backend API for create/update operations.
// Using `Date | string` allows flexibility if the frontend sends strings,
// but the service layer should ideally handle conversion from Date objects.

export interface CreateEventInput {
    eventName: string;
    description?: string | null;
    eventType: EventType;
    eventStartDate: Date | string; // API likely expects ISO string
    eventEndDate: Date | string;   // API likely expects ISO string
    location?: string | null;
    defaultAttendeeCount?: number;
    defaultVolunteerCount?: number;
    status: EventStatus;
    // createdBy/lastUpdatedBy are usually handled by backend logic/middleware
}

export interface UpdateEventInput {
    eventName?: string;
    description?: string | null;
    eventType?: EventType;
    eventStartDate?: Date | string;
    eventEndDate?: Date | string;
    location?: string | null;
    defaultAttendeeCount?: number;
    defaultVolunteerCount?: number;
    status?: EventStatus;
    // lastUpdatedBy handled by backend
}

export interface CreateEventDayInput {
    // eventId passed via URL parameter typically
    date: Date | string; // API likely expects ISO string (YYYY-MM-DD)
    dayNumber: number;
    phase: EventPhase;
    attendeeHeadcountForDay?: number;
    volunteerHeadcountForDay?: number;
    notes?: string | null;
}

export interface UpdateEventDayInput {
    date?: Date | string;
    dayNumber?: number;
    phase?: EventPhase;
    attendeeHeadcountForDay?: number;
    volunteerHeadcountForDay?: number;
    notes?: string | null;
}

export interface EventDayConsumableInput {
    // dayId passed via URL parameter typically
    ingredientId: number;
    baseServingQuantity: number;
    baseServingSize?: number; // Uses DB default if not provided
    unitId: number;
    notes?: string | null;
    purchaseTiming?: string | null;
}

export interface UpdateEventDayConsumableInput {
    // ingredientId/unitId usually not updatable directly this way
    baseServingQuantity?: number;
    baseServingSize?: number;
    notes?: string | null;
    purchaseTiming?: string | null;
}

// --- Add Input/Update types for Menu, ScheduledMeal etc. as needed ---
// Example:
export interface CreateScheduledMealInput {
    // dayId passed via URL
    time: string; // Expect HH:MM or HH:MM:SS string
    mealType: MealType;
    attendeeHeadcount?: number;
    volunteerHeadcount?: number;
    menuId?: number | null;
    notes?: string | null;
}

export interface UpdateScheduledMealInput {
    time?: string;
    mealType?: MealType;
    attendeeHeadcount?: number;
    volunteerHeadcount?: number;
    menuId?: number | null; // Allow setting to null
    notes?: string | null;
}