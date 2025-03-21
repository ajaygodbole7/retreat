/**
 * Converts Date objects to ISO strings in an object
 * @param obj Object potentially containing Date objects
 * @returns Same object with Date objects converted to strings
 */
export function convertDatesToStrings<T>(obj: T): any {
    if (!obj) return obj

    if (obj instanceof Date) {
        return obj.toISOString()
    }

    if (typeof obj !== "object") {
        return obj
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => convertDatesToStrings(item))
    }

    const result: Record<string, any> = {}

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key as keyof typeof obj]
            result[key] = convertDatesToStrings(value)
        }
    }

    return result
}

/**
 * Parses string dates back to Date objects
 * @param obj Object potentially containing date strings
 * @returns Same object with date strings converted to Date objects
 */
export function parseStringsToDates<T>(obj: T): any {
    if (!obj) return obj

    if (typeof obj !== "object") {
        return obj
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => parseStringsToDates(item))
    }

    const result: Record<string, any> = {}

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key as keyof typeof obj]

            // Check if the value is a date string
            if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                result[key] = new Date(value)
            } else {
                result[key] = parseStringsToDates(value)
            }
        }
    }

    return result
}
