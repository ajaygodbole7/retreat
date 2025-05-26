"use client"

import { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ScrollArea } from "../components/ui/scroll-area"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import {
    Apple,
    ChefHat,
    ShoppingCart,
    Calendar,
    ArrowRight,
    Loader2,
    PlusCircle,
    BarChart3,
    Clock,
    Users,
    ListChecks,
} from "lucide-react"
import { ingredientApi, categoryApi, unitApi, eventApi } from "../lib/api"
import { recipeService } from "../services/recipe-service"
import { RecipeCard } from "../components/recipe/RecipeCard"
import { safeMap, ensureArray } from "../utils/array-utils"
import { formatDate } from "@/utils/format-utils"

// Import backend types
import type { Event } from "@server/types/event-types"
import type { Recipe } from "@server/types/recipe-types"

export function Dashboard() {
    // --- State ---
    const [stats, setStats] = useState({
        ingredientCount: 0,
        categoryCount: 0,
        unitCount: 0,
        recipeCount: 0,
        eventCount: 0,
    })

    // --- Data Fetching ---
    const { data: ingredients = [], isLoading: ingredientsLoading } = useQuery<any[]>({
        queryKey: ["dashboard-ingredients"],
        queryFn: () => ingredientApi.getAll({ limit: 0 } as any),
    })

    const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({
        queryKey: ["dashboard-categories"],
        queryFn: categoryApi.getAll,
    })

    const { data: units = [], isLoading: unitsLoading } = useQuery<any[]>({
        queryKey: ["dashboard-units"],
        queryFn: unitApi.getAll,
    })

    const { data: recipes = [], isLoading: recipesLoading } = useQuery<Recipe[]>({
        queryKey: ["dashboard-recipes"],
        queryFn: () => recipeService.getAll({ limit: 6 } as any),
    })

    const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
        queryKey: ["dashboard-events"],
        queryFn: eventApi.getAll,
    })

    // --- Update Stats ---
    useEffect(() => {
        setStats({
            ingredientCount: ensureArray(ingredients).length,
            categoryCount: ensureArray(categories).length,
            unitCount: ensureArray(units).length,
            recipeCount: ensureArray(recipes).length,
            eventCount: ensureArray(events).length,
        })
    }, [ingredients, categories, units, recipes, events])

    const isLoading = ingredientsLoading || categoriesLoading || unitsLoading || recipesLoading || eventsLoading

    // --- Render Logic ---
    if (isLoading) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    const recipeArray = ensureArray(recipes)
    const eventArray = ensureArray(events)
    const upcomingEvents = eventArray
        .filter((event) => new Date(event.eventStartDate) >= new Date())
        .sort((a, b) => new Date(a.eventStartDate).getTime() - new Date(b.eventStartDate).getTime())
        .slice(0, 5)

    const recentEvents = eventArray
        .sort((a, b) => new Date(b.eventStartDate).getTime() - new Date(a.eventStartDate).getTime())
        .slice(0, 5)

    // --- TSX ---
    return (
        <div className="flex-1 space-y-8 p-8 pt-6">

            <Tabs defaultValue="overview" className="space-y-4">

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4">
                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.eventCount}</div>
                                <p className="text-xs text-muted-foreground">{upcomingEvents.length} upcoming</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Recipes</CardTitle>
                                <ChefHat className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.recipeCount}</div>
                                <p className="text-xs text-muted-foreground">Ready to use in events</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ingredients</CardTitle>
                                <Apple className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.ingredientCount}</div>
                                <p className="text-xs text-muted-foreground">Across {stats.categoryCount} categories</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Units</CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.unitCount}</div>
                                <p className="text-xs text-muted-foreground">Measurement units</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Create New Event</CardTitle>
                                <CardDescription>Plan your next retreat with meals and shopping lists</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="flex items-center space-x-2 rounded-md bg-muted p-3">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Quick event setup</p>
                                        <p className="text-sm text-muted-foreground">Define dates, attendees, and meals</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link to="/events/new" className="w-full">
                                    <Button className="w-full">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Create Event
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Add New Recipe</CardTitle>
                                <CardDescription>Expand your recipe collection for events</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="flex items-center space-x-2 rounded-md bg-muted p-3">
                                    <ChefHat className="h-5 w-5 text-primary" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Recipe builder</p>
                                        <p className="text-sm text-muted-foreground">Add ingredients, instructions, and portions</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link to="/recipes/new" className="w-full">
                                    <Button className="w-full">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Recipe
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Generate Shopping List</CardTitle>
                                <CardDescription>Create shopping lists based on event needs</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="flex items-center space-x-2 rounded-md bg-muted p-3">
                                    <ShoppingCart className="h-5 w-5 text-primary" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Automated lists</p>
                                        <p className="text-sm text-muted-foreground">Based on recipes and attendees</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link to="/shopping-lists/new" className="w-full">
                                    <Button className="w-full" variant="outline">
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Generate List
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Recent Events */}
                        <Card className="col-span-1">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Events</CardTitle>
                                    <Link to="/events">
                                        <Button variant="ghost" size="sm" className="h-8 gap-1">
                                            View all
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[280px]">
                                    <div className="space-y-4">
                                        {recentEvents.length > 0 ? (
                                            recentEvents.map((event) => (
                                                <div key={event.id} className="flex items-center justify-between space-x-4">
                                                    <div className="flex items-center space-x-4">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                {event.eventName.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium leading-none">{event.eventName}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {formatDate(event.eventStartDate)} - {formatDate(event.eventEndDate)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Link to={`/events/${ event.id }`}>
                                                        <Button variant="ghost" size="sm">
                                                            Details
                                                        </Button>
                                                    </Link>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No recent events found.</p>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* Recent Recipes */}
                        <Card className="col-span-1">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Recipes</CardTitle>
                                    <Link to="/recipes">
                                        <Button variant="ghost" size="sm" className="h-8 gap-1">
                                            View all
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[280px]">
                                    <div className="space-y-4">
                                        {recipeArray.length > 0 ? (
                                            recipeArray.slice(0, 5).map((recipe, index) => (
                                                <div key={recipe.id || index} className="flex items-center justify-between space-x-4">
                                                    <div className="flex items-center space-x-4">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                {recipe.name ? recipe.name.substring(0, 2).toUpperCase() : "R"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium leading-none">{recipe.name}</p>
                                                            <p className="text-sm text-muted-foreground">{recipe.servingSize || 0} servings</p>
                                                        </div>
                                                    </div>
                                                    <Link to={`/recipes/${ recipe.id }`}>
                                                        <Button variant="ghost" size="sm">
                                                            View
                                                        </Button>
                                                    </Link>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No recipes found.</p>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* EVENTS TAB */}
                <TabsContent value="events" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Manage Events</h3>
                        <Link to="/events/new">
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create Event
                            </Button>
                        </Link>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Events</CardTitle>
                            <CardDescription>Events scheduled in the future</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 border-b pb-4 last:border-0 last:pb-0"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                    <p className="text-sm font-medium">{event.eventName}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(event.eventStartDate)} - {formatDate(event.eventEndDate)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">
                                                        {event.defaultAttendeeCount + event.defaultVolunteerCount} people ({event.defaultAttendeeCount} attendees, {event.defaultVolunteerCount} volunteers)
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Link to={`/events/${ event.id }/shopping-list`}>
                                                    <Button variant="outline" size="sm">
                                                        <ShoppingCart className="mr-2 h-3.5 w-3.5" />
                                                        Shopping List
                                                    </Button>
                                                </Link>
                                                <Link to={`/events/${ event.id }`}>
                                                    <Button size="sm">Manage</Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
                                    <div className="flex flex-col items-center space-y-2 text-center">
                                        <Calendar className="h-10 w-10 text-muted-foreground" />
                                        <h3 className="text-sm font-medium">No upcoming events</h3>
                                        <p className="text-xs text-muted-foreground">Create your first event to get started</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Link to="/events" className="w-full">
                                <Button variant="outline" className="w-full">
                                    View All Events
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* RECIPES TAB */}
                <TabsContent value="recipes" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Recipe Collection</h3>
                        <Link to="/recipes/new">
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Recipe
                            </Button>
                        </Link>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {recipeArray.length > 0 ? (
                            safeMap(recipeArray.slice(0, 6), (recipe, index) => (
                                <RecipeCard key={recipe.id || index} recipe={recipe} showActions={true} />
                            ))
                        ) : (
                            <div className="col-span-full flex h-[200px] items-center justify-center rounded-md border border-dashed">
                                <div className="flex flex-col items-center space-y-2 text-center">
                                    <ChefHat className="h-10 w-10 text-muted-foreground" />
                                    <h3 className="text-sm font-medium">No recipes found</h3>
                                    <p className="text-xs text-muted-foreground">Add your first recipe to get started</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <Link to="/recipes">
                            <Button variant="outline">
                                View All Recipes
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </TabsContent>

                {/* SHOPPING LISTS TAB */}
                <TabsContent value="shopping" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Shopping Lists</h3>
                        <Link to="/shopping-lists/new">
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Generate List
                            </Button>
                        </Link>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Event Shopping Lists</CardTitle>
                            <CardDescription>Generate and manage shopping lists for your events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingEvents.slice(0, 3).map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 border-b pb-4 last:border-0 last:pb-0"
                                        >
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{event.eventName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(event.eventStartDate)} - {formatDate(event.eventEndDate)}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Link to={`/events/${ event.id }/shopping-list`}>
                                                    <Button variant="outline" size="sm">
                                                        <ListChecks className="mr-2 h-3.5 w-3.5" />
                                                        View List
                                                    </Button>
                                                </Link>
                                                <Link to={`/events/${ event.id }/shopping-list/edit`}>
                                                    <Button size="sm">
                                                        <ShoppingCart className="mr-2 h-3.5 w-3.5" />
                                                        Generate
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
                                    <div className="flex flex-col items-center space-y-2 text-center">
                                        <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                                        <h3 className="text-sm font-medium">No events to generate lists for</h3>
                                        <p className="text-xs text-muted-foreground">Create an event first to generate shopping lists</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <p className="text-sm text-muted-foreground">
                                Shopping lists are generated based on recipes and attendees
                            </p>
                            <Link to="/shopping-lists">
                                <Button variant="outline" size="sm">
                                    View All Lists
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>How Shopping Lists Work</CardTitle>
                            <CardDescription>Quick guide to generating and managing shopping lists</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                        <Calendar className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium">1. Create an Event</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Set up your event with dates and number of attendees
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                        <ChefHat className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium">2. Assign Recipes</h4>
                                        <p className="text-sm text-muted-foreground">Add recipes to your event for each meal</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                        <ShoppingCart className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium">3. Generate Shopping List</h4>
                                        <p className="text-sm text-muted-foreground">
                                            System calculates quantities based on recipes and attendees
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                        <ListChecks className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium">4. Manage Your List</h4>
                                        <p className="text-sm text-muted-foreground">Edit, print, or export your shopping list</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default Dashboard