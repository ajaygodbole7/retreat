

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Checkbox } from "../../components/ui/checkbox"
import { Loader2, Plus, Trash2, Edit, Save, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../../components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../../components/ui/alert-dialog"
import { Link } from "@tanstack/react-router"
import { ingredientService } from "../../services/ingredient-service"
import { unitService } from "../../services/unit-service"
import { formatQuantity } from "../../utils/format-utils"
import { ensureArray } from "../../utils/array-utils"
import { useRecipe, useCreateCompleteRecipe, useUpdateCompleteRecipe } from "../../hooks/useRecipes"
import type { RecipeIngredient, RecipeStep, CreateRecipeInput, UpdateRecipeInput } from "@server/types/recipe-types"
import type { Ingredient } from "@server/types/ingredient-types"
import type { UnitOfMeasure } from "@server/types/ingredient-types"

// Enums for select options
enum CourseType {
    MAIN_COURSE = "MAIN_COURSE",
    SIDE_DISH = "SIDE_DISH",
    APPETIZER = "APPETIZER",
    DESSERT = "DESSERT",
    BREAKFAST = "BREAKFAST",
    SNACK = "SNACK",
    BEVERAGE = "BEVERAGE",
}

enum CookingMethod {
    STOVETOP = "STOVETOP",
    OVEN = "OVEN",
    PRESSURE_COOKER = "PRESSURE_COOKER",
    SLOW_COOK = "SLOW_COOK",
    STEAM = "STEAM",
    NO_COOK = "NO_COOK",
}

// Default values; note that servingSize is set to 8 as the baseline for ingredient quantities.
const defaultRecipe: Partial<CreateRecipeInput> = {
    name: "",
    description: "",
    servingSize: 8,
    preparationTimeMinutes: 15,
    cookingTimeMinutes: 30,
    courseType: "MAIN_COURSE",
    cookingMethod: "STOVETOP",
    isVegan: false,
    isGlutenFree: false,
    hasOnionGarlic: false,
    tags: "",
    notes: "",
    submittedBy: "",
}

const defaultIngredient: Partial<RecipeIngredient> = {
    quantity: 1,
    displayOrder: 0,
    isOptional: false,
    notes: "",
    scalingFactor: 1,
}

const defaultStep: Partial<RecipeStep> = {
    stepNumber: 1,
    instruction: "",
    isOptional: false,
}

export function RecipeForm() {

    // Access route params with strict: false to work with nested routes
    const params = useParams({ strict: false });

    // Get the recipeId from params
    const { recipeId } = params;

    // Convert to number if it's a valid ID (not "new" or other non-numeric value)
    const numericRecipeId = recipeId && recipeId !== "new" ? Number.parseInt(recipeId) : undefined;

    // Determine edit mode by checking if we have a valid numeric ID
    const isEditMode = !!numericRecipeId && !isNaN(numericRecipeId);

    const navigate = useNavigate();

    // Form state
    const [recipe, setRecipe] = useState<Partial<CreateRecipeInput | UpdateRecipeInput>>(defaultRecipe)
    const [ingredients, setIngredients] = useState<Partial<RecipeIngredient>[]>([])
    const [steps, setSteps] = useState<Partial<RecipeStep>[]>([])

    // Editing state for ingredient and step dialogs
    const [currentIngredient, setCurrentIngredient] = useState<Partial<RecipeIngredient>>(defaultIngredient)
    const [currentStep, setCurrentStep] = useState<Partial<RecipeStep>>(defaultStep)
    const [ingredientDialogOpen, setIngredientDialogOpen] = useState(false)
    const [stepDialogOpen, setStepDialogOpen] = useState(false)
    const [isEditingIngredient, setIsEditingIngredient] = useState(false)
    const [isEditingStep, setIsEditingStep] = useState(false)

    // Preview serving size & scaled ingredients state
    // The default baseline for ingredients is always 8 people.
    const [previewServingSize, setPreviewServingSize] = useState<number>(8)
    const [scaledIngredients, setScaledIngredients] = useState<Partial<RecipeIngredient>[]>([])

    // Loading state
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [loadError, setLoadError] = useState<Error | null>(null)

    // Reference data for ingredients and units
    const [allIngredients, setAllIngredients] = useState<Ingredient[]>([])
    const [allUnits, setAllUnits] = useState<UnitOfMeasure[]>([])

    // Load recipe data in edit mode
    const { data: recipeData, isLoading: isLoadingRecipe, error: recipeError } = useRecipe(numericRecipeId || 0, { enabled: isEditMode && !!numericRecipeId })

    const createCompleteMutation = useCreateCompleteRecipe()
    const updateCompleteMutation = useUpdateCompleteRecipe()

    // Load ingredients and units reference data
    useEffect(() => {
        const loadReferenceData = async () => {
            try {
                const [ingredients, units] = await Promise.all([ingredientService.getAll(), unitService.getAll()])
                setAllIngredients(ingredients)
                setAllUnits(units)
            } catch (error) {
                console.error("Error loading reference data:", error)
            }
        }
        loadReferenceData()
    }, [])

    // Populate form state when editing a recipe
    useEffect(() => {
        if (isEditMode && recipeData) {
            const { recipeIngredients, steps: recipeSteps, ...recipeDetails } = recipeData
            setRecipe(recipeDetails)
            setIngredients(ensureArray(recipeIngredients))
            setSteps(ensureArray(recipeSteps).sort((a, b) => a.stepNumber - b.stepNumber))
            // Although the recipe details may include a servingSize,
            // we always assume default ingredient quantities are for 8 people.
            setPreviewServingSize(8)
            setScaledIngredients(ensureArray(recipeIngredients))
        }
    }, [isEditMode, recipeData])

    // Update scaled ingredients when preview serving size changes.
    // The scale factor is computed relative to a base of 8 people.
    useEffect(() => {
        if (previewServingSize) {
            const scaleFactor = previewServingSize / 8
            const scaled = ingredients.map((ing) => ({
                ...ing,
                quantity: ing.quantity ? ing.quantity * scaleFactor : ing.quantity,
            }))
            setScaledIngredients(scaled)
        }
    }, [previewServingSize, ingredients])

    // Handlers for recipe fields
    const handleRecipeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setRecipe((prev) => ({ ...prev, [name]: value }))
    }
    const handleCheckboxChange = (name: string, checked: boolean) => {
        setRecipe((prev) => ({ ...prev, [name]: checked }))
    }
    const handleSelectChange = (name: string, value: string) => {
        setRecipe((prev) => ({ ...prev, [name]: value }))
    }
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        const numValue = value === "" ? undefined : Number.parseInt(value, 10)
        setRecipe((prev) => ({ ...prev, [name]: numValue }))
    }

    // Ingredient handlers
    const handleAddIngredient = () => {
        setCurrentIngredient({ ...defaultIngredient, displayOrder: ingredients.length + 1 })
        setIsEditingIngredient(false)
        setIngredientDialogOpen(true)
    }
    const handleEditIngredient = (ingredient: Partial<RecipeIngredient>) => {
        setCurrentIngredient(ingredient)
        setIsEditingIngredient(true)
        setIngredientDialogOpen(true)
    }
    const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setCurrentIngredient((prev) => ({ ...prev, [name]: value }))
    }
    const handleIngredientNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        const numValue = value === "" ? undefined : Number.parseFloat(value)
        setCurrentIngredient((prev) => ({ ...prev, [name]: numValue }))
    }
    const handleIngredientSelectChange = (name: string, value: string) => {
        const numValue =
            name === "ingredientId" || name === "unitId" || name === "alternateIngredientId"
                ? Number.parseInt(value, 10)
                : value
        setCurrentIngredient((prev) => ({ ...prev, [name]: numValue }))
    }
    const handleIngredientCheckboxChange = (name: string, checked: boolean) => {
        setCurrentIngredient((prev) => ({ ...prev, [name]: checked }))
    }
    const saveIngredient = () => {
        if (isEditingIngredient) {
            setIngredients((prev) => prev.map((ing) => (ing.id === currentIngredient.id ? currentIngredient : ing)))
        } else {
            setIngredients((prev) => [...prev, currentIngredient])
        }
        setIngredientDialogOpen(false)
    }
    const deleteIngredient = (id: number | undefined) => {
        if (id === undefined) return
        setIngredients((prev) => prev.filter((ing) => ing.id !== id))
    }

    // Step handlers
    const handleAddStep = () => {
        setCurrentStep({ ...defaultStep, stepNumber: steps.length + 1 })
        setIsEditingStep(false)
        setStepDialogOpen(true)
    }
    const handleEditStep = (step: Partial<RecipeStep>) => {
        setCurrentStep(step)
        setIsEditingStep(true)
        setStepDialogOpen(true)
    }
    const handleStepChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setCurrentStep((prev) => ({ ...prev, [name]: value }))
    }
    const handleStepNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        const numValue = value === "" ? undefined : Number.parseInt(value, 10)
        setCurrentStep((prev) => ({ ...prev, [name]: numValue }))
    }
    const saveStep = () => {
        if (isEditingStep) {
            setSteps((prev) => prev.map((step) => (step.id === currentStep.id ? currentStep : step)))
        } else {
            setSteps((prev) => [...prev, currentStep])
        }
        setStepDialogOpen(false)
    }
    const deleteStep = (id: number | undefined) => {
        if (id === undefined) return
        setSteps((prev) => prev.filter((step) => step.id !== id))
        // Renumber remaining steps
        setSteps((prev) =>
            prev
                .sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0))
                .map((step, index) => ({ ...step, stepNumber: index + 1 }))
        )
    }

    // Save recipe handler
    const saveRecipe = async () => {
        setIsSaving(true)
        try {
            const recipeData = { recipe, ingredients, steps }
            if (isEditMode && numericRecipeId) {
                await updateCompleteMutation.mutateAsync({ id: numericRecipeId, data: recipeData })
            } else {
                await createCompleteMutation.mutateAsync(recipeData)
            }
            navigate({ to: "/recipes" })
        } catch (error) {
            console.error("Error saving recipe:", error)
        } finally {
            setIsSaving(false)
        }
    }
    const handleCancel = () => {
        if (isEditMode && numericRecipeId) {
            navigate({ to: `/recipes/${ numericRecipeId }` })
        } else {
            navigate({ to: "/recipes" })
        }
    }
    const getIngredientName = (id: number | undefined) => {
        if (!id) return "Unknown"
        const ingredient = allIngredients.find((ing) => ing.id === id)
        return ingredient ? ingredient.name : "Unknown"
    }
    const getUnitName = (id: number | undefined) => {
        if (!id) return "Unknown"
        const unit = allUnits.find((u) => u.id === id)
        return unit ? (unit.abbreviation || unit.name) : "Unknown"
    }

    if (isLoadingRecipe || isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Loading recipe...</span>
            </div>
        )
    }
    if (isEditMode && (recipeError || loadError)) {
        return (
            <div className="text-center py-8 text-destructive">
                <h2 className="text-2xl font-bold mb-4">Error Loading Recipe</h2>
                <p>There was a problem loading the recipe details. Please try again.</p>
                <Button onClick={() => navigate({ to: "/recipes" })} className="mt-4" variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Recipes
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/recipes">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">{isEditMode ? "Edit Recipe" : "Create New Recipe"}</h1>
            </div>

            {/* Hybrid responsive grid: 3 columns on md+ screens; stacked on small screens */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recipe Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recipe Details</CardTitle>
                        <CardDescription>Enter the basic information about your recipe</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Recipe Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={recipe.name || ""}
                                    onChange={handleRecipeChange}
                                    placeholder="Enter recipe name"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={recipe.description || ""}
                                    onChange={handleRecipeChange}
                                    placeholder="Brief description of the recipe"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="servingSize">Serving Size</Label>
                                    <Input
                                        id="servingSize"
                                        name="servingSize"
                                        type="number"
                                        min="1"
                                        value={recipe.servingSize || ""}
                                        onChange={handleNumberChange}
                                        placeholder="8"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="previewServingSize">Preview Serving Size</Label>
                                    <Input
                                        id="previewServingSize"
                                        name="previewServingSize"
                                        type="number"
                                        min="1"
                                        value={previewServingSize || ""}
                                        onChange={(e) => setPreviewServingSize(Number.parseInt(e.target.value, 10))}
                                        placeholder="Enter number of people (e.g. 40)"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="preparationTimeMinutes">Prep Time (minutes)</Label>
                                    <Input
                                        id="preparationTimeMinutes"
                                        name="preparationTimeMinutes"
                                        type="number"
                                        min="0"
                                        value={recipe.preparationTimeMinutes || ""}
                                        onChange={handleNumberChange}
                                        placeholder="15"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="cookingTimeMinutes">Cook Time (minutes)</Label>
                                    <Input
                                        id="cookingTimeMinutes"
                                        name="cookingTimeMinutes"
                                        type="number"
                                        min="0"
                                        value={recipe.cookingTimeMinutes || ""}
                                        onChange={handleNumberChange}
                                        placeholder="30"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="courseType">Course Type</Label>
                                <Select
                                    value={recipe.courseType?.toString() || ""}
                                    onValueChange={(value) => handleSelectChange("courseType", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select course type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={CourseType.MAIN_COURSE}>Main Course</SelectItem>
                                        <SelectItem value={CourseType.SIDE_DISH}>Side Dish</SelectItem>
                                        <SelectItem value={CourseType.APPETIZER}>Appetizer</SelectItem>
                                        <SelectItem value={CourseType.DESSERT}>Dessert</SelectItem>
                                        <SelectItem value={CourseType.BREAKFAST}>Breakfast</SelectItem>
                                        <SelectItem value={CourseType.SNACK}>Snack</SelectItem>
                                        <SelectItem value={CourseType.BEVERAGE}>Beverage</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="cookingMethod">Cooking Method</Label>
                                <Select
                                    value={recipe.cookingMethod?.toString() || ""}
                                    onValueChange={(value) => handleSelectChange("cookingMethod", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select cooking method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={CookingMethod.STOVETOP}>Stovetop</SelectItem>
                                        <SelectItem value={CookingMethod.OVEN}>Oven</SelectItem>
                                        <SelectItem value={CookingMethod.PRESSURE_COOKER}>Pressure Cooker</SelectItem>
                                        <SelectItem value={CookingMethod.SLOW_COOK}>Slow Cook</SelectItem>
                                        <SelectItem value={CookingMethod.STEAM}>Steam</SelectItem>
                                        <SelectItem value={CookingMethod.NO_COOK}>No Cook</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Dietary Information</Label>
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isVegan"
                                            checked={recipe.isVegan || false}
                                            onCheckedChange={(checked) => handleCheckboxChange("isVegan", checked === true)}
                                        />
                                        <Label htmlFor="isVegan" className="font-normal">Vegan</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isGlutenFree"
                                            checked={recipe.isGlutenFree || false}
                                            onCheckedChange={(checked) => handleCheckboxChange("isGlutenFree", checked === true)}
                                        />
                                        <Label htmlFor="isGlutenFree" className="font-normal">Gluten Free</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="hasOnionGarlic"
                                            checked={recipe.hasOnionGarlic || false}
                                            onCheckedChange={(checked) => handleCheckboxChange("hasOnionGarlic", checked === true)}
                                        />
                                        <Label htmlFor="hasOnionGarlic" className="font-normal">Contains Onion/Garlic</Label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="tags">Tags</Label>
                                <Input
                                    id="tags"
                                    name="tags"
                                    value={recipe.tags || ""}
                                    onChange={handleRecipeChange}
                                    placeholder="Comma-separated tags"
                                />
                            </div>
                            <div>
                                <Label htmlFor="submittedBy">Submitted By</Label>
                                <Input
                                    id="submittedBy"
                                    name="submittedBy"
                                    value={recipe.submittedBy || ""}
                                    onChange={handleRecipeChange}
                                    placeholder="Your name"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                value={recipe.notes || ""}
                                onChange={handleRecipeChange}
                                placeholder="Additional notes about the recipe"
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Ingredients */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ingredients</CardTitle>
                        <CardDescription>
                            Add all ingredients and view both default and scaled quantities.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-sm text-muted-foreground">
                                Default for 8 servings
                            </div>
                            <Button onClick={handleAddIngredient} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Ingredient
                            </Button>
                        </div>
                        {/* Two sub-sections: Default & Scaled */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Default Quantities */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Default Quantities</h3>
                                {ingredients.length === 0 ? (
                                    <div className="text-center py-4 text-muted-foreground">
                                        No ingredients added.
                                    </div>
                                ) : (
                                    <div className="border rounded-md divide-y">
                                        {ingredients.map((ingredient, index) => (
                                            <div key={ingredient.id || index} className="p-3 flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium">
                                                        {getIngredientName(ingredient.ingredientId)}
                                                        {ingredient.isOptional && " (optional)"}
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="font-medium">
                                                            {ingredient.quantity ? formatQuantity(ingredient.quantity) : ""}
                                                        </span>{" "}
                                                        {getUnitName(ingredient.unitId)}
                                                        {ingredient.preparation && (
                                                            <span className="text-muted-foreground"> - {ingredient.preparation}</span>
                                                        )}
                                                    </div>
                                                    {ingredient.notes && <div className="text-xs text-muted-foreground">{ingredient.notes}</div>}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditIngredient(ingredient)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Ingredient</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this ingredient? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteIngredient(ingredient.id)}>
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Scaled Quantities */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Scaled Quantities</h3>
                                <div className="text-sm text-muted-foreground mb-2">
                                    Preview for {previewServingSize} servings (Scale Factor: {(previewServingSize / 8).toFixed(2)})
                                </div>
                                {scaledIngredients.length === 0 ? (
                                    <div className="text-center py-4 text-muted-foreground">
                                        No ingredients added.
                                    </div>
                                ) : (
                                    <div className="border rounded-md divide-y">
                                        {scaledIngredients.map((ingredient, index) => (
                                            <div key={ingredient.id || index} className="p-3 flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium">
                                                        {getIngredientName(ingredient.ingredientId)}
                                                        {ingredient.isOptional && " (optional)"}
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="font-medium">
                                                            {ingredient.quantity ? formatQuantity(ingredient.quantity) : ""}
                                                        </span>{" "}
                                                        {getUnitName(ingredient.unitId)}
                                                        {ingredient.preparation && (
                                                            <span className="text-muted-foreground"> - {ingredient.preparation}</span>
                                                        )}
                                                    </div>
                                                    {ingredient.notes && <div className="text-xs text-muted-foreground">{ingredient.notes}</div>}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditIngredient(ingredient)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Ingredient</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this ingredient? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteIngredient(ingredient.id)}>
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Preparation Steps */}
                <Card>
                    <CardHeader>
                        <CardTitle>Preparation Steps</CardTitle>
                        <CardDescription>Add step-by-step instructions for preparing this recipe</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-end mb-4">
                            <Button onClick={handleAddStep} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Step
                            </Button>
                        </div>
                        {steps.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                                No steps added yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {steps
                                    .sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0))
                                    .map((step, index) => (
                                        <Card key={step.id || index}>
                                            <CardHeader className="py-3">
                                                <div className="flex justify-between items-center">
                                                    <CardTitle className="text-lg">Step {step.stepNumber}</CardTitle>
                                                    <div className="flex space-x-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditStep(step)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Step</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete this step? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => deleteStep(step.id)}>Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="py-2">
                                                <p>{step.instruction}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Save and Cancel buttons */}
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button onClick={saveRecipe} disabled={isSaving || !recipe.name}>
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            {isEditMode ? "Update Recipe" : "Create Recipe"}
                        </>
                    )}
                </Button>
            </div>

            {/* Ingredient Dialog */}
            <Dialog open={ingredientDialogOpen} onOpenChange={setIngredientDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditingIngredient ? "Edit Ingredient" : "Add Ingredient"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="ingredientId">Ingredient</Label>
                            <Select
                                value={currentIngredient.ingredientId?.toString() || ""}
                                onValueChange={(value) => handleIngredientSelectChange("ingredientId", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select ingredient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allIngredients.map((ingredient) => (
                                        <SelectItem key={ingredient.id} value={ingredient.id.toString()}>
                                            {ingredient.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={currentIngredient.quantity || ""}
                                    onChange={handleIngredientNumberChange}
                                    placeholder="1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="unitId">Unit</Label>
                                <Select
                                    value={currentIngredient.unitId?.toString() || ""}
                                    onValueChange={(value) => handleIngredientSelectChange("unitId", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allUnits.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                {unit.name} ({unit.abbreviation})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="preparation">Preparation</Label>
                            <Input
                                id="preparation"
                                name="preparation"
                                value={currentIngredient.preparation || ""}
                                onChange={handleIngredientChange}
                                placeholder="e.g., chopped, diced, minced"
                            />
                        </div>
                        <div>
                            <Label htmlFor="alternateIngredientId">Alternate Ingredient (Optional)</Label>
                            <Select
                                value={currentIngredient.alternateIngredientId?.toString() || ""}
                                onValueChange={(value) => handleIngredientSelectChange("alternateIngredientId", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select alternate ingredient" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">None</SelectItem>
                                    {allIngredients.map((ingredient) => (
                                        <SelectItem key={ingredient.id} value={ingredient.id.toString()}>
                                            {ingredient.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="displayOrder">Display Order</Label>
                            <Input
                                id="displayOrder"
                                name="displayOrder"
                                type="number"
                                min="1"
                                value={currentIngredient.displayOrder || ""}
                                onChange={handleIngredientNumberChange}
                                placeholder="1"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isOptional"
                                checked={currentIngredient.isOptional || false}
                                onCheckedChange={(checked) => handleIngredientCheckboxChange("isOptional", checked === true)}
                            />
                            <Label htmlFor="isOptional" className="font-normal">
                                Optional Ingredient
                            </Label>
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                value={currentIngredient.notes || ""}
                                onChange={handleIngredientChange}
                                placeholder="E.g., finely chopped"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={saveIngredient} disabled={!currentIngredient.ingredientId || !currentIngredient.unitId}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Step Dialog */}
            <Dialog open={stepDialogOpen} onOpenChange={setStepDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditingStep ? "Edit Step" : "Add Step"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="stepNumber">Step Number</Label>
                            <Input
                                id="stepNumber"
                                name="stepNumber"
                                type="number"
                                min="1"
                                value={currentStep.stepNumber || ""}
                                onChange={handleStepNumberChange}
                                placeholder="1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="instruction">Instruction</Label>
                            <Textarea
                                id="instruction"
                                name="instruction"
                                value={currentStep.instruction || ""}
                                onChange={handleStepChange}
                                placeholder="Describe this step"
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="estimatedTimeMinutes">Estimated Time (minutes)</Label>
                            <Input
                                id="estimatedTimeMinutes"
                                name="estimatedTimeMinutes"
                                type="number"
                                min="0"
                                value={currentStep.estimatedTimeMinutes || ""}
                                onChange={handleStepNumberChange}
                                placeholder="5"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="stepIsOptional"
                                checked={currentStep.isOptional || false}
                                onCheckedChange={(checked) =>
                                    setCurrentStep((prev) => ({ ...prev, isOptional: checked === true }))
                                }
                            />
                            <Label htmlFor="stepIsOptional" className="font-normal">
                                Optional Step
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={saveStep} disabled={!currentStep.instruction}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}