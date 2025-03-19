// TypeScript interfaces matching the Recipe-related Prisma schema

export enum CourseType {
    MAIN_COURSE = "MAIN_COURSE",
    SIDE_DISH = "SIDE_DISH",
    APPETIZER = "APPETIZER",
    DESSERT = "DESSERT",
    BEVERAGE = "BEVERAGE",
    BREAKFAST = "BREAKFAST",
    SNACK = "SNACK",
}

export enum CookingMethod {
    STOVETOP = "STOVETOP",
    PRESSURE_COOKER = "PRESSURE_COOKER",
    OVEN = "OVEN",
    NO_COOK = "NO_COOK",
    SLOW_COOK = "SLOW_COOK",
    STEAM = "STEAM",
}

export interface Recipe {
    id: number;
    name: string;
    description?: string | null;
    servingSize: number;
    preparationTimeMinutes?: number | null;
    cookingTimeMinutes?: number | null;
    totalTimeMinutes?: number | null;
    notes?: string | null;

    // Indian cooking specifics
    cookingMethod?: CookingMethod | null;
    cookingEquipment?: string | null;

    // Dietary info
    hasOnionGarlic: boolean;
    isGlutenFree: boolean;
    isVegan: boolean;

    courseType: CourseType;
    tags?: string | null;
    submittedBy?: string | null;

    // Relationships
    recipeIngredients?: RecipeIngredient[];
    steps?: RecipeStep[];

    // Tracking
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string | null;
    lastUpdatedBy?: string | null;
}

export interface RecipeStep {
    id: number;
    recipeId: number;
    recipe?: Recipe;
    stepNumber: number;
    instruction: string;
    estimatedTimeMinutes?: number | null;
    isOptional: boolean;

    // Tracking
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string | null;
    lastUpdatedBy?: string | null;
}

export interface RecipeIngredient {
    id: number;
    recipeId: number;
    recipe?: Recipe;
    ingredientId: number;
    ingredient?: any; // Would be Ingredient type from ingredient-types
    quantity: number;
    unitId: number;
    unit?: any; // Would be UnitOfMeasure type from ingredient-types
    preparation?: string | null;
    isOptional: boolean;
    displayOrder: number;
    notes?: string | null;

    // Scaling behavior information
    scalingFactor: number;
    alternateIngredientId?: number | null;
    alternateIngredient?: any; // Would be Ingredient type

    // Tracking
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string | null;
    lastUpdatedBy?: string | null;
}

/**
 * Interface for recipe creation data
 */
export interface CreateRecipeInput {
    name: string;
    description?: string | null;
    servingSize?: number;
    preparationTimeMinutes?: number | null;
    cookingTimeMinutes?: number | null;
    totalTimeMinutes?: number | null;
    notes?: string | null;
    cookingMethod?: CookingMethod | null;
    cookingEquipment?: string | null;
    hasOnionGarlic?: boolean;
    isGlutenFree?: boolean;
    isVegan?: boolean;
    courseType?: CourseType;
    tags?: string | null;
    submittedBy?: string | null;
    createdBy?: string | null;
}

/**
 * Interface for updating a recipe
 */
export interface UpdateRecipeInput {
    name?: string;
    description?: string | null;
    servingSize?: number;
    preparationTimeMinutes?: number | null;
    cookingTimeMinutes?: number | null;
    totalTimeMinutes?: number | null;
    notes?: string | null;
    cookingMethod?: CookingMethod | null;
    cookingEquipment?: string | null;
    hasOnionGarlic?: boolean;
    isGlutenFree?: boolean;
    isVegan?: boolean;
    courseType?: CourseType;
    tags?: string | null;
    submittedBy?: string | null;
    lastUpdatedBy?: string | null;
}

/**
 * Interface for creating recipe steps
 */
export interface CreateRecipeStepInput {
    recipeId: number;
    stepNumber: number;
    instruction: string;
    estimatedTimeMinutes?: number | null;
    isOptional?: boolean;
    createdBy?: string | null;
}

/**
 * Interface for updating recipe steps
 */
export interface UpdateRecipeStepInput {
    stepNumber?: number;
    instruction?: string;
    estimatedTimeMinutes?: number | null;
    isOptional?: boolean;
    lastUpdatedBy?: string | null;
}

/**
 * Interface for creating recipe ingredients
 */
export interface CreateRecipeIngredientInput {
    recipeId: number;
    ingredientId: number;
    quantity: number;
    unitId: number;
    preparation?: string | null;
    isOptional?: boolean;
    displayOrder?: number;
    notes?: string | null;
    scalingFactor?: number;
    alternateIngredientId?: number | null;
    createdBy?: string | null;
}

/**
 * Interface for updating recipe ingredients
 */
export interface UpdateRecipeIngredientInput {
    quantity?: number;
    unitId?: number;
    preparation?: string | null;
    isOptional?: boolean;
    displayOrder?: number;
    notes?: string | null;
    scalingFactor?: number;
    alternateIngredientId?: number | null;
    lastUpdatedBy?: string | null;
}

/**
 * Interface for querying recipes with filters
 */
export interface RecipeFilters {
    courseType?: CourseType;
    isVegan?: string;
    isGlutenFree?: string;
    hasOnionGarlic?: string;
    search?: string; // For searching by name or description
    submittedBy?: string;
}