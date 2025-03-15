import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { errorHandler } from './middleware/errorHandler';
import { ingredientRoutes } from './routes/ingredientRoutes';
import { categoryRoutes } from './routes/categoryRoutes';
import { unitRoutes } from './routes/unitRoutes';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session setup (for future authentication)
if (process.env.NODE_ENV === 'production') {
    const PgSessionStore = pgSession(session);
    app.use(session({
        store: new PgSessionStore({
            conString: process.env.DATABASE_URL,
            tableName: 'session'
        }),
        secret: process.env.SESSION_SECRET || 'development-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            secure: true,
            httpOnly: true,
            sameSite: 'none'
        }
    }));
} else {
    app.use(session({
        secret: process.env.SESSION_SECRET || 'development-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        }
    }));
}

// Routes
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/units', unitRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler as unknown as ErrorRequestHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});