import { z } from "zod"
import { UserStatus } from "@prisma/client"

// Base user schema (common fields)
export const userSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    status: z.nativeEnum(UserStatus),
    emailVerified: z.boolean(),
    lastLoginAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

// Schema for user registration
export const registerSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

// Schema for user login
export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
})

// Schema for password reset request
export const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
})

// Schema for password reset
export const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

// Schema for email verification
export const verifyEmailSchema = z.object({
    token: z.string(),
})

// Schema for resending verification email
export const resendVerificationSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
})

// Response schemas
export const authResponseSchema = z.object({
    user: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().email(),
        status: z.nativeEnum(UserStatus).optional(),
    }),
    token: z.string(),
})

export const messageResponseSchema = z.object({
    message: z.string(),
})

// Update the errorResponseSchema name and export type
export const authErrorResponseSchema = z.object({
    message: z.string(),
    errors: z.array(z.any()).optional(),
    needsVerification: z.boolean().optional(),
})

// Types derived from schemas
export type User = z.infer<typeof userSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
export type MessageResponse = z.infer<typeof messageResponseSchema>
export type AuthErrorResponse = z.infer<typeof authErrorResponseSchema>