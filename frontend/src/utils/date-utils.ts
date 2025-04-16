// src/utils/date-utils.ts

/**
 * Safely check if a value is a Date object
 */
export function isDate(value: any): boolean {
    return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Check if a string is a time-only string (HH:MM or HH:MM:SS)
 */
export function isTimeOnlyString(value: string): boolean {
    return /^([01]?\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(value);
}

/**
 * Format a time value (string, Date, etc.) to HH:MM format for display
 * @param time Any time value to format
 * @param defaultValue Optional default to return if formatting fails
 */
export function formatTimeForDisplay(time: any, defaultValue: string = "??:??"): string {
    if (!time) return defaultValue;

    try {
        // If it's already in HH:MM or HH:MM:SS format
        if (typeof time === 'string') {
            // Case 1: ISO string with T separator (yyyy-MM-ddTHH:mm:ss)
            if (time.includes('T')) {
                const parts = time.split('T');
                if (parts.length > 1 && parts[1]) {
                    return parts[1].substring(0, 5); // Take HH:MM part
                }
            }
            // Case 2: Simple time string (HH:MM or HH:MM:SS)
            else if (isTimeOnlyString(time)) {
                return time.substring(0, 5); // Ensure just HH:MM
            }
        }

        // Case 3: Date object
        if (isDate(time)) {
            return time.toTimeString().substring(0, 5);
        }

        return defaultValue;
    } catch (error) {
        console.error("Error formatting time:", error);
        return defaultValue;
    }
}

/**
 * Format a time value for input in a form
 * @param time Any time value to format
 * @param defaultValue Default time to use if the input is invalid
 */
export function formatTimeForForm(time: any, defaultValue: string = "12:00"): string {
    // Use the display formatter but provide a different default
    return formatTimeForDisplay(time, defaultValue);
}


/**
 * Converts Date objects to ISO strings in an object
 * @param obj Object potentially containing Date objects
 * @returns Same object with Date objects converted to strings
 */
export function convertDatesToStrings<T>(obj: T): any {
    if (!obj) return obj;

    if (isDate(obj)) {
        return (obj as Date).toISOString();
    }

    if (typeof obj !== "object") {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => convertDatesToStrings(item));
    }

    const result: Record<string, any> = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key as keyof typeof obj];
            result[key] = convertDatesToStrings(value);
        }
    }

    return result;
}

/**
 * Parses string dates back to Date objects
 * @param obj Object potentially containing date strings
 * @returns Same object with date strings converted to Date objects
 */
/**
 * Parses string dates back to Date objects
 * @param obj Object potentially containing date strings
 * @param excludeFields Fields to exclude from date parsing
 * @returns Same object with date strings converted to Date objects
 */
export function parseStringsToDates<T>(obj: T, excludeFields: string[] = []): any {
    if (!obj) return obj;

    if (typeof obj !== "object") {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => parseStringsToDates(item, excludeFields));
    }

    const result: Record<string, any> = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key as keyof typeof obj];

            // Skip parsing for excluded fields
            if (excludeFields.includes(key)) {
                result[key] = value;
                continue;
            }

            // Check if the value is a valid date string
            if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                const parsedDate = new Date(value);
                // Make sure the date is valid
                result[key] = isDate(parsedDate) ? parsedDate : value;
            } else {
                result[key] = parseStringsToDates(value, excludeFields);
            }
        }
    }

    return result;
}

/**
 * Format a date for display
 * Ensures date is properly handled with timezone considerations
 */
export function formatDisplayDate(date: Date | string | null | undefined): string {
    if (!date) return "Not set";

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (!isDate(dateObj)) return "Invalid date";

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(dateObj);
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Date error";
    }
}