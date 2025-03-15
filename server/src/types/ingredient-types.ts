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
    ingredient_id: number
    name: string
    description?: string
    category_id: number
    category?: IngredientCategory
    subcategory_id?: number
    subcategory?: IngredientSubcategory
    default_unit_id: number
    default_unit?: UnitOfMeasure

    // Storage and shelf life
    isPerishable: boolean
    storageType: StorageType
    shelfLifeDays?: number
    storageInstructions?: string

    // Supplier information
    supplierInstructions?: string
    supplierNotes?: string
    preferredSupplier?: string
    orderLeadTimeDays?: number

    // Practical attributes
    costPerUnitDollars?: number
    packageSize?: number
    package_unit_id?: number
    package_unit?: UnitOfMeasure

    // Additional boolean attributes
    isLocal: boolean
    isOrganic: boolean
    isSeasonalItem: boolean
    hasVariablePrice: boolean
    isCommonAllergen: boolean
    isSpecialOrder: boolean

    // Related entities
    allergens?: IngredientAllergen[]
    dietaryFlags?: IngredientDietaryFlag[]
    substitutes?: IngredientSubstitute[]
    density_conversions?: IngredientDensity[]

    // Tracking
    createdAt: Date
    updatedAt: Date
}

export interface IngredientCategory {
    category_id: number
    name: string
    description?: string
    storeSection?: string
    displayOrder: number
}

export interface IngredientSubcategory {
    subcategory_id: number
    name: string
    description?: string
    category_id: number
    displayOrder: number
}

export interface IngredientAllergen {
    allergen_id: number
    ingredient_id: number
    allergenName: string
}

export interface IngredientDietaryFlag {
    dietary_flag_id: number
    ingredient_id: number
    flag: string
}

export interface IngredientSubstitute {
    substitute_id: number
    ingredient_id: number
    substitute_ingredient_id: number
    substitute_ingredient?: Ingredient
    conversionRatio: number
    notes?: string
}

export interface UnitOfMeasure {
    uom_id: number
    uom_name: string
    uom_abbreviation: string
    uom_system: MeasurementSystem
    uom_type: UnitType

    // Base unit conversion
    uom_base_unit_id?: number
    uom_base_unit?: UnitOfMeasure
    uom_conversionFactor: number

    // Cross-system equivalent
    uom_equivalent_id?: number
    uom_equivalent_unit?: UnitOfMeasure
    uom_equivalentFactor?: number

    // Tracking
    createdAt: Date
    updatedAt: Date
}

export interface IngredientDensity {
    density_id: number
    ingredient_id: number
    volume_unit_id: number
    volume_unit?: UnitOfMeasure
    weight_unit_id: number
    weight_unit?: UnitOfMeasure
    conversionFactor: number
    notes?: string
}

/**
 * Utility type for unit conversion requests
 */
export interface UnitConversionRequest {
    quantity: number
    fromUnitId: number
    toUnitId: number
    ingredientId?: number // Only needed for volume-to-weight or weight-to-volume conversions
}

/**
 * Response for successful unit conversion
 */
export interface UnitConversionResult {
    originalQuantity: number
    originalUnit: string
    convertedQuantity: number
    convertedUnit: string
    conversionPath: string // Description of how conversion was performed
}

/**
 * Interface for ingredient creation data
 */
export interface CreateIngredientInput {
    name: string
    description?: string
    category_id: number
    subcategory_id?: number
    default_unit_id: number
    isPerishable?: boolean
    storageType?: StorageType
    shelfLifeDays?: number
    storageInstructions?: string
    supplierInstructions?: string
    supplierNotes?: string
    preferredSupplier?: string
    orderLeadTimeDays?: number
    costPerUnitDollars?: number
    packageSize?: number
    package_unit_id?: number
    isLocal?: boolean
    isOrganic?: boolean
    isSeasonalItem?: boolean
    hasVariablePrice?: boolean
    isCommonAllergen?: boolean
    isSpecialOrder?: boolean
}

/**
 * Interface for updating an ingredient
 */
export interface UpdateIngredientInput {
    name?: string
    description?: string
    category_id?: number
    subcategory_id?: number
    default_unit_id?: number
    isPerishable?: boolean
    storageType?: StorageType
    shelfLifeDays?: number | null
    storageInstructions?: string | null
    supplierInstructions?: string | null
    supplierNotes?: string | null
    preferredSupplier?: string | null
    orderLeadTimeDays?: number | null
    costPerUnitDollars?: number | null
    packageSize?: number | null
    package_unit_id?: number | null
    isLocal?: boolean
    isOrganic?: boolean
    isSeasonalItem?: boolean
    hasVariablePrice?: boolean
    isCommonAllergen?: boolean
    isSpecialOrder?: boolean
}

/**
 * Interface for querying ingredients with filters
 */
export interface IngredientFilters {
    categoryId?: number
    subcategoryId?: number
    isPerishable?: boolean
    storageType?: StorageType
    isLocal?: boolean
    isOrganic?: boolean
    isSeasonalItem?: boolean
    isCommonAllergen?: boolean
    search?: string // For searching by name or description
}
