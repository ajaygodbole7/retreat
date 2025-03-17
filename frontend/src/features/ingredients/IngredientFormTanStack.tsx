// src/features/ingredients/IngredientFormTanStack.tsx
import { useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { z } from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useRouter, useParams } from "@tanstack/react-router"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { categoryApi, unitApi, ingredientApi } from "../../lib/api"
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"
import { TextField, TextareaField, NumberField, CheckboxField, SelectField } from "../../components/form/FormFields"

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

export function IngredientFormTanStack() {
    // Get the route params correctly from TanStack Router
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
    const numericIngredientId = ingredientId ? Number.parseInt(ingredientId) : undefined
    const isEditing = !!numericIngredientId && !isNaN(numericIngredientId)

    console.log("IngredientFormTanStack - Route Params:", params)
    console.log("IngredientFormTanStack - Route:", pathname)
    console.log("Parsed ingredientId:", numericIngredientId)
    console.log("Is editing mode:", isEditing)

    const navigate = useNavigate()
    const queryClient = useQueryClient()

    // State for selected category
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

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

    // Fetch subcategories based on selected category
    const { data: subcategories, isLoading: subcategoriesLoading } = useQuery({
        queryKey: ["subcategories", selectedCategoryId],
        queryFn: () => categoryApi.getSubcategories(selectedCategoryId),
        enabled: !!selectedCategoryId,
    })

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

    // Initialize the form with TanStack Form
    const form = useForm({
        defaultValues: {
            name: ingredient?.name || "",
            description: ingredient?.description || "",
            categoryId: ingredient?.categoryId,
            subcategoryId: ingredient?.subcategoryId,
            defaultUnitId: ingredient?.defaultUnitId,
            isPerishable: ingredient?.isPerishable || false,
            storageType: ingredient?.storageType || "ROOM_TEMPERATURE",
            shelfLifeDays: ingredient?.shelfLifeDays,
            storageInstructions: ingredient?.storageInstructions || "",
            supplierInstructions: ingredient?.supplierInstructions || "",
            supplierNotes: ingredient?.supplierNotes || "",
            preferredSupplier: ingredient?.preferredSupplier || "",
            orderLeadTimeDays: ingredient?.orderLeadTimeDays,
            costPerUnitDollars: ingredient?.costPerUnitDollars,
            packageSize: ingredient?.packageSize,
            packageUnitId: ingredient?.packageUnitId,
            isLocal: ingredient?.isLocal || false,
            isOrganic: ingredient?.isOrganic || false,
            isSeasonalItem: ingredient?.isSeasonalItem || false,
            hasVariablePrice: ingredient?.hasVariablePrice || false,
            isCommonAllergen: ingredient?.isCommonAllergen || false,
            isSpecialOrder: ingredient?.isSpecialOrder || false,
        },
        onSubmit: async ({ value }) => {
            await mutation.mutateAsync(value);
        },
        validatorAdapter: zodValidator,
        validators: {
            onSubmit: formSchema,
        },
    });

    // Update selected category when form values change
    useEffect(() => {
        if (ingredient?.categoryId) {
            setSelectedCategoryId(ingredient.categoryId)
        }
    }, [ingredient])

    // Watch categoryId to update subcategories
    form.useStore((state) => {
        const categoryId = state.fields.categoryId?.value as number | undefined;
        if (categoryId && categoryId !== selectedCategoryId) {
            setSelectedCategoryId(categoryId);
            // Reset subcategoryId when category changes
            form.setFieldValue("subcategoryId", undefined);
        }
    });

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

            <form.Provider>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="space-y-8"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Enter the essential details about this ingredient</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextField
                                form={form}
                                name="name"
                                label="Name"
                                validators={{
                                    onChange: z.string().min(1, "Name is required"),
                                }}
                            />

                            <TextareaField
                                form={form}
                                name="description"
                                label="Description"
                            />

                            <SelectField
                                form={form}
                                name="categoryId"
                                label="Category"
                                placeholder="Select a category"
                                options={categories?.map(category => ({
                                    value: category.id,
                                    label: category.name
                                })) || []}
                                isLoading={categoriesLoading}
                                validators={{
                                    onChange: z.number().int().positive("Category is required"),
                                }}
                            />

                            <SelectField
                                form={form}
                                name="subcategoryId"
                                label="Subcategory"
                                placeholder="Select a subcategory"
                                options={subcategories?.map(subcategory => ({
                                    value: subcategory.id,
                                    label: subcategory.name
                                })) || []}
                                isLoading={subcategoriesLoading}
                                disabled={!selectedCategoryId}
                                description="Select a category first to see available subcategories"
                            />

                            <SelectField
                                form={form}
                                name="defaultUnitId"
                                label="Default Unit"
                                placeholder="Select a unit"
                                options={units?.map(unit => ({
                                    value: unit.id,
                                    label: `${unit.name} (${unit.abbreviation})`
                                })) || []}
                                isLoading={unitsLoading}
                                validators={{
                                    onChange: z.number().int().positive("Default unit is required"),
                                }}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Storage Information</CardTitle>
                            <CardDescription>Information about storage conditions and shelf life</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CheckboxField
                                form={form}
                                name="isPerishable"
                                label="Perishable"
                                description="Check if this ingredient has a limited shelf life"
                            />

                            <SelectField
                                form={form}
                                name="storageType"
                                label="Storage Type"
                                placeholder="Select storage type"
                                options={[
                                    { value: "ROOM_TEMPERATURE", label: "Room Temperature" },
                                    { value: "REFRIGERATED", label: "Refrigerated" },
                                    { value: "FROZEN", label: "Frozen" },
                                    { value: "DRY_STORAGE", label: "Dry Storage" },
                                    { value: "COOL_DARK", label: "Cool & Dark" },
                                ]}
                            />

                            <NumberField
                                form={form}
                                name="shelfLifeDays"
                                label="Shelf Life (Days)"
                            />

                            <TextareaField
                                form={form}
                                name="storageInstructions"
                                label="Storage Instructions"
                                className="md:col-span-2"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Supplier Information</CardTitle>
                            <CardDescription>Information about sourcing this ingredient</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextField
                                form={form}
                                name="preferredSupplier"
                                label="Preferred Supplier"
                            />

                            <NumberField
                                form={form}
                                name="orderLeadTimeDays"
                                label="Order Lead Time (Days)"
                            />

                            <NumberField
                                form={form}
                                name="costPerUnitDollars"
                                label="Cost Per Unit ($)"
                                step="0.01"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <NumberField
                                    form={form}
                                    name="packageSize"
                                    label="Package Size"
                                    step="0.01"
                                />

                                <SelectField
                                    form={form}
                                    name="packageUnitId"
                                    label="Package Unit"
                                    placeholder="Select a unit"
                                    options={units?.map(unit => ({
                                        value: unit.id,
                                        label: `${unit.name} (${unit.abbreviation})`
                                    })) || []}
                                    isLoading={unitsLoading}
                                />
                            </div>

                            <TextareaField
                                form={form}
                                name="supplierInstructions"
                                label="Supplier Instructions"
                                className="col-span-2"
                            />

                            <TextareaField
                                form={form}
                                name="supplierNotes"
                                label="Supplier Notes"
                                className="col-span-2"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Attributes</CardTitle>
                            <CardDescription>Other properties about this ingredient</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <CheckboxField
                                form={form}
                                name="isLocal"
                                label="Local"
                                description="Sourced locally"
                            />

                            <CheckboxField
                                form={form}
                                name="isOrganic"
                                label="Organic"
                                description="Certified organic"
                            />

                            <CheckboxField
                                form={form}
                                name="isSeasonalItem"
                                label="Seasonal"
                                description="Only available seasonally"
                            />

                            <CheckboxField
                                form={form}
                                name="hasVariablePrice"
                                label="Variable Price"
                                description="Price fluctuates based on market"
                            />

                            <CheckboxField
                                form={form}
                                name="isCommonAllergen"
                                label="Common Allergen"
                                description="Contains or is a common allergen"
                            />

                            <CheckboxField
                                form={form}
                                name="isSpecialOrder"
                                label="Special Order"
                                description="Requires special ordering process"
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
            </form.Provider>
        </div>
    );
}