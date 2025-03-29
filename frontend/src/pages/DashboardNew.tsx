"use client"

import { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Apple, ChefHat, ShoppingCart, Package, Calendar, ArrowRight, Loader2, Utensils } from "lucide-react"
import { ingredientApi, categoryApi, unitApi } from "../lib/api"
import { recipeService } from "../services/recipe-service"
import { RecipeCard } from "../components/recipe/RecipeCard"
import { safeMap, ensureArray } from "../utils/array-utils"

export function Dashboard() {
    const [stats, setStats] = useState({
        ingredientCount: 0,
        categoryCount: 0,
        unitCount: 0,
        recipeCount: 0,
    })

    // Fetch ingredients
    const { data: ingredients, isLoading: ingredientsLoading } = useQuery({
        queryKey: ["dashboard-ingredients"],
        queryFn: () => ingredientApi.getAll(),
    })

    // Fetch categories
    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ["dashboard-categories"],
        queryFn: () => categoryApi.getAll(),
    })

    // Fetch units
    const { data: units, isLoading: unitsLoading } = useQuery({
        queryKey: ["dashboard-units"],
        queryFn: () => unitApi.getAll(),
    })

    // Fetch recipes
    const { data: recipes, isLoading: recipesLoading } = useQuery({
        queryKey: ["dashboard-recipes"],
        queryFn: () => recipeService.getAll({ limit: 3 }),
    })

    // Update stats when data is loaded
    useEffect(() => {
        setStats({
            ingredientCount: ensureArray(ingredients).length,
            categoryCount: ensureArray(categories).length,
            unitCount: ensureArray(units).length,
            recipeCount: ensureArray(recipes).length,
        })
    }, [ingredients, categories, units, recipes])

    const isLoading = ingredientsLoading || categoriesLoading || unitsLoading || recipesLoading

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    // Ensure recipes is an array
    const recipeArray = ensureArray(recipes)

    return (
        <div className="container mx-auto py-10">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold tracking-tight">Retreat Recipe Manager</h1>
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
                            <CardHeader className="px-0">
                                <CardTitle className="text-2xl">Ingredient Management</CardTitle>
                                <CardDescription>Manage your ingredients database, categories, and measurement units</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0 py-4">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="bg-muted rounded-md p-3 text-center">
                                        <div className="text-2xl font-bold">{stats.ingredientCount}</div>
                                        <p className="text-xs text-muted-foreground">Ingredients</p>
                                    </div>
                                    <div className="bg-muted rounded-md p-3 text-center">
                                        <div className="text-2xl font-bold">{stats.categoryCount}</div>
                                        <p className="text-xs text-muted-foreground">Categories</p>
                                    </div>
                                    <div className="bg-muted rounded-md p-3 text-center">
                                        <div className="text-2xl font-bold">{stats.unitCount}</div>
                                        <p className="text-xs text-muted-foreground">Units</p>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Organize your ingredients by category, track nutritional information, and manage measurement
                                    conversions.
                                </p>
                            </CardContent>
                            <CardFooter className="px-0 pt-2">
                                <Link to="/ingredients" className="w-full md:w-auto">
                                    <Button className="w-full md:w-auto">
                                        Go to Ingredients
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </div>
                        <div className="md:w-1/3 bg-muted flex items-center justify-center p-6">
                            <div className="text-center">
                                <Apple className="h-16 w-16 mx-auto text-primary mb-4" />
                                <p className="font-medium">Ingredient Management</p>
                                <p className="text-sm text-muted-foreground mt-1">The foundation of your recipe system</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Recipes Card */}
                <Card className="overflow-hidden">
                    <div className="md:flex">
                        <div className="md:w-2/3 p-6">
                            <CardHeader className="px-0">
                                <CardTitle className="text-2xl">Recipe Collection</CardTitle>
                                <CardDescription>Create, organize, and scale recipes for your retreats</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0 py-4">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="bg-muted rounded-md p-3 text-center">
                                        <div className="text-2xl font-bold">{stats.recipeCount}</div>
                                        <p className="text-xs text-muted-foreground">Recipes</p>
                                    </div>
                                    <div className="bg-muted rounded-md p-3 text-center">
                                        <div className="text-2xl font-bold">7</div>
                                        <p className="text-xs text-muted-foreground">Categories</p>
                                    </div>
                                    <div className="bg-muted rounded-md p-3 text-center">
                                        <div className="text-2xl font-bold">∞</div>
                                        <p className="text-xs text-muted-foreground">Servings</p>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Build your recipe library with detailed instructions, ingredient lists, and automatic scaling for any
                                    group size.
                                </p>
                            </CardContent>
                            <CardFooter className="px-0 pt-2">
                                <Link to="/recipes" className="w-full md:w-auto">
                                    <Button className="w-full md:w-auto">
                                        Go to Recipes
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </div>
                        <div className="md:w-1/3 bg-muted flex items-center justify-center p-6">
                            <div className="text-center">
                                <ChefHat className="h-16 w-16 mx-auto text-primary mb-4" />
                                <p className="font-medium">Recipe Management</p>
                                <p className="text-sm text-muted-foreground mt-1">Create and scale recipes with ease</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Recipes Section */}
            {recipeArray.length > 0 && (
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Recent Recipes</h2>
                        <Link to="/recipes">
                            <Button variant="outline">
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {safeMap(recipeArray, (recipe, index) => (
                            <RecipeCard key={recipe.id || index} recipe={recipe} showActions={false} />
                        ))}
                    </div>
                </div>
            )}

            {/* All Modules Section */}
            <h2 className="text-2xl font-bold mb-6">All Modules</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingredients</CardTitle>
                        <Apple className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Active</div>
                        <p className="text-xs text-muted-foreground">Manage your ingredient database</p>
                    </CardContent>
                    <CardFooter>
                        <Link to="/ingredients" className="w-full">
                            <Button className="w-full">Go to Ingredients</Button>
                        </Link>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recipes</CardTitle>
                        <ChefHat className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Active</div>
                        <p className="text-xs text-muted-foreground">Create and manage recipes</p>
                    </CardContent>
                    <CardFooter>
                        <Link to="/recipes" className="w-full">
                            <Button className="w-full">Go to Recipes</Button>
                        </Link>
                    </CardFooter>
                </Card>

                <Card className="opacity-70">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Shopping Lists</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Coming Soon</div>
                        <p className="text-xs text-muted-foreground">Generate shopping lists</p>
                    </CardContent>
                    <CardFooter>
                        <Link to="/coming-soon" className="w-full">
                            <Button className="w-full">Preview</Button>
                        </Link>
                    </CardFooter>
                </Card>

                <Card className="opacity-70">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inventory</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Coming Soon</div>
                        <p className="text-xs text-muted-foreground">Track your inventory</p>
                    </CardContent>
                    <CardFooter>
                        <Link to="/coming-soon" className="w-full">
                            <Button className="w-full">Preview</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Add New Recipe</CardTitle>
                            <CardDescription>Create a new recipe in the database</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Link to="/recipes/new" className="w-full">
                                <Button variant="outline" className="w-full">
                                    <ChefHat className="mr-2 h-4 w-4" />
                                    Add Recipe
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Add New Ingredient</CardTitle>
                            <CardDescription>Create a new ingredient in the database</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Link to="/ingredients/new" className="w-full">
                                <Button variant="outline" className="w-full">
                                    <Apple className="mr-2 h-4 w-4" />
                                    Add Ingredient
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Browse Recipes</CardTitle>
                            <CardDescription>Explore your recipe collection</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Link to="/recipes" className="w-full">
                                <Button variant="outline" className="w-full">
                                    <Utensils className="mr-2 h-4 w-4" />
                                    Browse Recipes
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* Future Features Preview */}
            <div className="mt-10 bg-muted rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
                <p className="text-muted-foreground mb-6">
                    We're working on these exciting features to enhance your retreat meal planning experience:
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-3">
                        <div className="bg-background rounded-full p-2">
                            <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-medium">Meal Planning</h3>
                            <p className="text-xs text-muted-foreground">Plan meals for upcoming retreats</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-background rounded-full p-2">
                            <ChefHat className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-medium">Recipe Scaling</h3>
                            <p className="text-xs text-muted-foreground">Automatically scale recipes for any group size</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-background rounded-full p-2">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-medium">Automated Shopping</h3>
                            <p className="text-xs text-muted-foreground">Generate shopping lists from meal plans</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard