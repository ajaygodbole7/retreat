import { Link } from "@tanstack/react-router"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Apple, ChefHat, ShoppingCart, Package, Calendar, ArrowRight } from 'lucide-react'

export function DashboardPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold tracking-tight">Retreat Recipe Manager</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Streamline meal planning and ingredient management for your retreats
                </p>
            </div>

            {/* Main Feature Card - Ingredients */}
            <div className="mb-10">
                <Card className="overflow-hidden">
                    <div className="md:flex">
                        <div className="md:w-2/3 p-6">
                            <CardHeader className="px-0">
                                <CardTitle className="text-2xl">Ingredient Management</CardTitle>
                                <CardDescription>
                                    Manage your ingredients database, categories, and measurement units
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-0 py-4">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="bg-muted rounded-md p-3 text-center">
                                        <div className="text-2xl font-bold">350+</div>
                                        <p className="text-xs text-muted-foreground">Ingredients</p>
                                    </div>
                                    <div className="bg-muted rounded-md p-3 text-center">
                                        <div className="text-2xl font-bold">24</div>
                                        <p className="text-xs text-muted-foreground">Categories</p>
                                    </div>
                                    <div className="bg-muted rounded-md p-3 text-center">
                                        <div className="text-2xl font-bold">18</div>
                                        <p className="text-xs text-muted-foreground">Units</p>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Organize your ingredients by category, track nutritional information, and manage measurement conversions.
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
                                <p className="text-sm text-muted-foreground mt-1">
                                    The foundation of your recipe system
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Other Modules (Coming Soon) */}
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

                <Card className="opacity-70">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recipes</CardTitle>
                        <ChefHat className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Coming Soon</div>
                        <p className="text-xs text-muted-foreground">Create and manage recipes</p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" disabled>Coming Soon</Button>
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
                        <Button className="w-full" disabled>Coming Soon</Button>
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
                        <Button className="w-full" disabled>Coming Soon</Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Add New Ingredient</CardTitle>
                            <CardDescription>Create a new ingredient in the database</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Link to="/ingredients/new" className="w-full">
                                <Button variant="outline" className="w-full">
                                    Add Ingredient
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Manage Categories</CardTitle>
                            <CardDescription>Organize your ingredient categories</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Link to="/ingredients/categories" className="w-full">
                                <Button variant="outline" className="w-full">
                                    View Categories
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Measurement Units</CardTitle>
                            <CardDescription>Configure measurement units and conversions</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Link to="/ingredients/units" className="w-full">
                                <Button variant="outline" className="w-full">
                                    Manage Units
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