/**
 * Safely converts a value to an array
 * @param value The value to convert to an array
 * @returns An array, or an empty array if the value is not an array
 */
export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
    if (Array.isArray(value)) {
        return value;
    }

    if (value === null || value === undefined) {
        return [];
    }

    // If it's a single item, wrap it in an array
    return [value as T];
}

/**
 * Safely maps over an array, handling cases where the input might not be an array
 * @param array The array to map over
 * @param mapFn The mapping function
 * @returns The mapped array, or an empty array if the input is not an array
 */
export function safeMap<T, R>(
    array: T | T[] | null | undefined,
    mapFn: (item: T, index: number) => R
): R[] {
    const safeArray = ensureArray(array);
    return safeArray.map(mapFn);
}