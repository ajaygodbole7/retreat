import { Link } from '@tanstack/react-router'
import { UtensilsCrossed } from 'lucide-react'
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
                            Home
                        </Link>
                        <Link
                            to="/ingredients"
                            className="hover:underline underline-offset-4"
                            activeProps={{ className: 'font-bold' }}
                        >
                            Ingredients
                        </Link>
                        <Link
                            to="/recipes"
                            className="hover:underline underline-offset-4"
                            activeProps={{ className: 'font-bold' }}
                        >
                            Recipes
                        </Link>
                        <Link
                            to="/meal-plans"
                            className="hover:underline underline-offset-4"
                            activeProps={{ className: 'font-bold' }}
                        >
                            Meal Plans
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    )
}