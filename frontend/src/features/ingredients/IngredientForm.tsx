"use client"

// frontend/src/features/ingredients/IngredientForm.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useRouter, useParams } from "@tanstack/react-router"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Checkbox } from "../../components/ui/checkbox"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { categoryApi, unitApi, ingredientApi } from "../../lib/api"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"

// Define the form schema using zod
const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    categoryId: z.number().int().positive("Category is required"),
    subcategoryId: z.number().int().positive("Subcategory is required").optional().nullable(),
    defaultUnitId: z.number().int().positive("Default unit is required"),
    isPerishable: z.boolean().default(false),
    storageType: z
        .enum(["ROOM_TEMPERATURE", "REFRIGERATED", "FROZEN", "DRY_STORAGE", "COOL_DARK"])
        .default("ROOM_TEMPERATURE"),
    shelfLifeDays: z.number().int().positive().optional().nullable(),
    storageInstructions: z.string().optional().nullable(),
    supplierInstructions: z.string().optional().nullable(),
    supplierNotes: z.string().optional().nullable(),
    preferredSupplier: z.string().optional().nullable(),
    orderLeadTimeDays: z.number().int().positive().optional().nullable(),
    costPerUnitDollars: z.number().positive().optional().nullable(),
    packageSize: z.number().positive().optional().nullable(),
    packageUnitId: z.number().int().positive().optional().nullable(),
    isLocal: z.boolean().default(false),
    isOrganic: z.boolean().default(false),
    isSeasonalItem: z.boolean().default(false),
    hasVariablePrice: z.boolean().default(false),
    isCommonAllergen: z.boolean().default(false),
    isSpecialOrder: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

export function IngredientForm() {
    // Get the route params correctly from TanStack Router
    // Check which route we're on
    const router = useRouter()
    const pathname = router.state.location.pathname
    const isEditRoute = pathname.includes("/edit")

    // Use the appropriate route pattern
    const params = useParams({
        from: isEditRoute ? "/ingredients/$ingredientId/edit" : "/ingredients/new",
    })

    // For edit route, ingredientId will exist
    // For new route, it will be undefined
    const ingredientId = params.ingredientId

    console.log("IngredientForm - Route Params:", params)
    console.log("IngredientForm - Route:", pathname)

    const numericIngredientId = ingredientId ? Number.parseInt(ingredientId) : undefined
    console.log("Parsed ingredientId:", numericIngredientId)

    const isEditing = !!numericIngredientId && !isNaN(numericIngredientId)
    console.log("Is editing mode:", isEditing)

    const navigate = useNavigate()
    const queryClient = useQueryClient()

    // Fetch categories
    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryApi.getAll(),
    })

    // Fetch units
    const { data: units, isLoading: unitsLoading } = useQuery({
        queryKey: ["units"],
        queryFn: () => unitApi.getAll(),
    })

    // Fetch ingredient data if editing
    const {
        data: ingredient,
        isLoading: ingredientLoading,
        isError: ingredientError,
    } = useQuery({
        queryKey: ["ingredient", numericIngredientId],
        queryFn: () => (numericIngredientId ? ingredientApi.getById(numericIngredientId) : null),
        enabled: isEditing,
    })

    // Log when ingredient data is received
    useEffect(() => {
        console.log("Ingredient data loaded:", ingredient)
    }, [ingredient])

    // State for selected category
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

    // Fetch subcategories based on selected category
    const { data: subcategories, isLoading: subcategoriesLoading } = useQuery({
        queryKey: ["subcategories", selectedCategoryId],
        queryFn: () => categoryApi.getSubcategories(selectedCategoryId),
        enabled: !!selectedCategoryId,
    })

    // Create form with default values
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            categoryId: undefined,
            subcategoryId: undefined,
            defaultUnitId: undefined,
            isPerishable: false,
            storageType: "ROOM_TEMPERATURE",
            isLocal: false,
            isOrganic: false,
            isSeasonalItem: false,
            hasVariablePrice: false,
            isCommonAllergen: false,
            isSpecialOrder: false,
        },
    })

    // Update form values when ingredient data is loaded
    useEffect(() => {
        if (isEditing && ingredient) {
            // Set selected category for subcategory loading
            setSelectedCategoryId(ingredient.categoryId)

            // Reset form with ingredient data
            form.reset({
                name: ingredient.name,
                description: ingredient.description || "",
                categoryId: ingredient.categoryId,
                subcategoryId: ingredient.subcategoryId || undefined,
                defaultUnitId: ingredient.defaultUnitId,
                isPerishable: ingredient.isPerishable,
                storageType: ingredient.storageType,
                shelfLifeDays: ingredient.shelfLifeDays || undefined,
                storageInstructions: ingredient.storageInstructions || "",
                supplierInstructions: ingredient.supplierInstructions || "",
                supplierNotes: ingredient.supplierNotes || "",
                preferredSupplier: ingredient.preferredSupplier || "",
                orderLeadTimeDays: ingredient.orderLeadTimeDays || undefined,
                costPerUnitDollars: ingredient.costPerUnitDollars || undefined,
                packageSize: ingredient.packageSize || undefined,
                packageUnitId: ingredient.packageUnitId || undefined,
                isLocal: ingredient.isLocal,
                isOrganic: ingredient.isOrganic,
                isSeasonalItem: ingredient.isSeasonalItem,
                hasVariablePrice: ingredient.hasVariablePrice,
                isCommonAllergen: ingredient.isCommonAllergen,
                isSpecialOrder: ingredient.isSpecialOrder,
            })
        }
    }, [isEditing, ingredient, form])

    // Watch category_id to update subcategories
    const watchedCategoryId = form.watch("categoryId")

    useEffect(() => {
        if (watchedCategoryId && watchedCategoryId !== selectedCategoryId) {
            setSelectedCategoryId(watchedCategoryId)
            form.setValue("subcategoryId", undefined)
        }
    }, [watchedCategoryId, selectedCategoryId, form])

    // Create or update mutation
    const mutation = useMutation({
        mutationFn: (values: FormValues) => {
            console.log("Submitting form with values:", values)
            if (isEditing && numericIngredientId) {
                return ingredientApi.update(numericIngredientId, values)
            } else {
                return ingredientApi.create(values)
            }
        },
        onSuccess: (data) => {
            console.log("Mutation succeeded with data:", data)
            queryClient.invalidateQueries({ queryKey: ["ingredients"] })
            navigate({ to: "/ingredients" })
        },
        onError: (error) => {
            console.error("Mutation failed with error:", error)
        },
    })

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values)
    }

    // Handle loading state
    if ((isEditing && ingredientLoading) || categoriesLoading || unitsLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Handle error state for editing an ingredient
    if (isEditing && ingredientError) {
        console.error("Error loading ingredient for editing")
        return (
            <div className="text-center py-8 text-destructive">
                <h2 className="text-2xl font-bold mb-4">Error Loading Ingredient</h2>
                <p>There was a problem loading the ingredient details. Please try again.</p>
                <Button onClick={() => navigate({ to: "/ingredients" })} className="mt-4" variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Ingredients
                </Button>
            </div>
        )
    }

    // Handle not found state for editing
    if (isEditing && !ingredient) {
        console.log("Ingredient not found for editing")
        return (
            <div className="text-center py-8 text-muted-foreground">
                <h2 className="text-2xl font-bold mb-4">Ingredient Not Found</h2>
                <p>The ingredient you're trying to edit doesn't exist or has been removed.</p>
                <Button onClick={() => navigate({ to: "/ingredients" })} className="mt-4" variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Ingredients
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/ingredients">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">{isEditing ? "Edit Ingredient" : "Add Ingredient"}</h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Enter the essential details about this ingredient</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categoriesLoading ? (
                                                    <div className="flex justify-center p-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    </div>
                                                ) : (
                                                    categories?.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="subcategoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subcategory</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            value={field.value?.toString()}
                                            disabled={!selectedCategoryId}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a subcategory" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {subcategoriesLoading ? (
                                                    <div className="flex justify-center p-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    </div>
                                                ) : (
                                                    subcategories?.map((subcategory) => (
                                                        <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                                                            {subcategory.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>Select a category first to see available subcategories</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="defaultUnitId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Default Unit</FormLabel>
                                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a unit" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {unitsLoading ? (
                                                    <div className="flex justify-center p-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    </div>
                                                ) : (
                                                    units?.map((unit) => (
                                                        <SelectItem key={unit.id} value={unit.id.toString()}>
                                                            {unit.name} ({unit.abbreviation})
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Storage Information</CardTitle>
                            <CardDescription>Information about storage conditions and shelf life</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="isPerishable"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Perishable</FormLabel>
                                            <FormDescription>Check if this ingredient has a limited shelf life</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="storageType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Storage Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select storage type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ROOM_TEMPERATURE">Room Temperature</SelectItem>
                                                <SelectItem value="REFRIGERATED">Refrigerated</SelectItem>
                                                <SelectItem value="FROZEN">Frozen</SelectItem>
                                                <SelectItem value="DRY_STORAGE">Dry Storage</SelectItem>
                                                <SelectItem value="COOL_DARK">Cool & Dark</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="shelfLifeDays"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Shelf Life (Days)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value ? Number.parseInt(e.target.value) : null
                                                    field.onChange(value)
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="storageInstructions"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Storage Instructions</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Supplier Information</CardTitle>
                            <CardDescription>Information about sourcing this ingredient</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="preferredSupplier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preferred Supplier</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="orderLeadTimeDays"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Order Lead Time (Days)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value ? Number.parseInt(e.target.value) : null
                                                    field.onChange(value)
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="costPerUnitDollars"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cost Per Unit ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value ? Number.parseFloat(e.target.value) : null
                                                    field.onChange(value)
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="packageSize"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Package Size</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    value={field.value || ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value ? Number.parseFloat(e.target.value) : null
                                                        field.onChange(value)
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="packageUnitId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Package Unit</FormLabel>
                                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a unit" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {unitsLoading ? (
                                                        <div className="flex justify-center p-2">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        </div>
                                                    ) : (
                                                        units?.map((unit) => (
                                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                                {unit.name} ({unit.abbreviation})
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="supplierInstructions"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Supplier Instructions</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="supplierNotes"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Supplier Notes</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Attributes</CardTitle>
                            <CardDescription>Other properties about this ingredient</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="isLocal"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Local</FormLabel>
                                            <FormDescription>Sourced locally</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isOrganic"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Organic</FormLabel>
                                            <FormDescription>Certified organic</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isSeasonalItem"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Seasonal</FormLabel>
                                            <FormDescription>Only available seasonally</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="hasVariablePrice"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Variable Price</FormLabel>
                                            <FormDescription>Price fluctuates based on market</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isCommonAllergen"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Common Allergen</FormLabel>
                                            <FormDescription>Contains or is a common allergen</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isSpecialOrder"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Special Order</FormLabel>
                                            <FormDescription>Requires special ordering process</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => navigate({ to: "/ingredients" })}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            {isEditing ? "Update Ingredient" : "Create Ingredient"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
