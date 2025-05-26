// src/components/ui/Navbar.tsx
import { Link, useNavigate } from '@tanstack/react-router';
import {
    UtensilsCrossed, Home, Package, CookingPot, Calendar, LogIn, LogOut, User, Loader2,
} from 'lucide-react';
//import blossomLogo from '@/assets/blossom-logo.png'; // Adjust path if needed
const blossomLogo = new URL('../../assets/blossom-logo.png', import.meta.url).href;
import { useAuth } from '@/contexts/auth-context'; // Ensure path is correct
import { Button } from './button'; // Use the Button component

export function Navbar() {
    // Get authentication state and functions from the AuthContext
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const navigate = useNavigate();

    // Function to handle logout action
    const handleLogout = () => {
        logout(); // Call the logout function from the context
        // Redirect to the login page after logging out
        navigate({ to: '/login', replace: true });
    };

    return (
        // Sticky header, hidden on print
        <header className="bg-primary text-primary-foreground shadow sticky top-0 z-40 print:hidden">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">

                    {/* Left Side: Logo and Application Title */}
                    <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                        <img
                            src={blossomLogo}
                            alt="Blossom Foundation Logo"
                            className="h-12 md:h-14"
                        />
                        <UtensilsCrossed className="h-5 w-5 hidden sm:block" />
                        <span className="text-lg md:text-xl font-bold hidden sm:block">
                            Retreat Meal Planner
                        </span>
                    </Link>

                    {/* Right Side: Navigation and Authentication Status */}
                    <div className="flex items-center gap-4 md:gap-6">

                        {/* Show loading indicator only during initial auth check */}
                        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}

                        {/* Show authenticated view if not loading and is authenticated */}
                        {!isLoading && isAuthenticated && (
                            <>
                                {/* Main Navigation Links */}
                                <nav className="hidden md:flex gap-4">
                                    {/* Use standard Links for navigation */}
                                    <Link to="/" className="text-sm hover:underline [&.active]:font-bold" activeProps={{ className: 'font-bold underline' }}> <Home className="inline h-4 w-4 mr-1" /> Dashboard </Link>
                                    <Link to="/ingredients" className="text-sm hover:underline [&.active]:font-bold" activeProps={{ className: 'font-bold underline' }}> <Package className="inline h-4 w-4 mr-1" /> Ingredients </Link>
                                    <Link to="/recipes" className="text-sm hover:underline [&.active]:font-bold" activeProps={{ className: 'font-bold underline' }}> <CookingPot className="inline h-4 w-4 mr-1" /> Recipes </Link>
                                    <Link to="/events" className="text-sm hover:underline [&.active]:font-bold" activeProps={{ className: 'font-bold underline' }}> <Calendar className="inline h-4 w-4 mr-1" /> Events </Link>
                                    {/* Add other main navigation links here */}
                                </nav>

                                {/* User information and Logout button */}
                                <div className="text-sm flex items-center gap-3">
                                    {/* Display username */}
                                    {user?.name && (
                                        <span className="text-sm hidden lg:flex items-center gap-1" title={user.email}>
                                            <User className=" text-sm inline h-4 w-4 mr-1" /> {user.name}
                                        </span>
                                    )}
                                    {/* Logout Link - Styled to match navigation links */}
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm flex items-center gap-1 text-primary-foreground hover:underline"
                                    >
                                        <LogOut className="text-sm inline h-4 w-4 mr-1" /> Logout
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Show unauthenticated view if not loading and not authenticated */}
                        {!isLoading && !isAuthenticated && (
                            <>
                                {/* Login Button - Renders as a Button wrapping a Link */}
                                {/* Explicitly AVOID asChild here to ensure Button renders the button tag */}
                                <Button variant="secondary" size="sm" asChild>
                                    <Link to="/login">
                                        <LogIn className="h-4 w-4 mr-1" /> Login
                                    </Link>
                                </Button>

                                {/* Registration Button - Renders as a Button wrapping a Link */}
                                {/* Explicitly AVOID asChild here */}
                                <Button variant="outline" size="sm" asChild>
                                    <Link to="/register">
                                        Sign Up
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}