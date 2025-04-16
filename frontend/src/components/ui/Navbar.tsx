import { Link } from '@tanstack/react-router'
import { UtensilsCrossed, Home, Package,CookingPot, Calendar } from 'lucide-react'
import blossomLogo from '@/assets/blossom-logo.png'

export function Navbar() {
    return (
        <header className="bg-primary text-primary-foreground shadow">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 -ml-2">
                        <div className="flex items-center">
                            <img
                                src={blossomLogo}
                                alt="Blossom Foundation Logo"
                                className="h-16 mr-4"
                            />
                            <UtensilsCrossed className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-bold">Retreat Meal Planner</span>
                    </div>
                    <nav className="flex gap-6">
                        <Link
                            to="/"
                            className="hover:underline underline-offset-4"
                            activeProps={{ className: 'font-bold' }}
                        >
                            <Home className="h-4 w-4" /> Home
                        </Link>
                        <Link
                            to="/ingredients"
                            className="hover:underline underline-offset-4"
                            activeProps={{ className: 'font-bold' }}
                        >
                           <Package className="h-4 w-4" />  Ingredients
                        </Link>
                        <Link
                            to="/recipes"
                            className="hover:underline underline-offset-4"
                            activeProps={{ className: 'font-bold' }}
                        >
                           <CookingPot className="h-4 w-4" /> Recipes
                        </Link>
                        <Link
                            to="/events"
                            className="flex items-center gap-1 hover:underline underline-offset-4 [&.active]:font-bold [&.active]:underline"
                            activeProps={{ className: 'font-bold underline' }}
                        >
                            <Calendar className="h-4 w-4" /> Events
                        </Link>
                        <Link
                            to="/meal-plans" // Link to the placeholder route
                            className="flex items-center gap-1 hover:underline underline-offset-4 [&.active]:font-bold [&.active]:underline"
                            activeProps={{ className: 'font-bold underline' }}
                        >
                            {/* Consider a different icon for Meal Plans */}
                            <Calendar className="h-4 w-4" />
                            Meal Plans
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    )
}