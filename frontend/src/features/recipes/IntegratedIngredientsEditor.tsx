"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Checkbox } from "../../components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import {
    useRecipeIngredients,
    useCreateRecipeIngredient,
    useUpdateRecipeIngredient,
    useDeleteRecipeIngredient,
} from "../../hooks/useRecipeIngredients"
import { useQuery } from "@tanstack/react-query"
import { ingredientService } from "../../services/ingredient-service"
import { unitService } from "../../services/unit-service"
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Search } from "lucide-react"
import type { CreateRecipeIngredientInput } from "@server/types/recipe-types"

// Define the form schema using zod
const ingredientFormSchema = z.object({
    ingredientId: z.number().int().positive("Ingredient is required"),
    quantity: z.number().positive("Quantity must be positive"),
    unitId: z.number().int().positive("Unit is required"),
    preparation: z.string().optional().nullable(),
    isOptional: z.boolean().default(false),
    notes: z.string().optional().nullable(),
    scalingFactor: z.number().positive().default(1.0),
})

type IngredientFormValues = z.infer<typeof ingredientFormSchema>

interface IntegratedIngredientsEditorProps {
    recipeId: number
    onErrorsChange?: (hasErrors: boolean) => void
    scalingServings?: number
    baseServingSize?: number
}

export function IntegratedIngredientsEditor({
    recipeId,
    onErrorsChange,
    scalingServings = 8,
    baseServingSize = 8,
}: IntegratedIngredientsEditorProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddingIngredient, setIsAddingIngredient] = useState(false)
    const [editingIngredientId, setEditingIngredientId] = useState<number | null>(null)

    // Calculate scaling factor
    const scalingFactor = baseServingSize > 0 ? scalingServings / baseServingSize : 1

    const { data: recipeIngredients = [], isLoading } = useRecipeIngredients(recipeId)

    const createIngredientMutation = useCreateRecipeIngredient()
    const updateIngredientMutation = useUpdateRecipeIngredient(recipeId)
    const deleteIngredientMutation = useDeleteRecipeIngredient(recipeId)

    // Fetch all ingredients for dropdown
    const { data: allIngredients = [], isLoading: ingredientsLoading } = useQuery({
        queryKey: ["ingredients"],
        queryFn: () => ingredientService.getAll(),
    })

    // Fetch all units for dropdown
    const { data: units = [], isLoading: unitsLoading } = useQuery({
        queryKey: ["units"],
        queryFn: () => unitService.getAll(),
    })

    // Filter ingredients based on search query
    const filteredIngredients = searchQuery
        ? allIngredients.filter((ing) => ing.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : allIngredients

    // Create form with default values
    const form = useForm<IngredientFormValues>({
        resolver: zodResolver(ingredientFormSchema),
        defaultValues: {
            ingredientId: 0,
            quantity: 1,
            unitId: 0,
            preparation: "",
            isOptional: false,
            notes: "",
            scalingFactor: 1.0,
        },
        mode: "onChange",
    })

    // Update parent component about form errors
    useEffect(() => {
        if (onErrorsChange) {
            onErrorsChange(Object.keys(form.formState.errors).length > 0)
        }
    }, [form.formState.errors, onErrorsChange])

    // Reset form when editing a different ingredient
    useEffect(() => {
        if (editingIngredientId !== null) {
            const ingredient = recipeIngredients.find((i) => i.id === editingIngredientId)
            if (ingredient) {
                form.reset({
                    ingredientId: ingredient.ingredientId,
                    quantity: ingredient.quantity,
                    unitId: ingredient.unitId,
                    preparation: ingredient.preparation,
                    isOptional: ingredient.isOptional,
                    notes: ingredient.notes,
                    scalingFactor: ingredient.scalingFactor,
                })
            }
        } else if (!isAddingIngredient) {
            form.reset({
                ingredientId: 0,
                quantity: 1,
                unitId: 0,
                preparation: "",
                isOptional: false,
                notes: "",
                scalingFactor: 1.0,
            })
        }
    }, [editingIngredientId, isAddingIngredient, recipeIngredients, form])

    const onSubmit = (values: IngredientFormValues) => {
        if (editingIngredientId !== null) {
            // Update existing ingredient
            updateIngredientMutation.mutate(
                {
                    id: editingIngredientId,
                    data: values,
                },
                {
                    onSuccess: () => {
                        setEditingIngredientId(null)
                        form.reset()
                    },
                },
            )
        } else {
            // Create new ingredient
            const newIngredient = {
                recipeId,
                displayOrder: recipeIngredients.length + 1,
                ingredientId: values.ingredientId!, // Ensure required field
                unitId: values.unitId!,             // Ensure required field  
                quantity: values.quantity!,         // Ensure required field
                preparation: values.preparation ?? null,
                isOptional: values.isOptional ?? false,
                notes: values.notes ?? null,
                scalingFactor: values.scalingFactor ?? 1.0,
            }

            createIngredientMutation.mutate(newIngredient, {
                onSuccess: () => {
                    setIsAddingIngredient(false)
                    form.reset()
                    setSearchQuery("")
                },
            })
        }
    }

    const handleDelete = (ingredientId: number) => {
        if (editingIngredientId === ingredientId) {
            setEditingIngredientId(null)
        }
        deleteIngredientMutation.mutate(ingredientId)
    }

    const handleMoveIngredient = (ingredientId: number, direction: "up" | "down") => {
        const ingredientIndex = recipeIngredients.findIndex((i) => i.id === ingredientId)
        if (ingredientIndex === -1) return

        const newIngredients = [...recipeIngredients]
        const ingredient = newIngredients[ingredientIndex]

        if (direction === "up" && ingredientIndex > 0) {
            // Swap with previous ingredient
            const prevIngredient = newIngredients[ingredientIndex - 1]

            updateIngredientMutation.mutate({
                id: ingredient.id,
                data: { displayOrder: prevIngredient.displayOrder },
            })

            updateIngredientMutation.mutate({
                id: prevIngredient.id,
                data: { displayOrder: ingredient.displayOrder },
            })
        } else if (direction === "down" && ingredientIndex < newIngredients.length - 1) {
            // Swap with next ingredient
            const nextIngredient = newIngredients[ingredientIndex + 1]

            updateIngredientMutation.mutate({
                id: ingredient.id,
                data: { displayOrder: nextIngredient.displayOrder },
            })

            updateIngredientMutation.mutate({
                id: nextIngredient.id,
                data: { displayOrder: ingredient.displayOrder },
            })
        }
    }

    // Get ingredient name by ID
    const getIngredientName = (id: number) => {
        const ingredient = allIngredients.find((i) => i.id === id)
        return ingredient ? ingredient.name : "Unknown"
    }

    // Get unit abbreviation by ID
    const getUnitAbbreviation = (id: number) => {
        const unit = units.find((u) => u.id === id)
        return unit ? unit.abbreviation : ""
    }

    if (isLoading || ingredientsLoading || unitsLoading) {
        return (
            <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    // Calculate scaled quantities
    const scaledIngredients = recipeIngredients.map((ingredient) => ({
        ...ingredient,
        scaledQuantity: ingredient.quantity * scalingFactor * (ingredient.scalingFactor || 1),
    }))

    return (
        <div className="space-y-4">
            {/* Search and add ingredient */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search ingredients..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Add new ingredient form */}
            {isAddingIngredient ? (
                <div className="border rounded-md p-3 space-y-3">
                    <h3 className="font-medium text-sm">Add New Ingredient</h3>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                            <FormField
                                control={form.control}
                                name="ingredientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Ingredient</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            value={field.value ? field.value.toString() : ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select ingredient" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {filteredIngredients.map((ing) => (
                                                    <SelectItem key={ing.id} value={ing.id.toString()}>
                                                        {ing.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Quantity</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="unitId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Unit</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value ? field.value.toString() : ""}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select unit" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {units.map((unit) => (
                                                        <SelectItem key={unit.id} value={unit.id.toString()}>
                                                            {unit.name} ({unit.abbreviation})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="preparation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Preparation</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ""} placeholder="e.g., chopped, minced" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isOptional"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div>
                                            <FormLabel className="text-xs">Optional Ingredient</FormLabel>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingIngredient(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm" disabled={createIngredientMutation.isPending}>
                                    {createIngredientMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                    Add
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            ) : (
                <Button
                    onClick={() => setIsAddingIngredient(true)}
                    disabled={editingIngredientId !== null}
                    size="sm"
                    className="w-full"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ingredient
                </Button>
            )}

            {/* Ingredients list */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {recipeIngredients.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                        No ingredients added yet. Use the form above to add ingredients.
                    </div>
                ) : (
                    scaledIngredients
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((ingredient) => (
                            <div key={ingredient.id} className="border rounded-md p-2">
                                {editingIngredientId === ingredient.id ? (
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                                            <FormField
                                                control={form.control}
                                                name="ingredientId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Ingredient</FormLabel>
                                                        <Select
                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                            value={field.value ? field.value.toString() : ""}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select ingredient" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {allIngredients.map((ing) => (
                                                                    <SelectItem key={ing.id} value={ing.id.toString()}>
                                                                        {ing.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-2 gap-3">
                                                <FormField
                                                    control={form.control}
                                                    name="quantity"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">Quantity</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="unitId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">Unit</FormLabel>
                                                            <Select
                                                                onValueChange={(value) => field.onChange(Number(value))}
                                                                value={field.value ? field.value.toString() : ""}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select unit" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {units.map((unit) => (
                                                                        <SelectItem key={unit.id} value={unit.id.toString()}>
                                                                            {unit.name} ({unit.abbreviation})
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="flex justify-end space-x-2">
                                                <Button type="button" variant="outline" size="sm" onClick={() => setEditingIngredientId(null)}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit" size="sm" disabled={updateIngredientMutation.isPending}>
                                                    {updateIngredientMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                                    Save
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                ) : (
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium">
                                                {ingredient.ingredient?.name}
                                                {ingredient.isOptional && (
                                                    <span className="text-xs text-muted-foreground ml-1">(Optional)</span>
                                                )}
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium">{ingredient.scaledQuantity.toFixed(2)}</span>{" "}
                                                {ingredient.unit?.abbreviation}
                                                {ingredient.preparation && (
                                                    <span className="text-muted-foreground"> - {ingredient.preparation}</span>
                                                )}
                                            </div>
                                            {ingredient.notes && <div className="text-xs text-muted-foreground">{ingredient.notes}</div>}
                                        </div>
                                        <div className="flex space-x-1">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleMoveIngredient(ingredient.id, "up")}
                                                disabled={ingredient.displayOrder === 1}
                                            >
                                                <ArrowUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleMoveIngredient(ingredient.id, "down")}
                                                disabled={ingredient.displayOrder === recipeIngredients.length}
                                            >
                                                <ArrowDown className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => setEditingIngredientId(ingredient.id)}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-3 w-3"
                                                >
                                                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                    <path d="m15 5 4 4" />
                                                </svg>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                onClick={() => handleDelete(ingredient.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                )}
            </div>
        </div>
    )
}