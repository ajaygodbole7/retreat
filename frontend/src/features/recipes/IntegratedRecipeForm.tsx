"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, Link } from "@tanstack/react-router"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Checkbox } from "../../components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { useRecipe, useCreateRecipe, useUpdateRecipe } from "../../hooks/useRecipes"
import { Loader2, Save, ArrowLeft, AlertCircle, Scale } from "lucide-react"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { CourseType, CookingMethod } from "@server/types/recipe-types"
import { formatCourseType, formatCookingMethod } from "../../utils/format-utils"
import { IntegratedIngredientsEditor } from "./IntegratedIngredientsEditor"
import { IntegratedStepsEditor } from "./IntegratedStepsEditor"

// Define the form schema using zod
const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional().nullable(),
    servingSize: z.number().int().positive("Serving size must be a positive number").default(8),
    preparationTimeMinutes: z.number().int().positive().optional().nullable(),
    cookingTimeMinutes: z.number().int().positive().optional().nullable(),
    totalTimeMinutes: z.number().int().positive().optional().nullable(),
    notes: z.string().optional().nullable(),
    cookingMethod: z.nativeEnum(CookingMethod).optional().nullable(),
    cookingEquipment: z.string().optional().nullable(),
    hasOnionGarlic: z.boolean().default(true),
    isGlutenFree: z.boolean().default(false),
    isVegan: z.boolean().default(false),
    courseType: z.nativeEnum(CourseType).default(CourseType.MAIN_COURSE),
    tags: z.string().optional().nullable(),
    submittedBy: z.string().optional().nullable(),
})

type FormValues = z.infer<typeof formSchema>

export function IntegratedRecipeForm() {
    // Check if we're on the edit route or new route
    const isEditRoute = window.location.pathname.includes("/edit")
    const isNewRoute = window.location.pathname.includes("/new")

    // Extract recipeId from URL if we're on the edit route
    let recipeId: string | undefined = undefined
    let numericRecipeId: number | undefined = undefined

    if (isEditRoute) {
        // Extract recipeId from URL path
        const pathParts = window.location.pathname.split("/")
        const idIndex = pathParts.findIndex((part) => part === "recipes") + 1
        if (idIndex > 0 && idIndex < pathParts.length) {
            recipeId = pathParts[idIndex]
            numericRecipeId = Number.parseInt(recipeId)
        }
    }

    const isEditing = !!recipeId && !isNaN(Number(recipeId))

    const navigate = useNavigate()
    const [formErrors, setFormErrors] = useState(false)
    const [ingredientsErrors, setIngredientsErrors] = useState(false)
    const [stepsErrors, setStepsErrors] = useState(false)

    // State for scaling preview
    const [scalingServings, setScalingServings] = useState<number>(8)

    // State for saving status
    const [isSaving, setIsSaving] = useState(false)
    const [saveStep, setSaveStep] = useState<string>("")

    // Create form with default values
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            servingSize: 8,
            preparationTimeMinutes: null,
            cookingTimeMinutes: null,
            totalTimeMinutes: null,
            notes: "",
            cookingMethod: null,
            cookingEquipment: "",
            hasOnionGarlic: true,
            isGlutenFree: false,
            isVegan: false,
            courseType: CourseType.MAIN_COURSE,
            tags: "",
            submittedBy: "",
        },
        mode: "onChange",
    })

    // Fetch recipe data if editing
    const { data: recipe, isLoading: recipeLoading } = useRecipe(numericRecipeId || 0, {
        enabled: isEditing && !!numericRecipeId,
    })

    const createMutation = useCreateRecipe()
    const updateMutation = useUpdateRecipe()

    // Update form values when recipe data is loaded
    useEffect(() => {
        if (isEditing && recipe) {
            form.reset({
                name: recipe.name,
                description: recipe.description ?? "",
                servingSize: recipe.servingSize,
                preparationTimeMinutes: recipe.preparationTimeMinutes,
                cookingTimeMinutes: recipe.cookingTimeMinutes,
                totalTimeMinutes: recipe.totalTimeMinutes,
                notes: recipe.notes ?? "",
                cookingMethod: recipe.cookingMethod,
                cookingEquipment: recipe.cookingEquipment ?? "",
                hasOnionGarlic: recipe.hasOnionGarlic,
                isGlutenFree: recipe.isGlutenFree,
                isVegan: recipe.isVegan,
                courseType: recipe.courseType,
                tags: recipe.tags ?? "",
                submittedBy: recipe.submittedBy ?? "",
            })

            // Set scaling servings to match recipe
            setScalingServings(recipe.servingSize)
        }
    }, [isEditing, recipe, form])

    // Update form errors state based on form errors
    useEffect(() => {
        const errors = form.formState.errors
        setFormErrors(Object.keys(errors).length > 0)
    }, [form.formState.errors])

    const onSubmit = async (values: FormValues) => {
        if (formErrors || ingredientsErrors || stepsErrors) {
            return
        }

        setIsSaving(true)
        setSaveStep("Saving recipe details...")

        try {
            if (isEditing && numericRecipeId) {
                await updateMutation.mutateAsync({
                    id: numericRecipeId,
                    data: values,
                })

                setSaveStep("Recipe updated successfully!")
                navigate({ to: `/recipes/${numericRecipeId}` })
            } else {
                const newRecipe = await createMutation.mutateAsync(values)
                setSaveStep("Recipe created successfully!")
                navigate({ to: `/recipes/${newRecipe.id}` })
            }
        } catch (error) {
            console.error("Error saving recipe:", error)
            setSaveStep("Error saving recipe. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    // Handle loading state
    if (isEditing && recipeLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Show validation errors at the top of the form
    const hasErrors = formErrors || ingredientsErrors || stepsErrors

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link to="/recipes">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{isEditing ? `Editing: ${recipe?.name}` : "Add Recipe"}</h1>
                </div>

                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => navigate({ to: "/recipes" })}>
                        Cancel
                    </Button>
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSaving || createMutation.isPending || updateMutation.isPending}
                    >
                        {(isSaving || createMutation.isPending || updateMutation.isPending) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <Save className="mr-2 h-4 w-4" />
                        {isEditing ? "Update Recipe" : "Create Recipe"}
                    </Button>
                </div>
            </div>

            {hasErrors && form.formState.submitCount > 0 && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>Please correct the errors in the form before submitting.</AlertDescription>
                </Alert>
            )}

            {saveStep && (
                <Alert variant={saveStep.includes("Error") ? "destructive" : "default"} className="mb-4">
                    <AlertDescription>{saveStep}</AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column - Recipe Details */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recipe Details</CardTitle>
                                <CardDescription>Basic information about your recipe</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <span className="flex items-center space-x-1">
                                                    <span>Recipe Name</span>
                                                    <span className="text-destructive">*</span>
                                                </span>
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
                                                <Textarea {...field} value={field.value || ""} className="h-20 resize-none" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="servingSize"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <span className="flex items-center space-x-1">
                                                        <span>Serving Size</span>
                                                        <span className="text-destructive">*</span>
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => {
                                                            const value = Number(e.target.value)
                                                            field.onChange(value)
                                                            setScalingServings(value)
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="courseType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    <span className="flex items-center space-x-1">
                                                        <span>Course Type</span>
                                                        <span className="text-destructive">*</span>
                                                    </span>
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select course type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.values(CourseType).map((type) => (
                                                            <SelectItem key={type} value={type}>
                                                                {formatCourseType(type)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="preparationTimeMinutes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Prep Time</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        value={field.value || ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value ? Number(e.target.value) : null
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
                                        name="cookingTimeMinutes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cook Time</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        value={field.value || ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value ? Number(e.target.value) : null
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
                                        name="totalTimeMinutes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Total Time</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        value={field.value || ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value ? Number(e.target.value) : null
                                                            field.onChange(value)
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="cookingMethod"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cooking Method</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select method" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        {Object.values(CookingMethod).map((method) => (
                                                            <SelectItem key={method} value={method}>
                                                                {formatCookingMethod(method)}
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
                                        name="cookingEquipment"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Equipment</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <FormField
                                        control={form.control}
                                        name="hasOnionGarlic"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div>
                                                    <FormLabel>Contains Onion/Garlic</FormLabel>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isGlutenFree"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div>
                                                    <FormLabel>Gluten Free</FormLabel>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isVegan"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div>
                                                    <FormLabel>Vegan</FormLabel>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tags</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ""} placeholder="Separate tags with commas" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="submittedBy"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Submitted By</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ""} />
                                            </FormControl>
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
                                                <Textarea {...field} value={field.value || ""} className="h-20 resize-none" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Scaling Preview Card */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center">
                                    <Scale className="mr-2 h-5 w-5" />
                                    Recipe Scaling Preview
                                </CardTitle>
                                <CardDescription>See how your recipe scales for different serving sizes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end gap-4">
                                    <div className="space-y-1">
                                        <label htmlFor="previewServingSize" className="text-sm font-medium">
                                            Preview Serving Size
                                        </label>
                                        <Input
                                            id="previewServingSize"
                                            type="number"
                                            min="1"
                                            className="w-32"
                                            value={scalingServings}
                                            onChange={(e) => {
                                                const value = Number.parseInt(e.target.value, 10)
                                                if (!isNaN(value) && value > 0) {
                                                    setScalingServings(value)
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        <span className="font-medium">Scaling factor:</span>{" "}
                                        {form.getValues().servingSize > 0
                                            ? (scalingServings / form.getValues().servingSize).toFixed(2)
                                            : "1.00"}
                                        x
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Middle Column - Ingredients */}
                    <div>
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Ingredients</CardTitle>
                                <CardDescription>Add all ingredients for your recipe</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!isEditing ? (
                                    <div className="text-center py-4 text-muted-foreground">Save the recipe first to add ingredients</div>
                                ) : (
                                    <IntegratedIngredientsEditor
                                        recipeId={numericRecipeId!}
                                        onErrorsChange={setIngredientsErrors}
                                        scalingServings={scalingServings}
                                        baseServingSize={form.getValues().servingSize}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Steps */}
                    <div>
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Preparation Steps</CardTitle>
                                <CardDescription>Add step-by-step instructions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!isEditing ? (
                                    <div className="text-center py-4 text-muted-foreground">
                                        Save the recipe first to add preparation steps
                                    </div>
                                ) : (
                                    <IntegratedStepsEditor recipeId={numericRecipeId!} onErrorsChange={setStepsErrors} />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Form>
        </div>
    )
}