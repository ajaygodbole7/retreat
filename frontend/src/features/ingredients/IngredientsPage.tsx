// frontend/src/features/ingredients/IngredientsPage.tsx
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Plus, Search, Loader2, Filter } from 'lucide-react'
import { ingredientApi, categoryApi } from '../../lib/api'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

export function IngredientsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

    // Debounce search query to prevent excessive API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    // Fetch all categories for filter dropdown
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryApi.getAll()
    })

    // Fetch ingredients with filters
    const { data: ingredients, isLoading, error, refetch } = useQuery({
        queryKey: ['ingredients', debouncedSearch, categoryFilter],
        queryFn: () => ingredientApi.getAll({
            search: debouncedSearch,
            categoryId: categoryFilter && categoryFilter !== 'all' ? categoryFilter : undefined
        })
    })

    // Reset filters
    const resetFilters = () => {
        setSearchQuery('')
        setCategoryFilter('all')
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Ingredients</h1>
                <Link to="/ingredients/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Ingredient
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search ingredients..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Select
                            value={categoryFilter}
                            onValueChange={(value) => setCategoryFilter(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories?.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button variant="outline" onClick={resetFilters}>
                            <Filter className="h-4 w-4 mr-2" />
                            Reset Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="text-center py-8 text-destructive">
                    Error loading ingredients. Please try again.
                </div>
            ) : ingredients?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No ingredients found. {searchQuery || categoryFilter !== 'all' ? 'Try adjusting your filters.' : 'Add your first ingredient to get started.'}
                </div>
            ) : (
                <div className="border rounded-md">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="text-left p-3">Name</th>
                                <th className="text-left p-3">Category</th>
                                <th className="text-left p-3 hidden md:table-cell">Properties</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ingredients?.map((ingredient) => (
                                <tr key={ingredient.id} className="border-t">
                                    <td className="p-3">
                                        <Link to={`/ingredients/${ingredient.id}`} className="hover:underline">
                                            {ingredient.name}
                                        </Link>
                                    </td>
                                    <td className="p-3">{ingredient.category?.name || 'Uncategorized'}</td>
                                    <td className="p-3 hidden md:table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {ingredient.isOrganic && <Badge variant="outline">Organic</Badge>}
                                            {ingredient.isLocal && <Badge variant="outline">Local</Badge>}
                                            {ingredient.isCommonAllergen && <Badge variant="destructive">Allergen</Badge>}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex space-x-2">
                                            <Link to={`/ingredients/${ingredient.id}`}>
                                                <Button variant="outline" size="sm">View</Button>
                                            </Link>
                                            <Link to={`/ingredients/${ingredient.id}/edit`}>
                                                <Button variant="outline" size="sm">Edit</Button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}