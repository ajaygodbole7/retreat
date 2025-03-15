import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Plus, Search, Loader2 } from 'lucide-react'
import { ingredientApi } from '../../lib/api'
import { Link } from '@tanstack/react-router'

export function IngredientsPage() {
    const [searchQuery, setSearchQuery] = useState('')

    const { data: ingredients, isLoading, error } = useQuery({
        queryKey: ['ingredients'],
        queryFn: () => ingredientApi.getAll({ search: searchQuery }),
        enabled: true
    })

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

            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search ingredients..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

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
                    No ingredients found. Add your first ingredient to get started.
                </div>
            ) : (
                <div className="border rounded-md">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="text-left p-3">Name</th>
                                <th className="text-left p-3">Category</th>
                                <th className="text-left p-3">Organic</th>
                                <th className="text-left p-3">Local</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ingredients?.map((ingredient) => (
                                <tr key={ingredient.id} className="border-t">
                                    <td className="p-3">{ingredient.name}</td>
                                    <td className="p-3">{ingredient.category.name}</td>
                                    <td className="p-3">{ingredient.isOrganic ? 'Yes' : 'No'}</td>
                                    <td className="p-3">{ingredient.isLocal ? 'Yes' : 'No'}</td>
                                    <td className="p-3">
                                        <Link to={`/ingredients/${ingredient.id}`}>
                                            <Button variant="ghost" size="sm">View</Button>
                                        </Link>
                                        <Link to={`/ingredients/${ingredient.id}/edit`}>
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </Link>
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