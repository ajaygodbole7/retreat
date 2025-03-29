"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, Link, useMatch } from "@tanstack/react-router"
import { Button } from "../../components/ui/button"
import { Form } from "../../components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Loader2, Save, ArrowLeft, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { CourseType, CookingMethod } from "@server/types/recipe-types"
import { RecipeDetailsSection } from "./RecipeDetailsSection"
import { IngredientsSection } from "./IngredientsSection"
import { StepsSection } from "./StepsSection"
import { recipeService } from "../../services/recipe-service"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Define the form schema using zod
const recipeFormSchema = z.object({
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

type RecipeFormValues = z.infer<typeof recipeFormSchema>

export function CompleteRecipeForm() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    // Use useMatch to safely check if we're on the edit route
    const editMatch = useMatch({ to: "/recipes/$recipeId/edit" })
    const recipeId = editMatch?.params?.recipeId ? Number.parseInt(editMatch.params.recipeId, 10) : undefined

    const isEditing = !!recipeId && !isNaN(recipeId)

    // State for form
    const [formErrors, setFormErrors] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    // State for ingredients and steps
    const [ingredients, setIngredients] = useState<any[]>([])
    const [steps, setSteps] = useState<any[]>([])

    // State for scaling preview
    const [scalingServings, setScalingServings] = useState<number>(8)

    // Create form with default values
    const form = useForm<RecipeFormValues>({
        resolver: zodResolver(recipeFormSchema),
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
    const { data: recipe, isLoading: recipeLoading } = useQuery({
        queryKey: ["recipe", recipeId],
        queryFn: () => (recipeId ? recipeService.getById(recipeId) : null),
        enabled: isEditing,
    })

    // Create mutation for saving the complete recipe
    const createMutation = useMutation({
        mutationFn: (data: any) => recipeService.createComplete(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] })
            navigate({ to: `/recipes/${data.id}` })
        },
    })

    // Update mutation for updating the complete recipe
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => recipeService.updateComplete(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] })
            queryClient.invalidateQueries({ queryKey: ["recipe", data.id] })
            navigate({ to: `/recipes/${data.id}` })
        },
    })

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

            // Load ingredients and steps if available
            if (recipe.recipeIngredients) {
                setIngredients(
                    recipe.recipeIngredients.map((item: any) => ({
                        id: item.id,
                        ingredientId: item.ingredientId,
                        quantity: item.quantity,
                        unitId: item.unitId,
                        preparation: item.preparation,
                        isOptional: item.isOptional,
                        displayOrder: item.displayOrder,
                        notes: item.notes,
                        scalingFactor: item.scalingFactor,
                        alternateIngredientId: item.alternateIngredientId,
                    })),
                )
            }

            if (recipe.steps) {
                setSteps(
                    recipe.steps.map((item: any) => ({
                        id: item.id,
                        stepNumber: item.stepNumber,
                        instruction: item.instruction,
                        estimatedTimeMinutes: item.estimatedTimeMinutes,
                        isOptional: item.isOptional,
                    })),
                )
            }
        }
    }, [isEditing, recipe, form])

    // Update form errors state based on form errors
    useEffect(() => {
        const errors = form.formState.errors
        setFormErrors(Object.keys(errors).length > 0)
    }, [form.formState.errors])

    // Handle form submission
    const onSubmit = async (values: RecipeFormValues) => {
        if (formErrors) {
            return
        }

        setIsSaving(true)
        setSaveError(null)

        try {
            const completeRecipeData = {
                recipe: values,
                ingredients: ingredients,
                steps: steps,
            }

            if (isEditing && recipeId) {
                await updateMutation.mutateAsync({
                    id: recipeId,
                    data: completeRecipeData,
                })
            } else {
                await createMutation.mutateAsync(completeRecipeData)
            }
        } catch (error) {
            console.error("Error saving recipe:", error)
            setSaveError("Error saving recipe. Please try again.")
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

            {formErrors && form.formState.submitCount > 0 && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>Please correct the errors in the form before submitting.</AlertDescription>
                </Alert>
            )}

            {saveError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>{saveError}</AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column - Recipe Details */}
                    <div className="space-y-4">
                        <RecipeDetailsSection
                            form={form}
                            scalingServings={scalingServings}
                            setScalingServings={setScalingServings}
                        />
                    </div>

                    {/* Middle Column - Ingredients */}
                    <div>
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Ingredients</CardTitle>
                                <CardDescription>Add all ingredients for your recipe</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <IngredientsSection
                                    ingredients={ingredients}
                                    setIngredients={setIngredients}
                                    scalingServings={scalingServings}
                                    baseServingSize={form.watch("servingSize")}
                                />
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
                                <StepsSection steps={steps} setSteps={setSteps} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Form>
        </div>
    )
}