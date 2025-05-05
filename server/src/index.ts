import dotenv from 'dotenv';
dotenv.config(); // Load variables from .env into process.env

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
//import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import addRequestId from 'express-request-id';

// Import Middleware and Utilities
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/authMiddleware';
import { logRequestResponseInfo } from './middleware/requestLogger';
import { configureSensitiveFields } from './utils/loggingUtils'; // Ensure path is correct


//Import Routes
import { ingredientRoutes } from './routes/ingredientRoutes';
import { categoryRoutes } from './routes/categoryRoutes';
import { unitRoutes } from './routes/unitRoutes';
import { recipeRoutes } from './routes/recipeRoutes';
import { eventRoutes } from './routes/eventRoutes';
import { menuRoutes } from './routes/menuRoutes';
import { scheduledMealRoutes } from './routes/scheduledMealRoutes';
import { shoppingListRoutes } from './routes/shoppingListRoutes';
import { authRoutes } from "./routes/authRoutes";


// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// development mode check and if API testing is enabled
const isDev = process.env.NODE_ENV === "development";
const allowTestingWithoutAuth = isDev && process.env.ALLOW_API_TESTING === "true";

// Configure Logging Utilities
configureSensitiveFields(process.env.LOGGING_EXTRA_SENSITIVE_FIELDS);

// Core Middleware
app.use(addRequestId());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(helmet());
app.use(compression());

// --- Standard HTTP Request Logging (Morgan - Summary) ---
// Define the 'id' token for Morgan HERE, close to where it's used.
//morgan.token('id', (req: any) => req.id || '-');
//app.use(morgan(':id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'));

// --- Body Parsing ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/// --- Detailed Request/Response Info Logging ---
// Place AFTER body parsers and AFTER standard morgan
app.use(logRequestResponseInfo); // Use the custom middleware



/// --- Session Setup ---
// (Session configuration as before)
if (process.env.NODE_ENV === 'production') {
    const PgSessionStore = pgSession(session);
    app.use(session({
        store: new PgSessionStore({ conString: process.env.DATABASE_URL, tableName: 'session', createTableIfMissing: true }),
        secret: process.env.SESSION_SECRET || 'fallback-prod-secret-change-me!',
        resave: false, saveUninitialized: false,
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, secure: true, httpOnly: true, sameSite: 'none' }
    }));
} else {
    const DevSessionStore = pgSession(session);
    app.use(session({
        store: new DevSessionStore({ conString: process.env.DATABASE_URL, tableName: 'session', createTableIfMissing: true }),
        secret: process.env.SESSION_SECRET || 'very-weak-dev-secret-session',
        resave: false, saveUninitialized: false,
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, secure: false, httpOnly: true, sameSite: 'lax' }
    }));
}


// --- Public Routes & Dev Info Routes ---
// Health check endpoint (Public)
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API testing info route (Public, only enabled in development)
if (allowTestingWithoutAuth) {
    app.get("/api/test-info", (_req, res) => {
        res.status(200).json({
            message: "API testing mode is enabled",
            instructions: "Add 'x-api-test: bypass-auth' header to bypass authentication",
            environment: process.env.NODE_ENV,
        });
    });
}

// Authentication routes (these handle their own protection/public status)
// e.g., /api/auth/login, /api/auth/register are public; /api/auth/me is protected internally
app.use('/api/auth', authRoutes);

// --- Apply Global Authentication Middleware ---
// All routes defined *after* this middleware under '/api' will require a valid JWT.
// The `authenticate` middleware checks for the token and attaches `req.user`.
app.use('/api', authenticate);

// Routes
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/scheduled-meals', scheduledMealRoutes);
app.use('/api', shoppingListRoutes);



// Error handling middleware
app.use(errorHandler);

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${ PORT }`);
    console.log(`Environment: ${ process.env.NODE_ENV }`);
    console.log(`Detailed Logging Enabled: ${ process.env.LOG_DETAILED_ENABLED === 'true' }`);
    console.log(` > Request Body Logging: ${ process.env.LOG_REQUEST_BODY_ENABLED === 'true' }`);
    if (!process.env.JWT_SECRET || !process.env.SESSION_SECRET || !process.env.DATABASE_URL) {
        console.error('❌ CRITICAL WARNING: One or more essential environment variables (JWT_SECRET, SESSION_SECRET, DATABASE_URL) are missing!');
    }
    if (allowTestingWithoutAuth) {
        console.warn('⚠️ API Testing Mode is ENABLED.');
    }
    // Removed app.use(morgan('dev')) from here
});

export default app;