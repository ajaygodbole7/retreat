"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Checkbox } from "../../components/ui/checkbox"
import { Label } from "../../components/ui/label"
import { Plus, Search, Loader2, Filter, X } from "lucide-react"
import { useRecipeList } from "../../hooks/useRecipes"
import { RecipeCard } from "../../components/recipe/RecipeCard"
import { CourseType } from "@server/types/recipe-types"
import { getCourseTypeLabel } from "../../utils/format-utils"
import { ensureArray } from "../../utils/array-utils"

export function RecipesPage() {
    // State for filters
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [courseType, setCourseType] = useState<string>("all")
    const [isVegan, setIsVegan] = useState<boolean | undefined>(undefined)
    const [isGlutenFree, setIsGlutenFree] = useState<boolean | undefined>(undefined)
    const [hasOnionGarlic, setHasOnionGarlic] = useState<boolean | undefined>(undefined)
    const [showFilters, setShowFilters] = useState(false)

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    // Prepare filters for API
    const filters = {
        search: debouncedSearch || undefined,
        courseType: courseType !== "all" ? (courseType as CourseType) : undefined,
        isVegan: isVegan !== undefined ? isVegan.toString() : undefined,
        isGlutenFree: isGlutenFree !== undefined ? isGlutenFree.toString() : undefined,
        hasOnionGarlic: hasOnionGarlic !== undefined ? hasOnionGarlic.toString() : undefined,
    }

    // Fetch recipes with filters
    const { data: recipes, isLoading, error } = useRecipeList(filters)

    // Reset all filters
    const resetFilters = () => {
        setSearchQuery("")
        setCourseType("all")
        setIsVegan(undefined)
        setIsGlutenFree(undefined)
        setHasOnionGarlic(undefined)
    }

    // Check if any filters are active
    const hasActiveFilters =
        debouncedSearch ||
        courseType !== "all" ||
        isVegan !== undefined ||
        isGlutenFree !== undefined ||
        hasOnionGarlic !== undefined

    // Ensure recipes is an array
    const recipeArray = ensureArray(recipes)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Recipes</h1>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className={showFilters ? "bg-muted" : ""}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                    <Link to="/recipes/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Recipe
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col space-y-4">
                {/* Search bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search recipes..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                            onClick={() => setSearchQuery("")}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Filters section */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-md bg-muted/20">
                        <div>
                            <Label htmlFor="courseType">Course Type</Label>
                            <Select value={courseType} onValueChange={setCourseType}>
                                <SelectTrigger id="courseType">
                                    <SelectValue placeholder="Select course type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Course Types</SelectItem>
                                    {Object.values(CourseType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {getCourseTypeLabel(type)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Dietary Preferences</Label>
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isVegan"
                                        checked={isVegan === true}
                                        onCheckedChange={(checked) =>
                                            setIsVegan(checked === "indeterminate" ? undefined : checked === true)
                                        }
                                    />
                                    <Label htmlFor="isVegan" className="cursor-pointer">
                                        Vegan
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isGlutenFree"
                                        checked={isGlutenFree === true}
                                        onCheckedChange={(checked) =>
                                            setIsGlutenFree(checked === "indeterminate" ? undefined : checked === true)
                                        }
                                    />
                                    <Label htmlFor="isGlutenFree" className="cursor-pointer">
                                        Gluten Free
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Ingredients</Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="hasOnionGarlic"
                                    checked={hasOnionGarlic === false}
                                    onCheckedChange={(checked) =>
                                        setHasOnionGarlic(checked === "indeterminate" ? undefined : checked === false)
                                    }
                                />
                                <Label htmlFor="hasOnionGarlic" className="cursor-pointer">
                                    No Onion/Garlic
                                </Label>
                            </div>
                        </div>

                        <div className="flex items-end">
                            <Button variant="outline" onClick={resetFilters} className="w-full">
                                Reset Filters
                            </Button>
                        </div>
                    </div>
                )}

                {/* Active filters display */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 items-center text-sm">
                        <span className="text-muted-foreground">Active filters:</span>
                        {debouncedSearch && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                Search: {debouncedSearch}
                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => setSearchQuery("")}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        )}
                        {courseType !== "all" && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                Course: {getCourseTypeLabel(courseType as CourseType)}
                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => setCourseType("all")}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        )}
                        {isVegan !== undefined && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                Vegan: {isVegan ? "Yes" : "No"}
                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => setIsVegan(undefined)}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        )}
                        {isGlutenFree !== undefined && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                Gluten Free: {isGlutenFree ? "Yes" : "No"}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 ml-1"
                                    onClick={() => setIsGlutenFree(undefined)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        )}
                        {hasOnionGarlic !== undefined && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                No Onion/Garlic: {!hasOnionGarlic ? "Yes" : "No"}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 ml-1"
                                    onClick={() => setHasOnionGarlic(undefined)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            {/* Loading state */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="text-center py-12 text-destructive">
                    <p>Error loading recipes. Please try again.</p>
                </div>
            ) : recipeArray.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="mb-4">No recipes found.</p>
                    {hasActiveFilters ? (
                        <p>
                            Try adjusting your filters or{" "}
                            <Button variant="link" onClick={resetFilters} className="p-0">
                                reset all filters
                            </Button>
                            .
                        </p>
                    ) : (
                        <Link to="/recipes/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Recipe
                            </Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipeArray.map((recipe, index) => (
                        <RecipeCard key={recipe.id || index} recipe={recipe} />
                    ))}
                </div>
            )}
        </div>
    )
}