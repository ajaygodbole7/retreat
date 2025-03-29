"use client"

import { useState } from "react"
import { useParams, Link, useNavigate } from "@tanstack/react-router"
import { useRecipe, useScaleRecipe, useDeleteRecipe } from "../../hooks/useRecipes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    ChefHat,
    Clock,
    Edit,
    Trash2,
    ArrowLeft,
    Loader2,
    Users,
    Utensils,
    Scale,
    Leaf,
    Wheat,
    AlertCircle,
    Tag,
    CalendarClock,
} from "lucide-react"
import {
    getCourseTypeLabel,
    getCookingMethodLabel,
    formatTime,
    formatDate,
    formatQuantity,
} from "../../utils/format-utils"
import { ensureArray } from "../../utils/array-utils"

export function RecipeDetail() {
    const params = useParams({ from: "/recipes/$recipeId" })
    const recipeId = Number.parseInt(params.recipeId, 10)
    const navigate = useNavigate()

    // State for scaling
    const [targetServingSize, setTargetServingSize] = useState<number | "">("")
    const [isScaling, setIsScaling] = useState(false)

    // State for delete confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    // Fetch recipe data
    const { data: recipe, isLoading, isError } = useRecipe(recipeId)

    // Fetch scaled recipe if scaling is active
    const { data: scaledRecipe, isLoading: isLoadingScaled } = useScaleRecipe(
        recipeId,
        typeof targetServingSize === "number" ? targetServingSize : 0,
    )

    // Delete recipe mutation
    const deleteRecipeMutation = useDeleteRecipe()

    // Handle delete confirmation
    const handleDeleteClick = () => {
        setDeleteDialogOpen(true)
    }

    // Handle confirmed delete
    const handleConfirmDelete = async () => {
        await deleteRecipeMutation.mutateAsync(recipeId)
        setDeleteDialogOpen(false)
        navigate({ to: "/recipes" })
    }

    // Handle scaling
    const handleScaleRecipe = () => {
        if (recipe && typeof targetServingSize === "number" && targetServingSize > 0) {
            setIsScaling(true)
        }
    }

    // Reset scaling
    const resetScaling = () => {
        setIsScaling(false)
        setTargetServingSize("")
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Error state
    if (isError || !recipe) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Recipe Not Found</h2>
                <p className="text-muted-foreground mb-6">The recipe you're looking for doesn't exist or has been removed.</p>
                <Button variant="outline" asChild>
                    <Link to="/recipes">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Recipes
                    </Link>
                </Button>
            </div>
        )
    }

    // Determine which recipe data to use (original or scaled)
    const displayRecipe = isScaling && scaledRecipe ? scaledRecipe : recipe

    // Ensure ingredients and steps are arrays
    const ingredients =
        isScaling && scaledRecipe ? ensureArray(scaledRecipe.scaledIngredients) : ensureArray(recipe.recipeIngredients)

    const steps = ensureArray(recipe.steps)

    return (
        <div className="container mx-auto py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link to="/recipes">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">{recipe.name}</h1>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to={`/recipes/${recipeId}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Link>
                    </Button>

                    <Button variant="destructive" onClick={handleDeleteClick}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Recipe Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
                <Badge className="bg-primary text-primary-foreground">{getCourseTypeLabel(recipe.courseType)}</Badge>

                <Badge variant="outline">
                    <Users className="mr-1 h-3.5 w-3.5" />
                    Serves {recipe.servingSize}
                </Badge>

                {recipe.isVegan && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Leaf className="mr-1 h-3.5 w-3.5" />
                        Vegan
                    </Badge>
                )}

                {recipe.isGlutenFree && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <Wheat className="mr-1 h-3.5 w-3.5" />
                        Gluten-Free
                    </Badge>
                )}

                {recipe.hasOnionGarlic && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        <AlertCircle className="mr-1 h-3.5 w-3.5" />
                        Contains Onion/Garlic
                    </Badge>
                )}
            </div>

            {/* Recipe Scaling Card */}
            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                        <Scale className="mr-2 h-5 w-5" />
                        Recipe Scaling
                    </CardTitle>
                    <CardDescription>Adjust serving size to automatically scale ingredient quantities</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="space-y-1">
                            <label htmlFor="servingSize" className="text-sm font-medium">
                                Target Serving Size
                            </label>
                            <Input
                                id="servingSize"
                                type="number"
                                min="1"
                                className="w-32"
                                value={targetServingSize}
                                onChange={(e) => {
                                    const value = e.target.value ? Number.parseInt(e.target.value, 10) : ""
                                    setTargetServingSize(value)
                                }}
                                placeholder={recipe.servingSize.toString()}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleScaleRecipe}
                                disabled={typeof targetServingSize !== "number" || targetServingSize <= 0}
                            >
                                {isLoadingScaled ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Scale className="mr-2 h-4 w-4" />
                                )}
                                Scale Recipe
                            </Button>

                            {isScaling && (
                                <Button variant="outline" onClick={resetScaling}>
                                    Reset to Original
                                </Button>
                            )}
                        </div>

                        {isScaling && scaledRecipe && (
                            <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Scaling factor:</span> {scaledRecipe.scalingFactor.toFixed(2)}x (from{" "}
                                {scaledRecipe.originalServingSize} to {scaledRecipe.targetServingSize} servings)
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recipe Content Tabs */}
            <Tabs defaultValue="details">
                <TabsList className="mb-6">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                    <TabsTrigger value="steps">Steps</TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recipe Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {recipe.description && (
                                <div className="col-span-full">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                                    <p>{recipe.description}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Cooking Method</h3>
                                <p className="flex items-center">
                                    <Utensils className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {getCookingMethodLabel(recipe.cookingMethod)}
                                </p>
                            </div>

                            {recipe.cookingEquipment && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Equipment Needed</h3>
                                    <p>{recipe.cookingEquipment}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Preparation Time</h3>
                                <p className="flex items-center">
                                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {formatTime(recipe.preparationTimeMinutes)}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Cooking Time</h3>
                                <p className="flex items-center">
                                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {formatTime(recipe.cookingTimeMinutes)}
                                </p>
                            </div>

                            {recipe.totalTimeMinutes && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Time</h3>
                                    <p className="flex items-center">
                                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {formatTime(recipe.totalTimeMinutes)}
                                    </p>
                                </div>
                            )}

                            {recipe.submittedBy && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Submitted By</h3>
                                    <p className="flex items-center">
                                        <ChefHat className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {recipe.submittedBy}
                                    </p>
                                </div>
                            )}

                            {recipe.createdAt && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                                    <p className="flex items-center">
                                        <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {formatDate(recipe.createdAt)}
                                    </p>
                                </div>
                            )}

                            {recipe.tags && (
                                <div className="col-span-full">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {recipe.tags.split(",").map((tag, index) => (
                                            <Badge key={index} variant="secondary">
                                                <Tag className="mr-1 h-3.5 w-3.5" />
                                                {tag.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {recipe.notes && (
                                <div className="col-span-full">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
                                    <p>{recipe.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Ingredients Tab */}
                <TabsContent value="ingredients" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ingredients</CardTitle>
                            <CardDescription>
                                {isScaling && scaledRecipe
                                    ? `Ingredients for ${scaledRecipe.targetServingSize} servings`
                                    : `Ingredients for ${recipe.servingSize} servings`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {ingredients && ingredients.length > 0 ? (
                                <ul className="space-y-3">
                                    {ingredients.map((ingredient, index) => (
                                        <li key={ingredient.id || index} className="flex justify-between items-center border-b pb-2">
                                            <div className="flex-1">
                                                <span className="font-medium">{ingredient.ingredient?.name || "Unknown Ingredient"}</span>
                                                {ingredient.preparation && (
                                                    <span className="text-muted-foreground"> ({ingredient.preparation})</span>
                                                )}
                                                {ingredient.isOptional && (
                                                    <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
                                                )}
                                                {ingredient.notes && (
                                                    <div className="text-xs text-muted-foreground mt-1">{ingredient.notes}</div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span>
                                                    {isScaling && "scaledQuantity" in ingredient
                                                        ? formatQuantity(ingredient.scaledQuantity)
                                                        : formatQuantity(ingredient.quantity)}{" "}
                                                    {ingredient.unit?.abbreviation || "units"}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">No ingredients added yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Steps Tab */}
                <TabsContent value="steps" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preparation Steps</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {steps && steps.length > 0 ? (
                                <ol className="space-y-6 list-decimal list-inside">
                                    {steps
                                        .sort((a, b) => a.stepNumber - b.stepNumber)
                                        .map((step, index) => (
                                            <li key={step.id || index} className="pl-2">
                                                <div className="inline-block">
                                                    <div className="font-medium mb-1">Step {step.stepNumber}</div>
                                                    <p>{step.instruction}</p>
                                                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                                                        {step.estimatedTimeMinutes && (
                                                            <span className="flex items-center">
                                                                <Clock className="mr-1 h-3.5 w-3.5" />
                                                                {formatTime(step.estimatedTimeMinutes)}
                                                            </span>
                                                        )}
                                                        {step.isOptional && <Badge variant="outline">Optional</Badge>}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                </ol>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">No steps added yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Recipe</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{recipe.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={deleteRecipeMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteRecipeMutation.isPending}>
                            {deleteRecipeMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default RecipeDetail