// src/pages/DashboardNew.tsx
"use client"

import { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Apple, ChefHat, ShoppingCart, Package, Calendar, ArrowRight, Loader2, Utensils } from "lucide-react"
import { ingredientApi, categoryApi, unitApi, eventApi } from "../lib/api" // eventApi is imported
import { recipeService } from "../services/recipe-service"
import { RecipeCard } from "../components/recipe/RecipeCard"
import { safeMap, ensureArray } from "../utils/array-utils"
import { formatDate } from "@/utils/format-utils" 
// Import backend types
import type { Event } from "@server/types/event-types";
import type { Recipe } from "@server/types/recipe-types";

export function Dashboard() {
    // --- State ---
    const [stats, setStats] = useState({
        ingredientCount: 0,
        categoryCount: 0,
        unitCount: 0,
        recipeCount: 0, // This might need adjustment if API for total count is added
        eventCount: 0,
    });

    // --- Data Fetching ---
    const { data: ingredients = [], isLoading: ingredientsLoading } = useQuery<any[]>({ queryKey: ["dashboard-ingredients"], queryFn: () => ingredientApi.getAll({ limit: 0 } as any) });
    const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({ queryKey: ["dashboard-categories"], queryFn: categoryApi.getAll });
    const { data: units = [], isLoading: unitsLoading } = useQuery<any[]>({ queryKey: ["dashboard-units"], queryFn: unitApi.getAll });
    const { data: recipes = [], isLoading: recipesLoading } = useQuery<Recipe[]>({ queryKey: ["dashboard-recipes"], queryFn: () => recipeService.getAll({ limit: 3 } as any) });
    const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({ queryKey: ["dashboard-events"], queryFn: eventApi.getAll });

    // --- Update Stats ---
    useEffect(() => {
        // TODO: Get total recipe count from a dedicated endpoint or remove limit from getAll
        const totalRecipeCount = ensureArray(recipes).length; // Placeholder - ideally fetch total count
        setStats({
            ingredientCount: ensureArray(ingredients).length,
            categoryCount: ensureArray(categories).length,
            unitCount: ensureArray(units).length,
            recipeCount: totalRecipeCount, // Use total count when available
            eventCount: ensureArray(events).length,
        })
    }, [ingredients, categories, units, recipes, events]);

    const isLoading = ingredientsLoading || categoriesLoading || unitsLoading || recipesLoading || eventsLoading;

    // --- Render Logic ---
    if (isLoading) {
        return ( <div className="flex justify-center py-16"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div> );
    }

    const recipeArray = ensureArray(recipes); // Recent recipes for display
    const eventArray = ensureArray(events);
    const recentEvents = eventArray.sort((a, b) => new Date(b.eventStartDate).getTime() - new Date(a.eventStartDate).getTime()).slice(0, 3);

    // --- TSX ---
    return (
        <div className="container mx-auto py-10">
            {/* Header */}
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold tracking-tight">Retreat Meal Planner</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Streamline meal planning and ingredient management for your retreats
                </p>
            </div>

            {/* Main Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {/* Ingredients Card */}
                <Card className="overflow-hidden">
                    <div className="md:flex">
                        <div className="md:w-2/3 p-6">
                            <CardHeader className="px-0 pb-2"> <CardTitle className="text-2xl">Ingredients</CardTitle> <CardDescription>Database, categories & units</CardDescription> </CardHeader>
                            <CardContent className="px-0 py-4">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="bg-muted rounded-lg p-3 text-center"><div className="text-2xl font-bold">{stats.ingredientCount}</div><p className="text-xs text-muted-foreground">Items</p></div>
                                    <div className="bg-muted rounded-lg p-3 text-center"><div className="text-2xl font-bold">{stats.categoryCount}</div><p className="text-xs text-muted-foreground">Categories</p></div>
                                    <div className="bg-muted rounded-lg p-3 text-center"><div className="text-2xl font-bold">{stats.unitCount}</div><p className="text-xs text-muted-foreground">Units</p></div>
                                </div>
                                <p className="text-sm text-muted-foreground">Organize ingredients, track details, manage units.</p>
                            </CardContent>
                            <CardFooter className="px-0 pt-0"> <Link to="/ingredients" className="w-full md:w-auto"><Button className="w-full md:w-auto">Manage Ingredients <ArrowRight className="ml-2 h-4 w-4" /></Button></Link> </CardFooter>
                        </div>
                        <div className="md:w-1/3 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center p-6"> <div className="text-center"><Apple className="h-16 w-16 mx-auto text-primary mb-4" /><p className="font-medium">Core Inventory</p></div></div>
                    </div>
                </Card>

                {/* Recipes Card */}
                <Card className="overflow-hidden">
                     <div className="md:flex">
                        <div className="md:w-2/3 p-6">
                            <CardHeader className="px-0 pb-2"> <CardTitle className="text-2xl">Recipes</CardTitle> <CardDescription>Collection, creation & scaling</CardDescription> </CardHeader>
                            <CardContent className="px-0 py-4">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="bg-muted rounded-lg p-3 text-center"><div className="text-2xl font-bold">{stats.recipeCount}</div><p className="text-xs text-muted-foreground">Recipes</p></div>
                                    {/* Add more relevant recipe stats if available */}
                                    <div className="bg-muted rounded-lg p-3 text-center"><div className="text-2xl font-bold">-</div><p className="text-xs text-muted-foreground">Categories</p></div>
                                    <div className="bg-muted rounded-lg p-3 text-center"><div className="text-2xl font-bold">✓</div><p className="text-xs text-muted-foreground">Scaling</p></div>
                                </div>
                                <p className="text-sm text-muted-foreground">Build your library, add instructions, scale portions.</p>
                            </CardContent>
                            <CardFooter className="px-0 pt-0"> <Link to="/recipes" className="w-full md:w-auto"><Button className="w-full md:w-auto">Manage Recipes <ArrowRight className="ml-2 h-4 w-4" /></Button></Link> </CardFooter>
                        </div>
                        <div className="md:w-1/3 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center p-6"> <div className="text-center"><ChefHat className="h-16 w-16 mx-auto text-primary mb-4" /><p className="font-medium">Culinary Hub</p></div></div>
                    </div>
                </Card>
            </div>

            {/* Recent Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                {/* Recent Recipes */}
                {recipeArray.length > 0 && (
                     <div>
                        <div className="flex justify-between items-center mb-4"> <h2 className="text-2xl font-bold">Recent Recipes</h2> <Link to="/recipes"><Button variant="outline" size="sm">View All<ArrowRight className="ml-1 h-4 w-4" /></Button></Link> </div>
                        <div className="grid grid-cols-1 gap-4"> {safeMap(recipeArray.slice(0, 2), (recipe, index) => ( <RecipeCard key={recipe.id || index} recipe={recipe} showActions={false} /> ))} </div>
                     </div>
                )}
                {/* Recent Events */}
                {eventArray.length > 0 && (
                     <div>
                        <div className="flex justify-between items-center mb-4"> <h2 className="text-2xl font-bold">Upcoming / Recent Events</h2> <Link to="/events"><Button variant="outline" size="sm">View All<ArrowRight className="ml-1 h-4 w-4" /></Button></Link> </div>
                        <div className="space-y-3"> {recentEvents.map(event => ( <Card key={event.id}> <CardHeader className="p-3 flex flex-row justify-between items-center"><div><CardTitle className="text-sm font-medium leading-tight">{event.eventName}</CardTitle><CardDescription className="text-xs">{formatDate(event.eventStartDate)} - {formatDate(event.eventEndDate)}</CardDescription></div><Link to={`/events/${event.id}`}><Button variant="secondary" size="sm">Details</Button></Link></CardHeader> </Card> ))} </div>
                    </div>
                )}
            </div>

             {/* All Modules Section */}
            <h2 className="text-2xl font-bold mb-6">Modules</h2>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Ingredients Card */}
                <Card> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Ingredients</CardTitle><Apple className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">Active</div><p className="text-xs text-muted-foreground">Manage item database</p></CardContent><CardFooter><Link to="/ingredients" className="w-full"><Button className="w-full">Go to Ingredients</Button></Link></CardFooter> </Card>
                {/* Recipes Card */}
                <Card> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Recipes</CardTitle><ChefHat className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">Active</div><p className="text-xs text-muted-foreground">Create & scale meals</p></CardContent><CardFooter><Link to="/recipes" className="w-full"><Button className="w-full">Go to Recipes</Button></Link></CardFooter> </Card>
                {/* Events Card */}
                <Card> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Events</CardTitle><Calendar className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">Active</div><p className="text-xs text-muted-foreground">Retreats & schedules</p></CardContent><CardFooter><Link to="/events" className="w-full"><Button className="w-full">Go to Events</Button></Link></CardFooter> </Card>
                {/* Shopping Lists Card */}
                <Card className="opacity-60 hover:opacity-100 transition-opacity"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Shopping Lists</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">Coming Soon</div><p className="text-xs text-muted-foreground">Generate based on events</p></CardContent><CardFooter><Link to="/coming-soon" className="w-full"><Button className="w-full" variant="secondary">Learn More</Button></Link></CardFooter> </Card>
            </div>

            {/* Quick Actions */}
             <div className="mt-10">
                 <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                     <Card><CardHeader><CardTitle className="text-lg">Add New Recipe</CardTitle><CardDescription>Start drafting a new dish</CardDescription></CardHeader><CardFooter><Link to="/recipes/new" className="w-full"><Button variant="outline" className="w-full"><ChefHat className="mr-2 h-4 w-4" />Add Recipe</Button></Link></CardFooter></Card>
                     <Card><CardHeader><CardTitle className="text-lg">Add New Ingredient</CardTitle><CardDescription>Expand your inventory list</CardDescription></CardHeader><CardFooter><Link to="/ingredients/new" className="w-full"><Button variant="outline" className="w-full"><Apple className="mr-2 h-4 w-4" />Add Ingredient</Button></Link></CardFooter></Card>
                     <Card><CardHeader><CardTitle className="text-lg">Create New Event</CardTitle><CardDescription>Plan your next retreat</CardDescription></CardHeader><CardFooter><Link to="/events/new" className="w-full"><Button variant="outline" className="w-full"><Calendar className="mr-2 h-4 w-4" />Create Event</Button></Link></CardFooter></Card>
                </div>
            </div>

            {/* Future Features Preview (Keep as is or update text) */}
            <div className="mt-10 bg-muted/50 rounded-lg p-6 border">
                 <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
                 <p className="text-muted-foreground mb-6"> Features currently under active development:</p>
                 <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-3"><div className="bg-background rounded-full p-2 border"><Calendar className="h-5 w-5 text-primary" /></div><div><h3 className="font-medium text-sm">Meal Planning Interface</h3><p className="text-xs text-muted-foreground">Assign recipes to specific meals within events.</p></div></div>
                    <div className="flex items-center gap-3"><div className="bg-background rounded-full p-2 border"><Utensils className="h-5 w-5 text-primary" /></div><div><h3 className="font-medium text-sm">Daily Consumable Tracking</h3><p className="text-xs text-muted-foreground">Manage non-recipe items needed per day.</p></div></div>
                    <div className="flex items-center gap-3"><div className="bg-background rounded-full p-2 border"><ShoppingCart className="h-5 w-5 text-primary" /></div><div><h3 className="font-medium text-sm">Shopping List Generation</h3><p className="text-xs text-muted-foreground">Auto-generate lists based on event needs.</p></div></div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard; // Maintain default export