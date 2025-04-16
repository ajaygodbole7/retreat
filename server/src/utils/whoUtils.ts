/**
 * Utility functions for handling tracking fields in database operations
 */

/**
 * Adds creation tracking fields (createdBy, createdAt, lastUpdatedBy, updatedAt)
 * to any data object for database creation operations
 * 
 * @param data The input data object
 * @param userId The ID/username of the current user
 * @returns The input data enriched with tracking fields
 */
export function addCreationTracking<T extends Object>(data: T, userId?: string): T & {
    createdBy: string | null;
    createdAt: Date;
    lastUpdatedBy: string | null;
    updatedAt: Date;
} {
    const now = new Date();
    const username = userId || 'system';

    return {
        ...data,
        createdBy: username,
        createdAt: now,
        lastUpdatedBy: username, // Initially same as createdBy
        updatedAt: now           // Initially same as createdAt
    };
}

/**
 * Adds update tracking fields (lastUpdatedBy, updatedAt)
 * to any data object for database update operations
 * 
 * @param data The input data object
 * @param userId The ID/username of the current user
 * @returns The input data enriched with tracking fields
 */
export function addUpdateTracking<T extends Object>(data: T, userId?: string): T & {
    lastUpdatedBy: string | null;
    updatedAt: Date;
} {
    // Create a shallow copy to avoid modifying the original
    const result = { ...data };

    // If createdBy or createdAt were accidentally included, remove them
    if ('createdBy' in result) {
        delete (result as any).createdBy;
    }
    if ('createdAt' in result) {
        delete (result as any).createdAt;
    }

    // Add the update tracking fields with the provided userId
    const username = userId || 'system';
    (result as any).lastUpdatedBy = (result as any).lastUpdatedBy || username;
    (result as any).updatedAt = new Date();

    return result as any;
}

/**
 * Gets the current user ID from the request or a default value
 * 
 * @param req Express request object or user ID string
 * @returns User ID as a string
 */
export function getCurrentUserId(req: any): string {
    if (typeof req === 'string') {
        return req;
    }

    return req?.user?.username || 'system';
}