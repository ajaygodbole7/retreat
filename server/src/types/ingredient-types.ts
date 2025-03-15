// TypeScript interfaces matching the updated Prisma schema with integer IDs

export enum StorageType {
    ROOM_TEMPERATURE = "ROOM_TEMPERATURE",
    REFRIGERATED = "REFRIGERATED",
    FROZEN = "FROZEN",
    DRY_STORAGE = "DRY_STORAGE",
    COOL_DARK = "COOL_DARK",
}

export enum MeasurementSystem {
    METRIC = "METRIC",
    US = "US",
}

export enum UnitType {
    VOLUME = "VOLUME",
    WEIGHT = "WEIGHT",
    COUNT = "COUNT",
    LENGTH = "LENGTH",
    TEMPERATURE = "TEMPERATURE",
}

export interface Ingredient {
    id: number;
    name: string;
    description?: string | null;
    categoryId: number;
    category?: IngredientCategory;
    subcategoryId?: number | null;
    subcategory?: IngredientSubcategory | null;
    defaultUnitId: number;
    defaultUnit?: UnitOfMeasure;

    // Storage and shelf life
    isPerishable: boolean;
    storageType: StorageType;
    shelfLifeDays?: number | null;
    storageInstructions?: string | null;

    // Supplier information
    supplierInstructions?: string | null;
    supplierNotes?: string | null;
    preferredSupplier?: string | null;
    orderLeadTimeDays?: number | null;

    // Practical attributes
    costPerUnitDollars?: number | null;
    packageSize?: number | null;
    packageUnitId?: number | null;
    packageUnit?: UnitOfMeasure | null;

    // Additional boolean attributes
    isLocal: boolean;
    isOrganic: boolean;
    isSeasonalItem: boolean;
    hasVariablePrice: boolean;
    isCommonAllergen: boolean;
    isSpecialOrder: boolean;

    // Related entities
    allergens?: IngredientAllergen[];
    dietaryFlags?: IngredientDietaryFlag[];
    substitutes?: IngredientSubstitute[];
    densityConversions?: IngredientDensity[];

    // Tracking
    createdAt: Date;
    updatedAt: Date;
}

export interface IngredientCategory {
    id: number;
    name: string;
    description?: string | null;
    storeSection?: string | null;
    displayOrder: number;

    // Relationships
    ingredients?: Ingredient[];
    subcategories?: IngredientSubcategory[];

    // Tracking
    createdAt: Date;
    updatedAt: Date;
}

export interface IngredientSubcategory {
    id: number;
    name: string;
    description?: string | null;
    categoryId: number;
    category?: IngredientCategory;
    displayOrder: number;

    // Relationships
    ingredients?: Ingredient[];

    // Tracking
    createdAt: Date;
    updatedAt: Date;
}

export interface IngredientAllergen {
    id: number;
    ingredientId: number;
    ingredient?: Ingredient;
    allergenName: string;
}

export interface IngredientDietaryFlag {
    id: number;
    ingredientId: number;
    ingredient?: Ingredient;
    flag: string;
}

export interface IngredientSubstitute {
    id: number;
    ingredientId: number;
    ingredient?: Ingredient;
    substituteIngredientId: number;
    substituteIngredient?: Ingredient;
    conversionRatio: number;
    notes?: string | null;
}

export interface UnitOfMeasure {
    id: number;
    name: string;
    abbreviation: string;
    system: MeasurementSystem;
    type: UnitType;

    // Base unit conversion
    baseUnitId?: number | null;
    baseUnit?: UnitOfMeasure | null;
    conversionFactor: number;

    // Cross-system equivalent
    equivalentUnitId?: number | null;
    equivalentUnit?: UnitOfMeasure | null;
    equivalentFactor?: number | null;

    // Tracking
    createdAt: Date;
    updatedAt: Date;
}

export interface IngredientDensity {
    id: number;
    ingredientId: number;
    ingredient?: Ingredient;
    volumeUnitId: number;
    volumeUnit?: UnitOfMeasure;
    weightUnitId: number;
    weightUnit?: UnitOfMeasure;
    conversionFactor: number;
    notes?: string | null;
}

/**
 * Utility type for unit conversion requests
 */
export interface UnitConversionRequest {
    quantity: number;
    fromUnitId: number;
    toUnitId: number;
    ingredientId?: number; // Only needed for volume-to-weight or weight-to-volume conversions
}

/**
 * Response for successful unit conversion
 */
export interface UnitConversionResult {
    originalQuantity: number;
    originalUnit: string;
    convertedQuantity: number;
    convertedUnit: string;
    conversionPath: string; // Description of how conversion was performed
}

/**
 * Interface for ingredient creation data
 */
export interface CreateIngredientInput {
    name: string;
    description?: string | null;
    categoryId: number;
    subcategoryId?: number | null;
    defaultUnitId: number;
    isPerishable?: boolean;
    storageType?: StorageType;
    shelfLifeDays?: number | null;
    storageInstructions?: string | null;
    supplierInstructions?: string | null;
    supplierNotes?: string | null;
    preferredSupplier?: string | null;
    orderLeadTimeDays?: number | null;
    costPerUnitDollars?: number | null;
    packageSize?: number | null;
    packageUnitId?: number | null;
    isLocal?: boolean;
    isOrganic?: boolean;
    isSeasonalItem?: boolean;
    hasVariablePrice?: boolean;
    isCommonAllergen?: boolean;
    isSpecialOrder?: boolean;
}

/**
 * Interface for updating an ingredient
 */
export interface UpdateIngredientInput {
    name?: string;
    description?: string | null;
    categoryId?: number;
    subcategoryId?: number | null;
    defaultUnitId?: number;
    isPerishable?: boolean;
    storageType?: StorageType;
    shelfLifeDays?: number | null;
    storageInstructions?: string | null;
    supplierInstructions?: string | null;
    supplierNotes?: string | null;
    preferredSupplier?: string | null;
    orderLeadTimeDays?: number | null;
    costPerUnitDollars?: number | null;
    packageSize?: number | null;
    packageUnitId?: number | null;
    isLocal?: boolean;
    isOrganic?: boolean;
    isSeasonalItem?: boolean;
    hasVariablePrice?: boolean;
    isCommonAllergen?: boolean;
    isSpecialOrder?: boolean;
}

/**
 * Interface for querying ingredients with filters
 */
export interface IngredientFilters {
    categoryId?: string;
    subcategoryId?: string;
    isPerishable?: string;
    storageType?: StorageType;
    isLocal?: string;
    isOrganic?: string;
    isSeasonalItem?: string;
    isCommonAllergen?: string;
    search?: string; // For searching by name or description
}