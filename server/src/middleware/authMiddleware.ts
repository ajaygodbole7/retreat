// src/middleware/authMiddleware.ts

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient, UserStatus } from "@prisma/client";
import { AppError } from "./errorHandler"; // Import AppError for consistency
import { HttpStatus } from "../constants/httpStatus"; // Import HttpStatus

const prisma = new PrismaClient();

// --- Define a more specific type for the decoded JWT payload ---
interface JwtPayload {
    // Allow id to be string or number as returned by jwt.verify
    id: string | number;
    // Add other standard claims if needed (iat, exp, etc.)
    iat?: number;
    exp?: number;
}

// Extend Express Request type to include a potentially typed user object
declare global {
    namespace Express {
        interface Request {
            // Use a specific type for user if available, otherwise 'any' is acceptable here short-term
            user?: {
                id: number;
                name: string;
                email: string;
                status: UserStatus;
            } | any; // Use 'any' or define a proper User type consistent with your app
        }
    }
}

// --- Load JWT Secret with Runtime Check ---
// Ensure this check exists to prevent running with undefined secret
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET environment variable is not set in authMiddleware.");
    throw new Error("JWT_SECRET environment variable is missing.");
}

// Development mode checks
const isDev = process.env.NODE_ENV === "development";
const allowTestingWithoutAuth = isDev && process.env.ALLOW_API_TESTING === "true";

// --- Authentication Middleware ---
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        // --- Test Bypass Header ---
        if (allowTestingWithoutAuth && req.headers["x-api-test"] === "bypass-auth") {
            console.warn("⚠️ Authentication bypassed via x-api-test header.");
            // Set a default test user (ensure this matches expected structure if possible)
            req.user = {
                id: 999,
                name: "Test User (Bypass)",
                email: "test-bypass@example.com",
                status: UserStatus.ACTIVE, // Add status for consistency
            };
            return next(); // Skip further auth checks
        }

        // --- Token Extraction ---
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            // Use next(error) for standard error handling flow
            return next(new AppError("Authentication required: No token provided.", HttpStatus.UNAUTHORIZED));
        }
        const token = authHeader.split(" ")[1];

        // --- Token Verification and Decoding ---
        let decoded: JwtPayload;
        try {
            // Verify the token signature and expiry
            decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        } catch (error: any) {
            console.error("JWT Verification Error:", error.message);
            // Handle specific JWT errors (expired, invalid signature)
            const message = error.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.';
            return next(new AppError(`Authentication failed: ${ message }`, HttpStatus.UNAUTHORIZED));
        }

        // --- Payload Validation and ID Parsing ---
        if (!decoded || typeof decoded.id === 'undefined') {
            console.error("Authentication error: Invalid token payload structure (missing id).", decoded);
            return next(new AppError("Authentication failed: Invalid token payload.", HttpStatus.UNAUTHORIZED));
        }
        // Convert decoded id to string first (safer for parseInt) then parse
        const userIdString = String(decoded.id);
        const userId = parseInt(userIdString, 10); // Ensure base-10 parsing

        // Check if parsing resulted in a valid integer
        if (isNaN(userId)) {
            console.error(`Authentication error: Invalid user ID format in token ('${ decoded.id }').`);
            return next(new AppError("Authentication failed: Invalid user identifier in token.", HttpStatus.UNAUTHORIZED));
        }

        // --- User Lookup ---
        const user = await prisma.user.findUnique({
            where: { id: userId }, // Use the PARSED INTEGER ID
        });

        // --- User Validation ---
        if (!user) {
            // User specified in token doesn't exist
            return next(new AppError("Authentication failed: User not found.", HttpStatus.UNAUTHORIZED));
        }
        if (user.status === UserStatus.SUSPENDED) {
            return next(new AppError("Account suspended. Please contact support.", HttpStatus.FORBIDDEN));
        }
        if (user.status === UserStatus.DELETED) {
            return next(new AppError("Account no longer exists.", HttpStatus.UNAUTHORIZED)); // Treat deleted as unauthorized
        }
        if (!user.emailVerified) {
            // Consider if email verification is strictly required for ALL authenticated routes
            // If some routes allow unverified users, move this check elsewhere or make it conditional
            return next(new AppError("Email not verified. Please check your email.", HttpStatus.FORBIDDEN));
        }

        // --- Attach User to Request ---
        // Attach a user object *without* the password hash
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
        };

        // Proceed to the next middleware/route handler
        next();

    } catch (error) {
        // Catch unexpected errors during the middleware execution
        console.error("Unexpected Authentication Middleware Error:", error);
        // Pass to the central error handler
        next(new AppError("Internal authentication error.", HttpStatus.INTERNAL_SERVER_ERROR));
    }
};

// --- Optional Authentication Middleware ---
// Attaches req.user if token is valid, but doesn't fail if token is missing/invalid
export const optionalAuthenticate = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        // --- Test Bypass Header ---
        if (allowTestingWithoutAuth && req.headers["x-api-test"] === "bypass-auth") {
            console.warn("⚠️ Optional Authentication bypassed via x-api-test header.");
            req.user = {
                id: 999,
                name: "Test User (Optional Bypass)",
                email: "test-opt-bypass@example.com",
                status: UserStatus.ACTIVE,
            };
            return next();
        }

        // --- Token Extraction ---
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            // No token provided, which is okay for optional auth. Proceed without user.
            return next();
        }
        const token = authHeader.split(" ")[1];

        // --- Token Verification and Decoding ---
        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        } catch (error) {
            // Invalid or expired token is okay here. Proceed without user.
            console.warn("Optional Auth: Invalid/Expired token encountered.", (error as Error).message);
            return next();
        }

        // --- Payload Validation and ID Parsing ---
        if (!decoded || typeof decoded.id === 'undefined') {
            console.warn("Optional Auth: Invalid token payload structure.");
            return next(); // Proceed without user
        }
        const userIdString = String(decoded.id);
        const userId = parseInt(userIdString, 10);
        if (isNaN(userId)) {
            console.warn(`Optional Auth: Invalid user ID format in token ('${ decoded.id }').`);
            return next(); // Proceed without user
        }

        // --- User Lookup and Validation ---
        const user = await prisma.user.findUnique({
            where: { id: userId }, // Use the PARSED INTEGER ID
        });

        // Attach user ONLY IF found and active/verified
        if (user && user.status !== UserStatus.DELETED && user.status !== UserStatus.SUSPENDED && user.emailVerified) {
            req.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                status: user.status,
            };
            console.log("Optional Auth: User attached -", user.name);
        } else {
            // User not found, suspended, deleted, or not verified. Proceed without attaching user.
            console.log("Optional Auth: User found but not attached due to status/verification.");
        }

        // Proceed to the next middleware/route handler
        next();

    } catch (error) {
        // Catch unexpected errors during the *optional* middleware execution
        console.error("Unexpected Optional Authentication Middleware Error:", error);
        // Still proceed, but log the error. Don't block the request.
        next();
    }
};