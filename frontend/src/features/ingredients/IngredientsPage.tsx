// frontend/src/features/ingredients/IngredientsPage.tsx
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Plus, Search, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { ingredientApi, categoryApi } from '../../lib/api'
import { Link } from '@tanstack/react-router'

type SortField = 'name' | 'category' | 'defaultUnit' | 'description'
type SortDirection = 'asc' | 'desc'

export function IngredientsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

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
    const { data: ingredients, isLoading, error } = useQuery({
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

    // Sort ingredients
    const sortedIngredients = ingredients ? [...ingredients].sort((a, b) => {
        let aValue, bValue;

        switch (sortField) {
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'category':
                aValue = a.category?.name?.toLowerCase() || '';
                bValue = b.category?.name?.toLowerCase() || '';
                break;
            case 'defaultUnit':
                aValue = a.defaultUnit?.name?.toLowerCase() || '';
                bValue = b.defaultUnit?.name?.toLowerCase() || '';
                break;
            case 'description':
                aValue = a.description?.toLowerCase() || '';
                bValue = b.description?.toLowerCase() || '';
                break;
            default:
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
        }

        if (sortDirection === 'asc') {
            return aValue.localeCompare(bValue);
        } else {
            return bValue.localeCompare(aValue);
        }
    }) : [];

    // Handle sort click
    const handleSortClick = (field: SortField) => {
        if (field === sortField) {
            // Toggle direction if same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new field and default to ascending
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Get sort icon for header
    const getSortIcon = (field: SortField) => {
        if (field !== sortField) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        }
        return sortDirection === 'asc' ?
            <ArrowUp className="ml-2 h-4 w-4" /> :
            <ArrowDown className="ml-2 h-4 w-4" />;
    };

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

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search ingredients..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="w-full md:w-1/3">
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
                </div>

                <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="md:w-auto w-full"
                >
                    Clear Filters
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="text-center py-8 text-destructive">
                    Error loading ingredients. Please try again.
                </div>
            ) : sortedIngredients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No ingredients found. {searchQuery || categoryFilter !== 'all' ? 'Try adjusting your filters.' : 'Add your first ingredient to get started.'}
                </div>
            ) : (
                <div className="border rounded-md">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th
                                    className="text-center p-3 w-1/4 cursor-pointer hover:bg-muted/80"
                                    onClick={() => handleSortClick('name')}
                                >
                                    <span className="flex items-center justify-center">
                                        Name
                                        {getSortIcon('name')}
                                    </span>
                                </th>
                                <th
                                    className="text-center p-3 w-1/5 cursor-pointer hover:bg-muted/80"
                                    onClick={() => handleSortClick('category')}
                                >
                                    <span className="flex items-center justify-center">
                                        Category
                                        {getSortIcon('category')}
                                    </span>
                                </th>
                                <th
                                    className="text-center p-3 w-1/5 hidden md:table-cell cursor-pointer hover:bg-muted/80"
                                    onClick={() => handleSortClick('defaultUnit')}
                                >
                                    <span className="flex items-center justify-center">
                                        Default Unit
                                        {getSortIcon('defaultUnit')}
                                    </span>
                                </th>
                                <th
                                    className="text-center p-3 w-1/4 hidden md:table-cell cursor-pointer hover:bg-muted/80"
                                    onClick={() => handleSortClick('description')}
                                >
                                    <span className="flex items-center justify-center">
                                        Notes
                                        {getSortIcon('description')}
                                    </span>
                                </th>
                                <th className="text-center p-3 w-1/6">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedIngredients.map((ingredient) => (
                                <tr key={ingredient.id} className="border-t">
                                    <td className="p-3 text-left">
                                        <Link to={`/ingredients/${ingredient.id}`} className="hover:underline">
                                            {ingredient.name}
                                        </Link>
                                    </td>
                                    <td className="p-3 text-center">{ingredient.category?.name || 'Uncategorized'}</td>
                                    <td className="p-3 text-center hidden md:table-cell">
                                        {ingredient.defaultUnit ?
                                            `${ingredient.defaultUnit.name}${ingredient.defaultUnit.abbreviation ? ` (${ingredient.defaultUnit.abbreviation})` : ''}`
                                            : '—'}
                                    </td>
                                    <td className="p-3 text-left hidden md:table-cell">
                                        <div className="max-w-xs truncate">
                                            {ingredient.description || '—'}
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex justify-center space-x-2">
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