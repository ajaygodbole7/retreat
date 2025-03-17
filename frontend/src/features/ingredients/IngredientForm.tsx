"use client"

// src/features/ingredients/IngredientForm.tsx
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useRouter, useParams } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { categoryApi, unitApi } from "../../lib/api";
import { Loader2, Save, ArrowLeft, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import {
    TextField,
    TextareaField,
    NumberField,
    CheckboxField,
    SelectField,
    FormErrorAlert,
    getSectionErrors,
    SelectOption
} from "../../lib/formUtils";
import { useIngredientMutation } from "../../hooks";

// Storage Type Enum
const StorageType = {
    ROOM_TEMPERATURE: "ROOM_TEMPERATURE",
    REFRIGERATED: "REFRIGERATED",
    FROZEN: "FROZEN",
    DRY_STORAGE: "DRY_STORAGE",
    COOL_DARK: "COOL_DARK",
} as const;

// Form sections for error tracking
const formSections = {
    basic: ["name", "description", "categoryId", "subcategoryId", "defaultUnitId"],
    storage: ["isPerishable", "storageType", "shelfLifeDays", "storageInstructions"],
    supplier: [
        "preferredSupplier",
        "orderLeadTimeDays",
        "costPerUnitDollars",
        "packageSize",
        "packageUnitId",
        "supplierInstructions",
        "supplierNotes"
    ],
    attributes: [
        "isLocal",
        "isOrganic",
        "isSeasonalItem",
        "hasVariablePrice",
        "isCommonAllergen",
        "isSpecialOrder"
    ],
};

export function IngredientForm() {
    // Get the route params from TanStack Router
    const router = useRouter();
    const pathname = router.state.location.pathname;
    const isEditRoute = pathname.includes("/edit");
    const params = useParams({
        from: isEditRoute ? "/ingredients/$ingredientId/edit" : "/ingredients/new",
    });

    const ingredientId = params.ingredientId;
    const numericIngredientId = ingredientId ? Number.parseInt(ingredientId) : undefined;
    const isEditing = !!numericIngredientId && !isNaN(numericIngredientId);

    const navigate = useNavigate();

    // Track form section validation status
    const [sectionErrors, setSectionErrors] = useState({
        basic: false,
        storage: false,
        supplier: false,
        attributes: false,
    });

    // Form state
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for selected category
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    // Fetch data with React Query
    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryApi.getAll(),
    });

    const { data: units, isLoading: unitsLoading } = useQuery({
        queryKey: ["units"],
        queryFn: () => unitApi.getAll(),
    });

    const { data: subcategories, isLoading: subcategoriesLoading } = useQuery({
        queryKey: ["subcategories", selectedCategoryId],
        queryFn: () => categoryApi.getSubcategories(selectedCategoryId),
        enabled: !!selectedCategoryId,
    });

    const {
        data: ingredient,
        isLoading: ingredientLoading,
        isError: ingredientError,
    } = useQuery({
        queryKey: ["ingredient", numericIngredientId],
        queryFn: () => (numericIngredientId ? ingredientApi.getById(numericIngredientId) : null),
        enabled: isEditing,
    });

    // Create or update mutation using our custom hook
    const mutation = useIngredientMutation(
        isEditing,
        numericIngredientId,
        () => navigate({ to: "/ingredients" })
    );

    // Prepare initial values for the form
    const initialValues = isEditing && ingredient
        ? {
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
        }
        : {
            name: "",
            description: "",
            categoryId: undefined,
            subcategoryId: null,
            defaultUnitId: undefined,
            isPerishable: false,
            storageType: "ROOM_TEMPERATURE" as const,
            shelfLifeDays: null,
            storageInstructions: "",
            supplierInstructions: "",
            supplierNotes: "",
            preferredSupplier: "",
            orderLeadTimeDays: null,
            costPerUnitDollars: null,
            packageSize: null,
            packageUnitId: null,
            isLocal: false,
            isOrganic: false,
            isSeasonalItem: false,
            hasVariablePrice: false,
            isCommonAllergen: false,
            isSpecialOrder: false,
        };

    // For select options
    const categoryOptions: SelectOption[] = (categories || []).map(category => ({
        value: category.id.toString(),
        label: category.name
    }));

    const subcategoryOptions: SelectOption[] = (subcategories || []).map(subcategory => ({
        value: subcategory.id.toString(),
        label: subcategory.name
    }));

    const unitOptions: SelectOption[] = (units || []).map(unit => ({
        value: unit.id.toString(),
        label: `${unit.name} (${unit.abbreviation})`
    }));

    const storageTypeOptions: SelectOption[] = [
        { value: "ROOM_TEMPERATURE", label: "Room Temperature" },
        { value: "REFRIGERATED", label: "Refrigerated" },
        { value: "FROZEN", label: "Frozen" },
        { value: "DRY_STORAGE", label: "Dry Storage" },
        { value: "COOL_DARK", label: "Cool & Dark" },
    ];

    // Set up initial category ID for editing mode
    useEffect(() => {
        if (isEditing && ingredient?.categoryId) {
            setSelectedCategoryId(ingredient.categoryId);
        }
    }, [isEditing, ingredient]);

    // Use a simpler approach with React Hook Form
    const form = useForm({
        defaultValues: initialValues
    });

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setFormError(null);

            const values = form.getFieldValues();
            await mutation.mutateAsync(values);
        } catch (error) {
            console.error("Form submission error:", error);
            setFormError("Failed to save ingredient. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle loading state
    if ((isEditing && ingredientLoading) || categoriesLoading || unitsLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Handle error state for editing an ingredient
    if (isEditing && ingredientError) {
        return (
            <div className="text-center py-8 text-destructive">
                <h2 className="text-2xl font-bold mb-4">Error Loading Ingredient</h2>
                <p>There was a problem loading the ingredient details. Please try again.</p>
                <Button onClick={() => navigate({ to: "/ingredients" })} className="mt-4" variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Ingredients
                </Button>
            </div>
        );
    }

    // Handle not found state for editing
    if (isEditing && !ingredient) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <h2 className="text-2xl font-bold mb-4">Ingredient Not Found</h2>
                <p>The ingredient you're trying to edit doesn't exist or has been removed.</p>
                <Button onClick={() => navigate({ to: "/ingredients" })} className="mt-4" variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Ingredients
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/ingredients">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">
                    {isEditing ? `Editing: ${ingredient?.name}` : "Add Ingredient"}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Information Card */}
                    <Card className={sectionErrors.basic ? "border-destructive" : ""}>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center">
                                Basic Information
                                {sectionErrors.basic && (
                                    <AlertCircle className="h-4 w-4 ml-2 text-destructive" />
                                )}
                            </CardTitle>
                            <CardDescription>Essential ingredient details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form.Field
                                name="name"
                                validators={{
                                    onChange: (value) => value && value.length > 0 ? undefined : "Name is required"
                                }}
                            >
                                {(field) => (
                                    <TextField
                                        field={field}
                                        label="Name"
                                        required
                                        placeholder="Enter ingredient name"
                                    />
                                )}
                            </form.Field>

                            <form.Field
                                name="description"
                            >
                                {(field) => (
                                    <TextareaField
                                        field={field}
                                        label="Description"
                                    />
                                )}
                            </form.Field>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <form.Field
                                    name="categoryId"
                                    validators={{
                                        onChange: (value) => value ? undefined : "Category is required"
                                    }}
                                >
                                    {(field) => (
                                        <SelectField
                                            field={field}
                                            label="Category"
                                            required
                                            options={categoryOptions}
                                            placeholder="Select a category"
                                            loading={categoriesLoading}
                                        />
                                    )}
                                </form.Field>

                                <form.Field
                                    name="subcategoryId"
                                >
                                    {(field) => (
                                        <SelectField
                                            field={field}
                                            label="Subcategory"
                                            options={subcategoryOptions}
                                            placeholder="Select a subcategory"
                                            disabled={!selectedCategoryId}
                                            loading={subcategoriesLoading && !!selectedCategoryId}
                                            allowEmpty={true}
                                            emptyValue="none"
                                            description="Select a category first"
                                        />
                                    )}
                                </form.Field>
                            </div>

                            <form.Field
                                name="defaultUnitId"
                                validators={{
                                    onChange: (value) => value ? undefined : "Default unit is required"
                                }}
                            >
                                {(field) => (
                                    <SelectField
                                        field={field}
                                        label="Default Unit"
                                        required
                                        options={unitOptions}
                                        placeholder="Select a unit"
                                        loading={unitsLoading}
                                    />
                                )}
                            </form.Field>
                        </CardContent>
                    </Card>

                    {/* Storage Information Card */}
                    <Card className={sectionErrors.storage ? "border-destructive" : ""}>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center">
                                Storage Information
                                {sectionErrors.storage && (
                                    <AlertCircle className="h-4 w-4 ml-2 text-destructive" />
                                )}
                            </CardTitle>
                            <CardDescription>Storage conditions and shelf life</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <form.Field
                                    name="isPerishable"
                                >
                                    {(field) => (
                                        <CheckboxField
                                            field={field}
                                            label="Perishable"
                                        />
                                    )}
                                </form.Field>

                                <form.Field
                                    name="shelfLifeDays"
                                >
                                    {(field) => (
                                        <NumberField
                                            field={field}
                                            label="Shelf Life (Days)"
                                        />
                                    )}
                                </form.Field>
                            </div>

                            <form.Field
                                name="storageType"
                            >
                                {(field) => (
                                    <SelectField
                                        field={field}
                                        label="Storage Type"
                                        required
                                        options={storageTypeOptions}
                                        placeholder="Select storage type"
                                    />
                                )}
                            </form.Field>

                            <form.Field
                                name="storageInstructions"
                            >
                                {(field) => (
                                    <TextareaField
                                        field={field}
                                        label="Storage Instructions"
                                    />
                                )}
                            </form.Field>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Supplier Information Card */}
                    <Card className={sectionErrors.supplier ? "border-destructive" : ""}>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center">
                                Supplier Information
                                {sectionErrors.supplier && (
                                    <AlertCircle className="h-4 w-4 ml-2 text-destructive" />
                                )}
                            </CardTitle>
                            <CardDescription>Sourcing details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <form.Field name="preferredSupplier">
                                    {(field) => (
                                        <TextField
                                            field={field}
                                            label="Preferred Supplier"
                                        />
                                    )}
                                </form.Field>

                                <form.Field name="orderLeadTimeDays">
                                    {(field) => (
                                        <NumberField
                                            field={field}
                                            label="Lead Time (Days)"
                                        />
                                    )}
                                </form.Field>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <form.Field name="costPerUnitDollars">
                                    {(field) => (
                                        <NumberField
                                            field={field}
                                            label="Cost Per Unit ($)"
                                            step="0.01"
                                        />
                                    )}
                                </form.Field>

                                <div className="grid grid-cols-2 gap-2">
                                    <form.Field name="packageSize">
                                        {(field) => (
                                            <NumberField
                                                field={field}
                                                label="Pkg Size"
                                                step="0.01"
                                            />
                                        )}
                                    </form.Field>

                                    <form.Field name="packageUnitId">
                                        {(field) => (
                                            <SelectField
                                                field={field}
                                                label="Pkg Unit"
                                                options={unitOptions}
                                                placeholder="Unit"
                                                loading={unitsLoading}
                                                allowEmpty={true}
                                                emptyValue="none"
                                            />
                                        )}
                                    </form.Field>
                                </div>
                            </div>

                            <form.Field name="supplierInstructions">
                                {(field) => (
                                    <TextareaField
                                        field={field}
                                        label="Supplier Instructions"
                                        className="h-16 resize-none"
                                    />
                                )}
                            </form.Field>

                            <form.Field name="supplierNotes">
                                {(field) => (
                                    <TextareaField
                                        field={field}
                                        label="Supplier Notes"
                                        className="h-16 resize-none"
                                    />
                                )}
                            </form.Field>
                        </CardContent>
                    </Card>

                    {/* Additional Attributes Card */}
                    <Card className={sectionErrors.attributes ? "border-destructive" : ""}>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center">
                                Additional Attributes
                                {sectionErrors.attributes && (
                                    <AlertCircle className="h-4 w-4 ml-2 text-destructive" />
                                )}
                            </CardTitle>
                            <CardDescription>Other ingredient properties</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <form.Field name="isLocal">
                                    {(field) => (
                                        <CheckboxField
                                            field={field}
                                            label="Local"
                                            description="Sourced locally"
                                        />
                                    )}
                                </form.Field>

                                <form.Field name="isOrganic">
                                    {(field) => (
                                        <CheckboxField
                                            field={field}
                                            label="Organic"
                                            description="Certified organic"
                                        />
                                    )}
                                </form.Field>

                                <form.Field name="isSeasonalItem">
                                    {(field) => (
                                        <CheckboxField
                                            field={field}
                                            label="Seasonal"
                                            description="Only available seasonally"
                                        />
                                    )}
                                </form.Field>

                                <form.Field name="hasVariablePrice">
                                    {(field) => (
                                        <CheckboxField
                                            field={field}
                                            label="Variable Price"
                                            description="Price fluctuates"
                                        />
                                    )}
                                </form.Field>

                                <form.Field name="isCommonAllergen">
                                    {(field) => (
                                        <CheckboxField
                                            field={field}
                                            label="Common Allergen"
                                            description="Contains/is allergen"
                                        />
                                    )}
                                </form.Field>

                                <form.Field name="isSpecialOrder">
                                    {(field) => (
                                        <CheckboxField
                                            field={field}
                                            label="Special Order"
                                            description="Special ordering process"
                                        />
                                    )}
                                </form.Field>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    <Button type="button" variant="outline" onClick={() => navigate({ to: "/ingredients" })}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || mutation.isPending}
                    >
                        {(isSubmitting || mutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        {isEditing ? "Update Ingredient" : "Create Ingredient"}
                    </Button>
                </div>
            </form>
        </div>
    );
}