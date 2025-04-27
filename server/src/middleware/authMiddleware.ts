import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "8ff36aae2c5efbdcd55f66c05e3f2d789d458ae98c976a2a4b4360a458e15d6b";

// Check if we're in development mode and if API testing is enabled
const isDev = process.env.NODE_ENV === "development";
const allowTestingWithoutAuth = isDev && process.env.ALLOW_API_TESTING === "true";

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check for test bypass header in development mode
        if (allowTestingWithoutAuth && req.headers["x-api-test"] === "bypass-auth") {
            console.warn("⚠️ Authentication bypassed for testing");

            // Set a default test user
            req.user = {
                id: 999,
                name: "Test User",
                email: "test@example.com",
            };

            return next();
        }

        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Authentication required" });
            return;
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

        // Find user by ID
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }

        // Check if user is active
        if (user.status === UserStatus.SUSPENDED) {
            res.status(403).json({ message: "Account suspended" });
            return;
        }

        if (user.status === UserStatus.DELETED) {
            res.status(401).json({ message: "Account no longer exists" });
            return;
        }

        if (!user.emailVerified) {
            res.status(403).json({ message: "Email not verified" });
            return;
        }

        // Attach user to request object (without password)
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
        };

        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ message: "Invalid or expired token" });
        return;
    }
};

// Optional authentication middleware - doesn't require auth but attaches user if token is valid
export const optionalAuthenticate = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        // Check for test bypass header in development mode
        if (allowTestingWithoutAuth && req.headers["x-api-test"] === "bypass-auth") {
            console.warn("⚠️ Authentication bypassed for testing");

            // Set a default test user
            req.user = {
                id: 999,
                name: "Test User",
                email: "test@example.com",
                status: UserStatus.ACTIVE,
            };

            return next();
        }

        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            // No token, but that's okay - continue without user
            return next();
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

        // Find user by ID
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (user && user.status !== UserStatus.DELETED && user.status !== UserStatus.SUSPENDED && user.emailVerified) {
            // Attach user to request object (without password)
            req.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                status: user.status,
            };
        }

        next();
    } catch (error) {
        // Token is invalid, but that's okay for optional auth - continue without user
        next();
    }
};

