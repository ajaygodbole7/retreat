// frontend/src/pages/ingredients-dashboard.tsx
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Apple, Carrot, Wheat, Leaf, Filter, Plus, Loader2 } from 'lucide-react'
import { ingredientApi, categoryApi } from '../lib/api'
import { useState, useEffect } from "react"

export function IngredientsDashboardPage() {
    const [stats, setStats] = useState({
        totalCount: 0,
        categoryCount: 0,
        topCategories: [] as { id: string, name: string, count: number, icon: React.ReactNode }[],
        recentIngredients: [] as any[]
    })

    // Fetch ingredients
    const { data: ingredients, isLoading: ingredientsLoading } = useQuery({
        queryKey: ['ingredients'],
        queryFn: () => ingredientApi.getAll()
    })

    // Fetch categories
    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryApi.getAll()
    })

    // Calculate stats when data is loaded
    useEffect(() => {
        if (ingredients && categories) {
            // Count ingredients by category
            const categoryCounts = ingredients.reduce((acc, ingredient) => {
                const categoryId = ingredient.categoryId.toString()
                acc[categoryId] = (acc[categoryId] || 0) + 1
                return acc
            }, {} as Record<string, number>)

            // Get top 3 categories
            const topCategories = categories
                .map(category => ({
                    id: category.id.toString(),
                    name: category.name,
                    count: categoryCounts[category.id.toString()] || 0,
                    icon: getCategoryIcon(category.name)
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)

            // Get recent ingredients (sorted by ID assuming higher IDs are newer)
            const recentIngredients = [...ingredients]
                .sort((a, b) => b.id - a.id)
                .slice(0, 4)
                .map(ingredient => ({
                    id: ingredient.id,
                    name: ingredient.name,
                    category: ingredient.category.name,
                    added: "Recently added" // We don't have actual creation dates in the response
                }))

            setStats({
                totalCount: ingredients.length,
                categoryCount: categories.length,
                topCategories,
                recentIngredients
            })
        }
    }, [ingredients, categories])

    const isLoading = ingredientsLoading || categoriesLoading

    if (isLoading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold tracking-tight">Ingredient Management</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Manage your ingredients, categories, and measurement units
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">All Ingredients</CardTitle>
                        <Apple className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCount}</div>
                        <p className="text-xs text-muted-foreground">Ingredients in database</p>
                    </CardContent>
                    <CardFooter>
                        <Link to="/ingredients" className="w-full">
                            <Button className="w-full">View All Ingredients</Button>
                        </Link>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <Filter className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.categoryCount}</div>
                        <p className="text-xs text-muted-foreground">Ingredient categories</p>
                    </CardContent>
                    <CardFooter>
                        <Link to="/ingredients?categoryId=all" className="w-full">
                            <Button className="w-full">Manage Categories</Button>
                        </Link>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Measurement Units</CardTitle>
                        <Wheat className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">18</div>
                        <p className="text-xs text-muted-foreground">Units of measurement</p>
                    </CardContent>
                    <CardFooter>
                        <Link to="/ingredients?view=units" className="w-full">
                            <Button className="w-full">Manage Units</Button>
                        </Link>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Add New</CardTitle>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">New</div>
                        <p className="text-xs text-muted-foreground">Create a new ingredient</p>
                    </CardContent>
                    <CardFooter>
                        <Link to="/ingredients/new" className="w-full">
                            <Button className="w-full">Add Ingredient</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>

            <div className="mt-10">
                <h2 className="mb-6 text-2xl font-bold">Ingredient Categories</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {stats.topCategories.map((category) => (
                        <Card key={category.id}>
                            <CardHeader className="flex flex-row items-center space-x-2">
                                <div className="rounded-full bg-primary/10 p-2">{category.icon}</div>
                                <div>
                                    <CardTitle>{category.name}</CardTitle>
                                    <CardDescription>{category.count} ingredients</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">Manage ingredients in the {category.name.toLowerCase()} category</p>
                            </CardContent>
                            <CardFooter>
                                <Link to={`/ingredients?categoryId=${category.id}`} className="w-full">
                                    <Button variant="outline" className="w-full">
                                        View Category
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="mt-10">
                <h2 className="mb-6 text-2xl font-bold">Recently Added Ingredients</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {stats.recentIngredients.map((ingredient) => (
                        <Card key={ingredient.id}>
                            <CardHeader>
                                <CardTitle className="text-base">{ingredient.name}</CardTitle>
                                <CardDescription>{ingredient.category}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">{ingredient.added}</p>
                            </CardContent>
                            <CardFooter>
                                <Link to={`/ingredients/${ingredient.id}`} className="w-full">
                                    <Button variant="outline" size="sm" className="w-full">
                                        View Details
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Helper function to get icon based on category name
function getCategoryIcon(categoryName: string) {
    switch (categoryName.toLowerCase()) {
        case 'vegetables':
            return <Carrot className="h-5 w-5" />;
        case 'fruits':
            return <Apple className="h-5 w-5" />;
        case 'grains & dry goods':
            return <Wheat className="h-5 w-5" />;
        case 'herbs':
            return <Leaf className="h-5 w-5" />;
        default:
            return <Apple className="h-5 w-5" />;
    }
}