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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card"
import {
    useRecipeIngredients,
    useCreateRecipeIngredient,
    useUpdateRecipeIngredient,
    useDeleteRecipeIngredient,
} from "../../hooks/useRecipeIngredients"
import { useQuery } from "@tanstack/react-query"
import { ingredientService } from "../../services/ingredient-service"
import { unitService } from "../../services/unit-service"
import { Loader2, Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Search } from "lucide-react"

// Define the form schema using zod
const ingredientFormSchema = z.object({
    ingredientId: z.number().int().positive("Ingredient is required"),
    quantity: z.number().positive("Quantity must be positive"),
    unitId: z.number().int().positive("Unit is required"),
    preparation: z.string().optional().nullable(),
    isOptional: z.boolean().default(false),
    notes: z.string().optional().nullable(),
    scalingFactor: z.number().positive().default(1.0),
    alternateIngredientId: z.number().int().positive().optional().nullable(),
})

type IngredientFormValues = z.infer<typeof ingredientFormSchema>

interface RecipeIngredientsEditorProps {
    recipeId: number
    onErrorsChange?: (hasErrors: boolean) => void
}

export function RecipeIngredientsEditor({ recipeId, onErrorsChange }: RecipeIngredientsEditorProps) {
    const [editingIngredientId, setEditingIngredientId] = useState<number | null>(null)
    const [isAddingIngredient, setIsAddingIngredient] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [alternateSearchQuery, setAlternateSearchQuery] = useState("")

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

    // Filter alternate ingredients based on search query
    const filteredAlternateIngredients = alternateSearchQuery
        ? allIngredients.filter((ing) => ing.name.toLowerCase().includes(alternateSearchQuery.toLowerCase()))
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
            alternateIngredientId: null,
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
                    alternateIngredientId: ingredient.alternateIngredientId,
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
                alternateIngredientId: null,
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
                ...values,
                recipeId,
                displayOrder: recipeIngredients.length + 1,
            }

            createIngredientMutation.mutate(newIngredient, {
                onSuccess: () => {
                    setIsAddingIngredient(false)
                    form.reset()
                    setSearchQuery("")
                    setAlternateSearchQuery("")
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
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Recipe Ingredients</CardTitle>
                    <CardDescription>Add and manage ingredients for this recipe</CardDescription>
                </CardHeader>
                <CardContent>
                    {recipeIngredients.length === 0 && !isAddingIngredient ? (
                        <div className="text-center py-4 text-muted-foreground">
                            No ingredients added yet. Click "Add Ingredient" to get started.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* List of existing ingredients */}
                            {recipeIngredients
                                .sort((a, b) => a.displayOrder - b.displayOrder)
                                .map((ingredient) => (
                                    <Card key={ingredient.id} className={editingIngredientId === ingredient.id ? "border-primary" : ""}>
                                        {editingIngredientId === ingredient.id ? (
                                            <Form {...form}>
                                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="ingredientId"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    <span className="flex items-center space-x-1">
                                                                        <span>Ingredient</span>
                                                                        <span className="text-destructive">*</span>
                                                                    </span>
                                                                </FormLabel>
                                                                <Select
                                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                                    value={field.value ? field.value.toString() : ""}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select an ingredient" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <div className="p-2">
                                                                            <Input
                                                                                placeholder="Search ingredients..."
                                                                                value={searchQuery}
                                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                                className="mb-2"
                                                                            />
                                                                        </div>
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

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name="quantity"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        <span className="flex items-center space-x-1">
                                                                            <span>Quantity</span>
                                                                            <span className="text-destructive">*</span>
                                                                        </span>
                                                                    </FormLabel>
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
                                                                    <FormLabel>
                                                                        <span className="flex items-center space-x-1">
                                                                            <span>Unit</span>
                                                                            <span className="text-destructive">*</span>
                                                                        </span>
                                                                    </FormLabel>
                                                                    <Select
                                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                                        value={field.value ? field.value.toString() : ""}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select a unit" />
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
                                                                <FormLabel>Preparation</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        value={field.value || ""}
                                                                        placeholder="e.g., chopped, minced, diced"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="scalingFactor"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Scaling Factor</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0.01"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                                <p className="text-xs text-muted-foreground">
                                                                    Adjust how this ingredient scales when the recipe is scaled (default: 1.0)
                                                                </p>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="alternateIngredientId"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Alternate Ingredient (Optional)</FormLabel>
                                                                <Select
                                                                    onValueChange={(value) => {
                                                                        const numValue = value === "none" ? null : Number(value)
                                                                        field.onChange(numValue)
                                                                    }}
                                                                    value={field.value?.toString() || "none"}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select alternate ingredient" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <div className="p-2">
                                                                            <Input
                                                                                placeholder="Search ingredients..."
                                                                                value={alternateSearchQuery}
                                                                                onChange={(e) => setAlternateSearchQuery(e.target.value)}
                                                                                className="mb-2"
                                                                            />
                                                                        </div>
                                                                        <SelectItem value="none">None</SelectItem>
                                                                        {filteredAlternateIngredients.map((ing) => (
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

                                                    <FormField
                                                        control={form.control}
                                                        name="notes"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Notes</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} value={field.value || ""} />
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
                                                                    <FormLabel>Optional Ingredient</FormLabel>
                                                                </div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="flex justify-end space-x-2">
                                                        <Button type="button" variant="outline" onClick={() => setEditingIngredientId(null)}>
                                                            Cancel
                                                        </Button>
                                                        <Button type="submit" disabled={updateIngredientMutation.isPending}>
                                                            {updateIngredientMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            Save Ingredient
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        ) : (
                                            <div className="p-4">
                                                <div className="flex items-start">
                                                    <div className="flex items-center mr-2 text-muted-foreground">
                                                        <GripVertical className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium">
                                                            {ingredient.ingredient.name}
                                                            {ingredient.preparation && (
                                                                <span className="font-normal text-muted-foreground"> ({ingredient.preparation})</span>
                                                            )}
                                                        </p>
                                                        <p className="text-sm">
                                                            {ingredient.quantity} {ingredient.unit.abbreviation}
                                                            {ingredient.isOptional && <span className="text-muted-foreground ml-2">(Optional)</span>}
                                                        </p>
                                                        {ingredient.alternateIngredient && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Alternate: {ingredient.alternateIngredient.name}
                                                            </p>
                                                        )}
                                                        {ingredient.scalingFactor !== 1.0 && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Scaling factor: {ingredient.scalingFactor}
                                                            </p>
                                                        )}
                                                        {ingredient.notes && (
                                                            <p className="text-sm text-muted-foreground mt-1">Note: {ingredient.notes}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-1 ml-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleMoveIngredient(ingredient.id, "up")}
                                                            disabled={ingredient.displayOrder === 1}
                                                        >
                                                            <ArrowUp className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleMoveIngredient(ingredient.id, "down")}
                                                            disabled={ingredient.displayOrder === recipeIngredients.length}
                                                        >
                                                            <ArrowDown className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="icon" onClick={() => setEditingIngredientId(ingredient.id)}>
                                                            <span className="sr-only">Edit</span>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                className="h-4 w-4"
                                                            >
                                                                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                                <path d="m15 5 4 4" />
                                                            </svg>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                            onClick={() => handleDelete(ingredient.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                ))}

                            {/* Add new ingredient form */}
                            {isAddingIngredient && (
                                <Card className="border-dashed border-primary">
                                    <CardHeader>
                                        <CardTitle>Add New Ingredient</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                                    <Input
                                                        placeholder="Search ingredients..."
                                                        className="pl-10 mb-4"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name="ingredientId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                <span className="flex items-center space-x-1">
                                                                    <span>Ingredient</span>
                                                                    <span className="text-destructive">*</span>
                                                                </span>
                                                            </FormLabel>
                                                            <Select
                                                                onValueChange={(value) => field.onChange(Number(value))}
                                                                value={field.value ? field.value.toString() : ""}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select an ingredient" />
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

                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="quantity"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    <span className="flex items-center space-x-1">
                                                                        <span>Quantity</span>
                                                                        <span className="text-destructive">*</span>
                                                                    </span>
                                                                </FormLabel>
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
                                                                <FormLabel>
                                                                    <span className="flex items-center space-x-1">
                                                                        <span>Unit</span>
                                                                        <span className="text-destructive">*</span>
                                                                    </span>
                                                                </FormLabel>
                                                                <Select
                                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                                    value={field.value ? field.value.toString() : ""}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select a unit" />
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
                                                            <FormLabel>Preparation</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    value={field.value || ""}
                                                                    placeholder="e.g., chopped, minced, diced"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="scalingFactor"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Scaling Factor</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0.01"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                            <p className="text-xs text-muted-foreground">
                                                                Adjust how this ingredient scales when the recipe is scaled (default: 1.0)
                                                            </p>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="alternateIngredientId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Alternate Ingredient (Optional)</FormLabel>
                                                            <Select
                                                                onValueChange={(value) => {
                                                                    const numValue = value === "none" ? null : Number(value)
                                                                    field.onChange(numValue)
                                                                }}
                                                                value={field.value?.toString() || "none"}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select alternate ingredient" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <div className="p-2">
                                                                        <Input
                                                                            placeholder="Search ingredients..."
                                                                            value={alternateSearchQuery}
                                                                            onChange={(e) => setAlternateSearchQuery(e.target.value)}
                                                                            className="mb-2"
                                                                        />
                                                                    </div>
                                                                    <SelectItem value="none">None</SelectItem>
                                                                    {filteredAlternateIngredients.map((ing) => (
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

                                                <FormField
                                                    control={form.control}
                                                    name="notes"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Notes</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} value={field.value || ""} />
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
                                                                <FormLabel>Optional Ingredient</FormLabel>
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="flex justify-end space-x-2">
                                                    <Button type="button" variant="outline" onClick={() => setIsAddingIngredient(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" disabled={createIngredientMutation.isPending}>
                                                        {createIngredientMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Add Ingredient
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    {!isAddingIngredient && (
                        <Button onClick={() => setIsAddingIngredient(true)} disabled={editingIngredientId !== null}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Ingredient
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}