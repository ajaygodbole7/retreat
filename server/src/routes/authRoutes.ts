// src/routes/authRoutes.ts

import express from "express";
import {
    register,
    login,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    getCurrentUser
} from "../controllers/authController"; // Correct controller import
import { authenticate } from "../middleware/authMiddleware"; // Correct middleware import
import { validateRequest } from "../middleware/validateRequest"; // Import validation middleware
import { // Import relevant Zod schemas
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
    resendVerificationSchema
} from "../schemas/auth.schema";

const router = express.Router();

// Public routes with input validation
router.post("/register", validateRequest({ body: registerSchema }), register);
router.post("/login", validateRequest({ body: loginSchema }), login);
router.post("/forgot-password", validateRequest({ body: forgotPasswordSchema }), forgotPassword);
router.post("/reset-password", validateRequest({ body: resetPasswordSchema }), resetPassword);
router.post("/verify-email", validateRequest({ body: verifyEmailSchema }), verifyEmail);
router.post("/resend-verification", validateRequest({ body: resendVerificationSchema }), resendVerification);

// Protected routes (Uses auth middleware first)
router.get("/me", authenticate, getCurrentUser); // No input validation needed here beyond auth

export { router as authRoutes };