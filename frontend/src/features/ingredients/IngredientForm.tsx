"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useParams } from "@tanstack/react-router"
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
import { Loader2, Save, ArrowLeft, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { useIngredient, useCreateIngredient, useUpdateIngredient } from "../../hooks/useIngredients"
import { useCategoryList, useSubcategories } from "../../hooks/useCategories"
import { useQuery } from "@tanstack/react-query"
import { unitService } from "../../services/unit-service"

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
    // Check which route we're on using TanStack Router
    const pathname = window.location.pathname
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

    // Track if we're in the initial load process to prevent clearing subcategory
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    // Track form section validation status
    const [sectionErrors, setSectionErrors] = useState({
        basic: false,
        storage: false,
        supplier: false,
        attributes: false,
    })

    // Fetch categories
    const { data: categories, isLoading: categoriesLoading } = useCategoryList()

    // Fetch units
    const { data: units, isLoading: unitsLoading } = useQuery({
        queryKey: ["units"],
        queryFn: () => unitService.getAll(),
    })

    // Fetch ingredient data if editing
    const {
        data: ingredient,
        isLoading: ingredientLoading,
        isError: ingredientError,
    } = useIngredient(numericIngredientId || 0)

    // Log when ingredient data is received
    useEffect(() => {
        console.log("Ingredient data loaded:", ingredient)
    }, [ingredient])

    // State for selected category
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

    // Fetch subcategories based on selected category
    const { data: subcategories, isLoading: subcategoriesLoading } = useSubcategories(selectedCategoryId || 0)

    // Create form with default values
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            categoryId: undefined,
            subcategoryId: null, // Use null instead of undefined for optional IDs
            defaultUnitId: undefined,
            isPerishable: false,
            storageType: "ROOM_TEMPERATURE",
            shelfLifeDays: null, // Use null for optional numeric fields
            storageInstructions: "",
            supplierInstructions: "",
            supplierNotes: "",
            preferredSupplier: "",
            orderLeadTimeDays: null,
            costPerUnitDollars: null,
            packageSize: null,
            packageUnitId: null, // Use null for optional IDs
            isLocal: false,
            isOrganic: false,
            isSeasonalItem: false,
            hasVariablePrice: false,
            isCommonAllergen: false,
            isSpecialOrder: false,
        },
        mode: "onChange", // Validate on change for real-time feedback
    })

    // Update form values when ingredient data is loaded
    useEffect(() => {
        if (isEditing && ingredient) {
            console.log("Setting form values from ingredient:", ingredient)

            // First set selected category to ensure subcategories are loaded
            setSelectedCategoryId(ingredient.categoryId)

            // Mark that we're in the initial loading phase
            setIsInitialLoad(true)

            // Wait a bit longer to ensure subcategories are loaded
            setTimeout(() => {
                // Reset form with ingredient data - keep all values including null and undefined
                form.reset(
                    {
                        name: ingredient.name,
                        description: ingredient.description ?? "",
                        categoryId: ingredient.categoryId,
                        subcategoryId: ingredient.subcategoryId ?? null,
                        defaultUnitId: ingredient.defaultUnitId,
                        isPerishable: ingredient.isPerishable ?? false,
                        storageType: ingredient.storageType,
                        shelfLifeDays: ingredient.shelfLifeDays ?? null,
                        storageInstructions: ingredient.storageInstructions ?? "",
                        supplierInstructions: ingredient.supplierInstructions ?? "",
                        supplierNotes: ingredient.supplierNotes ?? "",
                        preferredSupplier: ingredient.preferredSupplier ?? "",
                        orderLeadTimeDays: ingredient.orderLeadTimeDays ?? null,
                        costPerUnitDollars: ingredient.costPerUnitDollars ?? null,
                        packageSize: ingredient.packageSize ?? null,
                        packageUnitId: ingredient.packageUnitId ?? null,
                        isLocal: ingredient.isLocal ?? false,
                        isOrganic: ingredient.isOrganic ?? false,
                        isSeasonalItem: ingredient.isSeasonalItem ?? false,
                        hasVariablePrice: ingredient.hasVariablePrice ?? false,
                        isCommonAllergen: ingredient.isCommonAllergen ?? false,
                        isSpecialOrder: ingredient.isSpecialOrder ?? false,
                    },
                    {
                        keepDefaultValues: false,
                        keepDirty: false,
                        keepErrors: false,
                        keepIsSubmitted: false,
                        keepTouched: false,
                        keepIsValid: false,
                        keepSubmitCount: false,
                    },
                )

                // Log current form values to verify
                console.log("Form values after reset:", form.getValues())

                // After a bit, mark initial load as complete
                setTimeout(() => {
                    setIsInitialLoad(false)
                }, 100)
            }, 300) // Increased timeout to ensure subcategories load
        } else {
            // For new ingredient form, mark initialLoad as false after a brief delay
            setTimeout(() => {
                setIsInitialLoad(false)
            }, 100)
        }
    }, [isEditing, ingredient, form])

    // Watch category_id to update subcategories
    const watchedCategoryId = form.watch("categoryId")

    useEffect(() => {
        console.log("watchedCategoryId changed:", watchedCategoryId)

        if (watchedCategoryId) {
            // Always set the selected category ID when it changes in the form
            if (watchedCategoryId !== selectedCategoryId) {
                console.log("Setting selectedCategoryId to:", watchedCategoryId)
                setSelectedCategoryId(watchedCategoryId)

                // Only clear subcategory when changing to a different category
                // AND we're not in the initial load process
                if (selectedCategoryId !== null && !isInitialLoad) {
                    console.log("Clearing subcategoryId value - not in initial load")
                    form.setValue("subcategoryId", null)
                } else {
                    console.log("Preserving subcategoryId - in initial load or first category set")
                }
            }
        }
    }, [watchedCategoryId, selectedCategoryId, form, isInitialLoad])

    // Update section error states based on form errors
    useEffect(() => {
        const errors = form.formState.errors

        setSectionErrors({
            basic: !!(errors.name || errors.description || errors.categoryId || errors.subcategoryId || errors.defaultUnitId),
            storage: !!(errors.isPerishable || errors.storageType || errors.shelfLifeDays || errors.storageInstructions),
            supplier: !!(
                errors.preferredSupplier ||
                errors.orderLeadTimeDays ||
                errors.costPerUnitDollars ||
                errors.packageSize ||
                errors.packageUnitId ||
                errors.supplierInstructions ||
                errors.supplierNotes
            ),
            attributes: !!(
                errors.isLocal ||
                errors.isOrganic ||
                errors.isSeasonalItem ||
                errors.hasVariablePrice ||
                errors.isCommonAllergen ||
                errors.isSpecialOrder
            ),
        })
    }, [form.formState.errors])

    // Create or update mutation
    const createMutation = useCreateIngredient()
    const updateMutation = useUpdateIngredient()

    const onSubmit = (values: FormValues) => {
        if (isEditing && numericIngredientId) {
            updateMutation.mutate(
                {
                    id: numericIngredientId,
                    data: values,
                },
                {
                    onSuccess: () => {
                        navigate({ to: "/ingredients" })
                    },
                },
            )
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    navigate({ to: "/ingredients" })
                },
            })
        }
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

    // Show validation errors at the top of the form
    const hasErrors = Object.keys(form.formState.errors).length > 0

    // Helper function to create required label
    const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
        <div className="flex items-center space-x-1">
            <span>{children}</span>
            <span className="text-destructive">*</span>
        </div>
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/ingredients">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">{isEditing ? `Editing: ${ingredient?.name}` : "Add Ingredient"}</h1>
            </div>

            {hasErrors && form.formState.submitCount > 0 && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>Please correct the errors in the form before submitting.</AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Basic Information Card */}
                        <Card className={sectionErrors.basic ? "border-destructive" : ""}>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center">
                                    Basic Information
                                    {sectionErrors.basic && <AlertCircle className="h-4 w-4 ml-2 text-destructive" />}
                                </CardTitle>
                                <CardDescription>Essential ingredient details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <RequiredLabel>Name</RequiredLabel>
                                            </FormLabel>
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
                                                <Textarea {...field} className="h-20 resize-none" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <RequiredLabel>Category</RequiredLabel>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(Number(value))
                                                        console.log("Category selected:", value)
                                                    }}
                                                    value={field.value?.toString() || ""}
                                                >
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
                                                <FormMessage className="text-xs" />
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
                                                    onValueChange={(value) => {
                                                        // Convert "none" string to null for the form value
                                                        const numValue = value === "none" ? null : Number(value)
                                                        field.onChange(numValue)
                                                        console.log("Subcategory selected:", numValue)
                                                    }}
                                                    // Convert null/undefined to "none" for the Select component
                                                    value={field.value?.toString() || "none"}
                                                    disabled={!selectedCategoryId || subcategoriesLoading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a subcategory" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
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
                                                <FormDescription className="text-xs">
                                                    {!selectedCategoryId
                                                        ? "Select a category first"
                                                        : subcategoriesLoading
                                                            ? "Loading subcategories..."
                                                            : "Optional"}
                                                </FormDescription>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="defaultUnitId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <RequiredLabel>Default Unit</RequiredLabel>
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(Number(value))
                                                    console.log("Default unit selected:", value)
                                                }}
                                                value={field.value?.toString() || ""}
                                            >
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
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Storage Information Card */}
                        <Card className={sectionErrors.storage ? "border-destructive" : ""}>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center">
                                    Storage Information
                                    {sectionErrors.storage && <AlertCircle className="h-4 w-4 ml-2 text-destructive" />}
                                </CardTitle>
                                <CardDescription>Storage conditions and shelf life</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="isPerishable"
                                        render={({ field }) => (
                                            <FormItem className="flex space-x-2 items-center h-10">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div>
                                                    <FormLabel>Perishable</FormLabel>
                                                </div>
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
                                </div>

                                <FormField
                                    control={form.control}
                                    name="storageType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <RequiredLabel>Storage Type</RequiredLabel>
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || "ROOM_TEMPERATURE"}
                                                defaultValue="ROOM_TEMPERATURE"
                                            >
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
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="storageInstructions"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Storage Instructions</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} value={field.value || ""} className="h-20 resize-none" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Supplier Information Card */}
                        <Card className={sectionErrors.supplier ? "border-destructive" : ""}>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center">
                                    Supplier Information
                                    {sectionErrors.supplier && <AlertCircle className="h-4 w-4 ml-2 text-destructive" />}
                                </CardTitle>
                                <CardDescription>Sourcing details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                                <FormLabel>Lead Time (Days)</FormLabel>
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
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                                    <div className="grid grid-cols-2 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="packageSize"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Pkg Size</FormLabel>
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
                                                    <FormLabel>Pkg Unit</FormLabel>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            const numValue = value === "none" ? null : Number(value)
                                                            field.onChange(numValue)
                                                        }}
                                                        value={field.value?.toString() || "none"}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Unit" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="none">None</SelectItem>
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
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="supplierInstructions"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Supplier Instructions</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} value={field.value || ""} className="h-16 resize-none" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="supplierNotes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Supplier Notes</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} value={field.value || ""} className="h-16 resize-none" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Additional Attributes Card */}
                        <Card className={sectionErrors.attributes ? "border-destructive" : ""}>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center">
                                    Additional Attributes
                                    {sectionErrors.attributes && <AlertCircle className="h-4 w-4 ml-2 text-destructive" />}
                                </CardTitle>
                                <CardDescription>Other ingredient properties</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="isLocal"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div>
                                                    <FormLabel>Local</FormLabel>
                                                    <FormDescription className="text-xs">Sourced locally</FormDescription>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isOrganic"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div>
                                                    <FormLabel>Organic</FormLabel>
                                                    <FormDescription className="text-xs">Certified organic</FormDescription>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isSeasonalItem"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div>
                                                    <FormLabel>Seasonal</FormLabel>
                                                    <FormDescription className="text-xs">Only available seasonally</FormDescription>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="hasVariablePrice"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div>
                                                    <FormLabel>Variable Price</FormLabel>
                                                    <FormDescription className="text-xs">Price fluctuates</FormDescription>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isCommonAllergen"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div>
                                                    <FormLabel>Common Allergen</FormLabel>
                                                    <FormDescription className="text-xs">Contains/is allergen</FormDescription>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isSpecialOrder"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div>
                                                    <FormLabel>Special Order</FormLabel>
                                                    <FormDescription className="text-xs">Special ordering process</FormDescription>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                        <Button type="button" variant="outline" onClick={() => navigate({ to: "/ingredients" })}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                            {(createMutation.isPending || updateMutation.isPending) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            <Save className="mr-2 h-4 w-4" />
                            {isEditing ? "Update Ingredient" : "Create Ingredient"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
