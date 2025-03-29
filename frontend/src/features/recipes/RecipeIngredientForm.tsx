"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Checkbox } from "../../components/ui/checkbox"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Plus, Trash2, ArrowUp, ArrowDown, Loader2, Search } from "lucide-react"
import { useRecipeIngredientsList } from "../../hooks/useRecipeIngredients"
import { ingredientApi, unitApi } from "../../lib/api"
import type { CreateRecipeIngredientInput, UpdateRecipeIngredientInput } from "@server/types/recipe-types"
import { useToast } from "../../hooks/use-toast"

interface RecipeIngredientFormProps {
    recipeId: number
    onComplete?: () => void
}

export function RecipeIngredientForm({ recipeId, onComplete }: RecipeIngredientFormProps) {
    const { toast } = useToast()

    // Use the compatibility function for older components
    const { useIngredientsList, useCreateIngredient, useUpdateIngredient, useDeleteIngredient } =
        useRecipeIngredientsList()

    const { data: recipeIngredients, isLoading: ingredientsLoading, error } = useIngredientsList(recipeId)
    const createIngredientMutation = useCreateIngredient(onComplete)
    const updateIngredientMutation = useUpdateIngredient(recipeId, onComplete)
    const deleteIngredientMutation = useDeleteIngredient(recipeId, onComplete)

    // Fetch all ingredients for dropdown
    const { data: allIngredients, isLoading: allIngredientsLoading } = useQuery({
        queryKey: ["ingredients"],
        queryFn: () => ingredientApi.getAll(),
    })

    // Fetch all units for dropdown
    const { data: units, isLoading: unitsLoading } = useQuery({
        queryKey: ["units"],
        queryFn: () => unitApi.getAll(),
    })

    const [searchQuery, setSearchQuery] = useState("")
    const [newIngredient, setNewIngredient] = useState<CreateRecipeIngredientInput>({
        recipeId,
        ingredientId: 0,
        quantity: 1,
        unitId: 0,
        preparation: "",
        isOptional: false,
        displayOrder: 0,
        notes: "",
        scalingFactor: 1.0,
    })

    // Update display order when ingredients change
    useEffect(() => {
        if (recipeIngredients && recipeIngredients.length > 0) {
            setNewIngredient((prev) => ({
                ...prev,
                displayOrder: recipeIngredients.length,
            }))
        } else {
            setNewIngredient((prev) => ({
                ...prev,
                displayOrder: 0,
            }))
        }
    }, [recipeIngredients])

    // Filter ingredients based on search query
    const filteredIngredients = allIngredients
        ? allIngredients.filter((ing) => ing.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : []

    const handleAddIngredient = async () => {
        if (newIngredient.ingredientId === 0) {
            toast({
                title: "Error",
                description: "Please select an ingredient",
                variant: "destructive",
            })
            return
        }

        if (newIngredient.unitId === 0) {
            toast({
                title: "Error",
                description: "Please select a unit of measure",
                variant: "destructive",
            })
            return
        }

        if (newIngredient.quantity <= 0) {
            toast({
                title: "Error",
                description: "Quantity must be greater than zero",
                variant: "destructive",
            })
            return
        }

        try {
            await createIngredientMutation.mutateAsync(newIngredient)

            // Reset form for next ingredient
            setNewIngredient({
                recipeId,
                ingredientId: 0,
                quantity: 1,
                unitId: 0,
                preparation: "",
                isOptional: false,
                displayOrder: (recipeIngredients?.length || 0) + 1,
                notes: "",
                scalingFactor: 1.0,
            })

            setSearchQuery("")
        } catch (error) {
            console.error("Error adding ingredient:", error)
        }
    }

    const handleUpdateIngredient = async (id: number, data: UpdateRecipeIngredientInput) => {
        try {
            await updateIngredientMutation.mutateAsync({ id, data })
        } catch (error) {
            console.error("Error updating ingredient:", error)
        }
    }

    const handleDeleteIngredient = async (id: number) => {
        try {
            await deleteIngredientMutation.mutateAsync(id)
        } catch (error) {
            console.error("Error deleting ingredient:", error)
        }
    }

    const handleMoveIngredient = async (id: number, currentIndex: number, direction: "up" | "down") => {
        if (!recipeIngredients) return

        const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

        if (newIndex < 0 || newIndex >= recipeIngredients.length) return

        const currentIngredient = recipeIngredients[currentIndex]
        const targetIngredient = recipeIngredients[newIndex]

        // Swap display orders
        await updateIngredientMutation.mutateAsync({
            id: currentIngredient.id,
            data: { displayOrder: targetIngredient.displayOrder },
        })

        await updateIngredientMutation.mutateAsync({
            id: targetIngredient.id,
            data: { displayOrder: currentIngredient.displayOrder },
        })
    }

    if (ingredientsLoading || allIngredientsLoading || unitsLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return <div className="text-center py-8 text-destructive">Error loading ingredients. Please try again.</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Recipe Ingredients</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {recipeIngredients && recipeIngredients.length > 0 ? (
                        <div className="space-y-4">
                            {recipeIngredients.map((ingredient, index) => (
                                <div key={ingredient.id} className="flex items-start gap-2 p-4 border rounded-md">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <div className="font-medium">{ingredient.ingredient.name}</div>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    className="w-20"
                                                    value={ingredient.quantity}
                                                    onChange={(e) =>
                                                        handleUpdateIngredient(ingredient.id, { quantity: Number.parseFloat(e.target.value) })
                                                    }
                                                    step="0.01"
                                                    min="0.01"
                                                />
                                                <Select
                                                    value={ingredient.unitId.toString()}
                                                    onValueChange={(value) =>
                                                        handleUpdateIngredient(ingredient.id, { unitId: Number.parseInt(value) })
                                                    }
                                                >
                                                    <SelectTrigger className="w-[120px]">
                                                        <SelectValue placeholder="Select unit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {units?.map((unit) => (
                                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                                {unit.name} ({unit.abbreviation})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="flex-1">
                                                <Input
                                                    placeholder="Preparation (e.g., chopped, minced)"
                                                    value={ingredient.preparation || ""}
                                                    onChange={(e) => handleUpdateIngredient(ingredient.id, { preparation: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`optional-${ingredient.id}`}
                                                    checked={ingredient.isOptional}
                                                    onCheckedChange={(checked) =>
                                                        handleUpdateIngredient(ingredient.id, { isOptional: checked === true })
                                                    }
                                                />
                                                <Label htmlFor={`optional-${ingredient.id}`}>Optional</Label>
                                            </div>
                                        </div>
                                        <Textarea
                                            placeholder="Notes about this ingredient (optional)"
                                            value={ingredient.notes || ""}
                                            onChange={(e) => handleUpdateIngredient(ingredient.id, { notes: e.target.value })}
                                            className="h-16"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleMoveIngredient(ingredient.id, index, "up")}
                                            disabled={index === 0}
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleMoveIngredient(ingredient.id, index, "down")}
                                            disabled={index === recipeIngredients.length - 1}
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleDeleteIngredient(ingredient.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground">
                            No ingredients added yet. Add your first ingredient below.
                        </div>
                    )}

                    <div className="border-t pt-4">
                        <h3 className="font-medium mb-2">Add New Ingredient</h3>
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search ingredients..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="ingredient-select">Select Ingredient</Label>
                                    <Select
                                        value={newIngredient.ingredientId ? newIngredient.ingredientId.toString() : ""}
                                        onValueChange={(value) =>
                                            setNewIngredient({
                                                ...newIngredient,
                                                ingredientId: Number.parseInt(value),
                                            })
                                        }
                                    >
                                        <SelectTrigger id="ingredient-select">
                                            <SelectValue placeholder="Select ingredient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredIngredients.map((ingredient) => (
                                                <SelectItem key={ingredient.id} value={ingredient.id.toString()}>
                                                    {ingredient.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <Label htmlFor="quantity">Quantity</Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            value={newIngredient.quantity}
                                            onChange={(e) =>
                                                setNewIngredient({
                                                    ...newIngredient,
                                                    quantity: Number.parseFloat(e.target.value),
                                                })
                                            }
                                            step="0.01"
                                            min="0.01"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Label htmlFor="unit-select">Unit</Label>
                                        <Select
                                            value={newIngredient.unitId ? newIngredient.unitId.toString() : ""}
                                            onValueChange={(value) =>
                                                setNewIngredient({
                                                    ...newIngredient,
                                                    unitId: Number.parseInt(value),
                                                })
                                            }
                                        >
                                            <SelectTrigger id="unit-select">
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {units?.map((unit) => (
                                                    <SelectItem key={unit.id} value={unit.id.toString()}>
                                                        {unit.name} ({unit.abbreviation})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="preparation">Preparation</Label>
                                    <Input
                                        id="preparation"
                                        placeholder="e.g., chopped, minced"
                                        value={newIngredient.preparation || ""}
                                        onChange={(e) =>
                                            setNewIngredient({
                                                ...newIngredient,
                                                preparation: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex items-end gap-2">
                                    <div className="flex items-center h-10 gap-2">
                                        <Checkbox
                                            id="new-optional"
                                            checked={newIngredient.isOptional}
                                            onCheckedChange={(checked) =>
                                                setNewIngredient({ ...newIngredient, isOptional: checked === true })
                                            }
                                        />
                                        <Label htmlFor="new-optional">Optional ingredient</Label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Additional notes about this ingredient"
                                    value={newIngredient.notes || ""}
                                    onChange={(e) =>
                                        setNewIngredient({
                                            ...newIngredient,
                                            notes: e.target.value,
                                        })
                                    }
                                    className="h-16"
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    onClick={handleAddIngredient}
                                    disabled={
                                        createIngredientMutation.isPending ||
                                        !newIngredient.ingredientId ||
                                        !newIngredient.unitId ||
                                        newIngredient.quantity <= 0
                                    }
                                >
                                    {createIngredientMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Plus className="h-4 w-4 mr-2" />
                                    )}
                                    Add Ingredient
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}