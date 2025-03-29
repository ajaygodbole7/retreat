"use client"

import type React from "react"

import { Link, useRouter } from "@tanstack/react-router"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"
import {
    Home,
    Package,
    Utensils,
    ShoppingCart,
    Calendar,
    Settings,
    ChefHat,
    BookOpen,
    CookingPot,
    Soup,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { useState } from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const router = useRouter()
    const pathname = router.state.location.pathname
    const [recipesOpen, setRecipesOpen] = useState(pathname.startsWith("/recipes"))
    const [ingredientsOpen, setIngredientsOpen] = useState(pathname.startsWith("/ingredients"))

    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="mb-4 flex items-center px-4">
                        <CookingPot className="h-6 w-6 mr-2 text-primary" />
                        <h2 className="text-lg font-semibold tracking-tight">Retreat Meal Planner</h2>
                    </div>
                    <div className="space-y-1">
                        <Button variant={pathname === "/" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
                            <Link to="/">
                                <Home className="mr-2 h-4 w-4" />
                                Dashboard
                            </Link>
                        </Button>

                        <Collapsible open={recipesOpen} onOpenChange={setRecipesOpen} className="w-full">
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant={pathname.startsWith("/recipes") ? "secondary" : "ghost"}
                                    className="w-full justify-between group"
                                >
                                    <span className="flex items-center">
                                        <Utensils className="mr-2 h-4 w-4" />
                                        Recipes
                                    </span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={cn(
                                            "h-4 w-4 transition-transform duration-200",
                                            recipesOpen ? "rotate-180 transform" : "",
                                        )}
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pl-6 pt-1 space-y-1">
                                <Button
                                    variant={pathname === "/recipes" ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                    asChild
                                    size="sm"
                                >
                                    <Link to="/recipes">
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        All Recipes
                                    </Link>
                                </Button>
                                <Button
                                    variant={pathname === "/recipes/new" ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                    asChild
                                    size="sm"
                                >
                                    <Link to="/recipes/new">
                                        <ChefHat className="mr-2 h-4 w-4" />
                                        Create Recipe
                                    </Link>
                                </Button>
                            </CollapsibleContent>
                        </Collapsible>

                        <Collapsible open={ingredientsOpen} onOpenChange={setIngredientsOpen} className="w-full">
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant={pathname.startsWith("/ingredients") ? "secondary" : "ghost"}
                                    className="w-full justify-between group"
                                >
                                    <span className="flex items-center">
                                        <Package className="mr-2 h-4 w-4" />
                                        Ingredients
                                    </span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={cn(
                                            "h-4 w-4 transition-transform duration-200",
                                            ingredientsOpen ? "rotate-180 transform" : "",
                                        )}
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pl-6 pt-1 space-y-1">
                                <Button
                                    variant={pathname === "/ingredients" ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                    asChild
                                    size="sm"
                                >
                                    <Link to="/ingredients">
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        All Ingredients
                                    </Link>
                                </Button>
                                <Button
                                    variant={pathname === "/ingredients/new" ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                    asChild
                                    size="sm"
                                >
                                    <Link to="/ingredients/new">
                                        <Soup className="mr-2 h-4 w-4" />
                                        Add Ingredient
                                    </Link>
                                </Button>
                            </CollapsibleContent>
                        </Collapsible>

                        <Button variant="ghost" className="w-full justify-start" disabled>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Shopping Lists
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" disabled>
                            <Calendar className="mr-2 h-4 w-4" />
                            Events
                        </Button>
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Settings</h2>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start" disabled>
                            <Settings className="mr-2 h-4 w-4" />
                            System Settings
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}