// server/src/types/auth-types.ts

// User status enum - must match the Prisma enum
export enum UserStatus {
    PENDING_VERIFICATION = "PENDING_VERIFICATION",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    DELETED = "DELETED",
}

// User interface
export interface User {
    id: number
    name: string
    email: string
    status?: UserStatus
    emailVerified?: boolean
    lastLoginAt?: string | null
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string | null;
    lastUpdatedBy?: string | null;
}

// Authentication response
export interface AuthResponse {
    user: User
    token: string
}

// Message response
export interface MessageResponse {
    message: string
}

// Auth error response
export interface AuthErrorResponse {
    message: string
    errors?: any[]
    needsVerification?: boolean
}

// Registration input
export interface RegisterInput {
    name: string
    email: string
    password: string
}

// Login input
export interface LoginInput {
    email: string
    password: string
}

// Forgot password input
export interface ForgotPasswordInput {
    email: string
}

// Reset password input
export interface ResetPasswordInput {
    token: string
    password: string
}

// Verify email input
export interface VerifyEmailInput {
    token: string
}

// Resend verification input
export interface ResendVerificationInput {
    email: string
}
