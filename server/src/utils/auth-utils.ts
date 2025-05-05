import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";


// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || "get lost";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "24h"; // 24 hours

if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET environment variable is not set.");
    // Crash prevents insecure operation
    throw new Error("JWT_SECRET environment variable is missing. Cannot start server.");
}
/**
 * Generates a JWT token for a user
 * @param userId The user ID to include in the token
 * @returns A signed JWT token
 */
export function generateToken(userId: number): string {
    // @ts-expect-error - TS Compiler cannot infer JWT_SECRET is string despite runtime check.
    return jwt.sign(
        { id: userId.toString() },
        JWT_SECRET!,
        { expiresIn: JWT_EXPIRY }
    );
}

/**
 * Hashes a token for secure storage
 * @param token The plain token
 * @returns A hashed token
 */
export function hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a secure random token
 * @returns A random hex token
 */
export function generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Hashes a password using bcrypt
 * @param password The plain password
 * @returns A promise resolving to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

/**
 * Verifies a password against a hash
 * @param plainPassword The plain password
 * @param hashedPassword The hashed password
 * @returns A promise resolving to true if the password matches
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
}