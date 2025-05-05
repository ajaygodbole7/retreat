// src/types/express/index.d.ts

// Import the original Request type if needed for reference, though often not required for merging
// import { Request } from 'express';

// Use declaration merging to add the 'id' property to the Express Request interface
declare global {
    namespace Express {
        interface Request {
            id?: string; // Add the 'id' property, make it optional as it might not exist before the middleware runs
        }
    }
}

// You need to export something to make this file a module
// An empty export is sufficient.
export { };