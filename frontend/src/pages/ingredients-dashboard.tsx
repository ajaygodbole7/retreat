import { Link } from "@tanstack/react-router"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Apple, Carrot, Wheat, Leaf, Filter, Plus } from 'lucide-react'

export function IngredientsDashboardPage() {
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
                        <div className="text-2xl font-bold">350+</div>
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
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">Ingredient categories</p>
                    </CardContent>
                    <CardFooter>
                        <Link to="/ingredients/categories" className="w-full">
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
                        <Link to="/ingredients/units" className="w-full">
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
                    {[
                        { id: "1", name: "Produce", count: 85, icon: <Carrot className="h-5 w-5" /> },
                        { id: "2", name: "Dairy", count: 42, icon: <Leaf className="h-5 w-5" /> },
                        { id: "3", name: "Grains", count: 38, icon: <Wheat className="h-5 w-5" /> },
                    ].map((category) => (
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
                                <Link to={`/ingredients/categories/${category.id}`} className="w-full">
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
                    {[
                        { id: "1", name: "Organic Quinoa", category: "Grains", added: "2 days ago" },
                        { id: "2", name: "Almond Milk", category: "Dairy Alternatives", added: "3 days ago" },
                        { id: "3", name: "Fresh Basil", category: "Herbs", added: "5 days ago" },
                        { id: "4", name: "Coconut Sugar", category: "Sweeteners", added: "1 week ago" },
                    ].map((ingredient) => (
                        <Card key={ingredient.id}>
                            <CardHeader>
                                <CardTitle className="text-base">{ingredient.name}</CardTitle>
                                <CardDescription>{ingredient.category}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">Added {ingredient.added}</p>
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