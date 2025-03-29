"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Checkbox } from "../../components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { ingredientService } from "../../services/ingredient-service"
import { unitService } from "../../services/unit-service"
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Search } from "lucide-react"

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

interface IngredientsSectionProps {
    ingredients: any[]
    setIngredients: (ingredients: any[]) => void
    scalingServings: number
    baseServingSize: number
}

export function IngredientsSection({
    ingredients,
    setIngredients,
    scalingServings = 8,
    baseServingSize = 8,
}: IngredientsSectionProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddingIngredient, setIsAddingIngredient] = useState(false)
    const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null)

    // Calculate scaling factor
    const scalingFactor = baseServingSize > 0 ? scalingServings / baseServingSize : 1

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

    // Reset form when editing a different ingredient
    const resetForm = (ingredient?: any) => {
        if (ingredient) {
            form.reset({
                ingredientId: ingredient.ingredientId,
                quantity: ingredient.quantity,
                unitId: ingredient.unitId,
                preparation: ingredient.preparation,
                isOptional: ingredient.isOptional,
                notes: ingredient.notes,
                scalingFactor: ingredient.scalingFactor || 1.0,
            })
        } else {
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
    }

    const onSubmit = (values: IngredientFormValues) => {
        if (editingIngredientIndex !== null) {
            // Update existing ingredient
            const updatedIngredients = [...ingredients]
            updatedIngredients[editingIngredientIndex] = {
                ...updatedIngredients[editingIngredientIndex],
                ...values,
            }
            setIngredients(updatedIngredients)
            setEditingIngredientIndex(null)
        } else {
            // Create new ingredient
            const newIngredient = {
                ...values,
                displayOrder: ingredients.length + 1,
                // Add ingredient and unit objects for display purposes
                ingredient: allIngredients.find((i) => i.id === values.ingredientId),
                unit: units.find((u) => u.id === values.unitId),
            }
            setIngredients([...ingredients, newIngredient])
            setIsAddingIngredient(false)
        }
        resetForm()
        setSearchQuery("")
    }

    const handleDelete = (index: number) => {
        if (editingIngredientIndex === index) {
            setEditingIngredientIndex(null)
        }
        const updatedIngredients = [...ingredients]
        updatedIngredients.splice(index, 1)

        // Update display order for remaining ingredients
        updatedIngredients.forEach((ing, idx) => {
            ing.displayOrder = idx + 1
        })

        setIngredients(updatedIngredients)
    }

    const handleMoveIngredient = (index: number, direction: "up" | "down") => {
        if ((direction === "up" && index === 0) || (direction === "down" && index === ingredients.length - 1)) {
            return
        }

        const updatedIngredients = [...ingredients]
        const currentIngredient = updatedIngredients[index]

        if (direction === "up") {
            // Swap with previous ingredient
            const prevIngredient = updatedIngredients[index - 1]

            // Swap display orders
            const tempOrder = currentIngredient.displayOrder
            currentIngredient.displayOrder = prevIngredient.displayOrder
            prevIngredient.displayOrder = tempOrder

            // Swap positions in array
            updatedIngredients[index] = prevIngredient
            updatedIngredients[index - 1] = currentIngredient
        } else {
            // Swap with next ingredient
            const nextIngredient = updatedIngredients[index + 1]

            // Swap display orders
            const tempOrder = currentIngredient.displayOrder
            currentIngredient.displayOrder = nextIngredient.displayOrder
            nextIngredient.displayOrder = tempOrder

            // Swap positions in array
            updatedIngredients[index] = nextIngredient
            updatedIngredients[index + 1] = currentIngredient
        }

        setIngredients(updatedIngredients)
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

    if (ingredientsLoading || unitsLoading) {
        return (
            <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    // Calculate scaled quantities
    const scaledIngredients = ingredients.map((ingredient) => ({
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
                                            value={field.value ? field.value.toString() : undefined}
                                            defaultValue={undefined}
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
                                                value={field.value ? field.value.toString() : undefined}
                                                defaultValue={undefined}
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
                                <Button type="submit" size="sm">
                                    Add
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            ) : (
                <Button
                    onClick={() => {
                        setIsAddingIngredient(true)
                        resetForm()
                    }}
                    disabled={editingIngredientIndex !== null}
                    size="sm"
                    className="w-full"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ingredient
                </Button>
            )}

            {/* Ingredients list */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {ingredients.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                        No ingredients added yet. Use the form above to add ingredients.
                    </div>
                ) : (
                    scaledIngredients
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((ingredient, index) => (
                            <div key={index} className="border rounded-md p-2">
                                {editingIngredientIndex === index ? (
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
                                                            value={field.value ? field.value.toString() : undefined}
                                                            defaultValue={undefined}
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
                                                                value={field.value ? field.value.toString() : undefined}
                                                                defaultValue={undefined}
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
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingIngredientIndex(null)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" size="sm">
                                                    Save
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                ) : (
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium">
                                                {ingredient.ingredient?.name || getIngredientName(ingredient.ingredientId)}
                                                {ingredient.isOptional && (
                                                    <span className="text-xs text-muted-foreground ml-1">(Optional)</span>
                                                )}
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium">{ingredient.scaledQuantity.toFixed(2)}</span>{" "}
                                                {ingredient.unit?.abbreviation || getUnitAbbreviation(ingredient.unitId)}
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
                                                onClick={() => handleMoveIngredient(index, "up")}
                                                disabled={index === 0}
                                            >
                                                <ArrowUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleMoveIngredient(index, "down")}
                                                disabled={index === ingredients.length - 1}
                                            >
                                                <ArrowDown className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => {
                                                    setEditingIngredientIndex(index)
                                                    resetForm(ingredient)
                                                }}
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
                                                onClick={() => handleDelete(index)}
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