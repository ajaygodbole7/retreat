// src/controllers/authController.ts
import type { Request, Response, NextFunction } from "express"; // Import NextFunction
import { PrismaClient, UserStatus } from "@prisma/client";
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
    resendVerificationSchema
} from "../schemas/auth.schema";
import {
    hashPassword,
    generateSecureToken,
    generateToken,
    hashToken,
    verifyPassword
} from "../utils/auth-utils";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email";
import { parseBody } from "../utils/validateRequestUtils"; // Use validation utils
import { AppError } from "../middleware/errorHandler"; // Use AppError
import { HttpStatus } from "../constants/httpStatus";

const prisma = new PrismaClient(); // Keep instance


export const register = async (req: Request, res: Response, next: NextFunction) => { // Added next
    try {
        // Use parseBody which throws AppError on validation failure
        const { name, email, password } = parseBody(req, registerSchema);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            // Throw specific error for handler
            throw new AppError("Email already in use", HttpStatus.CONFLICT);
        }

        const hashedPassword = await hashPassword(password);

        // Use transaction for user and token creation
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: { name, email, password: hashedPassword, status: UserStatus.PENDING_VERIFICATION, emailVerified: false, createdBy: "register", lastUpdatedBy: "register" },
                select: { id: true, name: true, email: true } // Select only needed fields for response
            });

            const verificationToken = generateSecureToken();
            const hashedToken = hashToken(verificationToken);
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            await tx.passwordResetToken.create({
                data: { userId: newUser.id, token: hashedToken, expiresAt, createdBy: "register", lastUpdatedBy: "register" },
            });

            // Send email (handle potential error without failing registration)
            const verificationUrl = `${ process.env.CLIENT_URL || "http://localhost:3000" }/verify-email?token=${ verificationToken }`;
            try {
                await sendVerificationEmail(newUser.email, newUser.name, verificationUrl);
            } catch (emailError) {
                console.error(`Failed to send verification email to ${ newUser.email }:`, emailError);
                // Optionally: Log this failure more formally or queue retry
            }
            return newUser; // Return user data from transaction
        });

        res.status(HttpStatus.CREATED).json({
            message: "User registered successfully. Please verify your email.",
            user // Send back selected user fields
        });
    } catch (error) {
        next(error); // Pass error to central handler
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => { // Added next
    try {
        const { email, password } = parseBody(req, loginSchema);

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await verifyPassword(password, user.password))) {
            throw new AppError("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }
        if (user.status === UserStatus.SUSPENDED) { throw new AppError("Account suspended. Please contact support.", HttpStatus.FORBIDDEN); }
        if (user.status === UserStatus.DELETED) { throw new AppError("Account no longer exists.", HttpStatus.UNAUTHORIZED); }
        if (!user.emailVerified) {
            throw new AppError("Email not verified. Please check your email.", HttpStatus.FORBIDDEN); // Add custom payload
        }

        // Update last login time (don't need transaction for single update)
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date(), status: UserStatus.ACTIVE, lastUpdatedBy: "login" },
        });

        const token = generateToken(user.id);

        res.status(HttpStatus.OK).json({
            user: { id: user.id, name: user.name, email: user.email, status: UserStatus.ACTIVE }, // Return ACTIVE status
            token,
        });
    } catch (error) {
        next(error); // Pass error to central handler
    }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => { // Added next
    try {
        // req.user is attached by authenticate middleware
        if (!req.user) {
            throw new AppError("Authentication required", HttpStatus.UNAUTHORIZED); // Should technically not happen if authenticate middleware ran
        }

        // Return the user data attached by middleware (already verified)
        // Ensure middleware attaches all needed fields (id, name, email, status)
        res.status(HttpStatus.OK).json(req.user);
        return;

    } catch (error) {
        next(error); // Pass error to central handler
        return;
    }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => { // Added next
    try {
        const { email } = parseBody(req, forgotPasswordSchema);
        const user = await prisma.user.findUnique({ where: { email } });

        // Always return success message to prevent email enumeration
        const successMessage = "If your email is registered, you will receive a password reset link.";

        if (user && user.status !== UserStatus.DELETED && user.status !== UserStatus.SUSPENDED) {
            // Only proceed if user exists and is active/pending
            const resetToken = generateSecureToken();
            const hashedToken = hashToken(resetToken);
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

            await prisma.$transaction(async (tx) => {
                await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
                await tx.passwordResetToken.create({ data: { userId: user.id, token: hashedToken, expiresAt, createdBy: "forgot-password", lastUpdatedBy: "forgot-password" } });
            });

            const resetUrl = `${ process.env.CLIENT_URL || "http://localhost:3000" }/reset-password?token=${ resetToken }`;
            try {
                await sendPasswordResetEmail(user.email, user.name, resetUrl);
            } catch (emailError) {
                console.error(`Failed to send password reset email to ${ user.email }:`, emailError);
                // Log but don't reveal failure to user
            }
        } else {
            console.log(`Forgot password request for non-existent or inactive user: ${ email }`);
        }

        res.status(HttpStatus.OK).json({ message: successMessage });
    } catch (error) {
        next(error); // Pass error to central handler
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => { // Added next
    try {
        const { token, password } = parseBody(req, resetPasswordSchema);
        const hashedToken = hashToken(token);

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token: hashedToken },
            include: { user: true }, // Include user to check status
        });

        if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
            throw new AppError("Invalid or expired password reset token.", HttpStatus.BAD_REQUEST);
        }
        if (!resetToken.user || resetToken.user.status === UserStatus.DELETED || resetToken.user.status === UserStatus.SUSPENDED) {
            throw new AppError("Cannot reset password for this account.", HttpStatus.BAD_REQUEST);
        }

        const hashedPassword = await hashPassword(password);

        await prisma.$transaction(async (tx) => {
            // Update user password and status/verification
            await tx.user.update({
                where: { id: resetToken.userId },
                data: {
                    password: hashedPassword,
                    lastUpdatedBy: "password-reset",
                    status: UserStatus.ACTIVE, // Activate account on password reset
                    emailVerified: true,       // Assume password reset verifies email intent
                },
            });
            // Mark token as used
            await tx.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { usedAt: new Date(), lastUpdatedBy: "password-reset" },
            });
        });

        res.status(HttpStatus.OK).json({ message: "Password has been reset successfully." });
    } catch (error) {
        next(error); // Pass error to central handler
    }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => { // Added next
    try {
        const { token } = parseBody(req, verifyEmailSchema);
        const hashedToken = hashToken(token);

        const verificationToken = await prisma.passwordResetToken.findUnique({
            where: { token: hashedToken },
            include: { user: true },
        });

        if (!verificationToken || verificationToken.usedAt || verificationToken.expiresAt < new Date()) {
            throw new AppError("Invalid or expired verification link.", HttpStatus.BAD_REQUEST);
        }
        if (!verificationToken.user || verificationToken.user.status === UserStatus.DELETED || verificationToken.user.status === UserStatus.SUSPENDED) {
            throw new AppError("Cannot verify email for this account.", HttpStatus.BAD_REQUEST);
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: verificationToken.userId },
                data: {
                    status: UserStatus.ACTIVE,
                    emailVerified: true,
                    lastUpdatedBy: "email-verification",
                },
            });
            await tx.passwordResetToken.update({
                where: { id: verificationToken.id },
                data: { usedAt: new Date(), lastUpdatedBy: "email-verification" },
            });
        });

        res.status(HttpStatus.OK).json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
        next(error); // Pass error to central handler
    }
};

export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = parseBody(req, resendVerificationSchema);
        const user = await prisma.user.findUnique({ where: { email } });

        const successMessage = "If your email is registered and requires verification, a new link has been sent.";

        if (!user || user.emailVerified || user.status === UserStatus.DELETED || user.status === UserStatus.SUSPENDED) {
            // Don't reveal if user exists or is already verified/inactive
            res.status(HttpStatus.OK).json({ message: successMessage });
            return; // Add explicit return to exit the function
        }

        // At this point we know user exists and is not null
        // Generate new token
        const verificationToken = generateSecureToken();
        const hashedToken = hashToken(verificationToken);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await prisma.$transaction(async (tx) => {
            await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
            await tx.passwordResetToken.create({ data: { userId: user.id, token: hashedToken, expiresAt, createdBy: "resend-verification", lastUpdatedBy: "resend-verification" } });
        });

        const verificationUrl = `${ process.env.CLIENT_URL || "http://localhost:3000" }/verify-email?token=${ verificationToken }`;
        try {
            await sendVerificationEmail(user.email, user.name, verificationUrl);
        } catch (emailError) {
            console.error(`Failed to resend verification email to ${ user.email }:`, emailError);
            // Log but still return success to user
        }

        res.status(HttpStatus.OK).json({ message: successMessage });
    } catch (error) {
        next(error);
    }
};


// DEVELOPMENT ONLY: Endpoint to verify users directly
export const devVerifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Only allow in development mode
        if (process.env.NODE_ENV !== 'development') {
            throw new AppError("This endpoint is only available in development mode", HttpStatus.FORBIDDEN);
        }

        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            throw new AppError("Invalid user ID", HttpStatus.BAD_REQUEST);
        }

        // Update user to verified status
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                emailVerified: true,
                status: UserStatus.ACTIVE,
                lastUpdatedBy: 'dev-verify-endpoint'
            }
        });

        if (!user) {
            throw new AppError("User not found", HttpStatus.NOT_FOUND);
        }

        res.status(HttpStatus.OK).json({
            message: `User ID ${ userId } verified for development purposes`,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                status: user.status
            }
        });
    } catch (error) {
        next(error);
    }
};