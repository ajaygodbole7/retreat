import type { CourseType, CookingMethod } from "@server/types/recipe-types"

/**
 * Format minutes into a human-readable time string
 */
export function formatTime(minutes: number | null | undefined): string {
    if (!minutes) return "N/A"

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
        return `${hours}h ${mins > 0 ? `${mins}m` : ""}`
    }
    return `${mins}m`
}

/**
 * Get a human-readable label for a course type
 */
export function getCourseTypeLabel(courseType: CourseType): string {
    switch (courseType) {
        case "MAIN_COURSE":
            return "Main Course"
        case "SIDE_DISH":
            return "Side Dish"
        case "APPETIZER":
            return "Appetizer"
        case "DESSERT":
            return "Dessert"
        case "BEVERAGE":
            return "Beverage"
        case "BREAKFAST":
            return "Breakfast"
        case "SNACK":
            return "Snack"
        default:
            return courseType
    }
}

/**
 * Get a human-readable label for a cooking method
 */
export function getCookingMethodLabel(method: CookingMethod | null | undefined): string {
    if (!method) return "Not specified"

    switch (method) {
        case "STOVETOP":
            return "Stovetop"
        case "PRESSURE_COOKER":
            return "Pressure Cooker"
        case "OVEN":
            return "Oven"
        case "NO_COOK":
            return "No Cook"
        case "SLOW_COOK":
            return "Slow Cook"
        case "STEAM":
            return "Steam"
        default:
            return method
    }
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString: string | Date): string {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date)
}

/**
 * Format a number with commas for thousands
 */
export function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

/**
 * Format a quantity with appropriate precision
 */
export function formatQuantity(quantity: number): string {
    // If it's a whole number, don't show decimal places
    if (Number.isInteger(quantity)) {
        return quantity.toString()
    }

    // For fractions, show up to 2 decimal places
    return quantity.toFixed(2).replace(/\.?0+$/, "")
}

/**
 * Format course type for display (alias for getCourseTypeLabel)
 */
export function formatCourseType(courseType: CourseType): string {
    return getCourseTypeLabel(courseType)
}

/**
 * Format cooking method for display (alias for getCookingMethodLabel)
 */
export function formatCookingMethod(method: CookingMethod | null | undefined): string {
    return getCookingMethodLabel(method)
}