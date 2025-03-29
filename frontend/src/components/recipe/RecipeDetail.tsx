"use client"

import { useState } from "react"
import { useParams, useNavigate, Link } from "@tanstack/react-router"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Input } from "../../components/ui/input"
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
import { useRecipe, useDeleteRecipe, useScaleRecipe } from "../../hooks/useRecipes"
import { Edit, Trash2, ArrowLeft, Loader2, Clock, Users, UtensilsCrossed, ChefHat, Scale } from "lucide-react"
import { formatCourseType, formatCookingMethod, formatNumber } from "../../utils/format-utils"

export function RecipeDetail() {
    const params = useParams({ from: "/recipes/$recipeId" })
    const { recipeId } = params
    const navigate = useNavigate()

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [targetServingSize, setTargetServingSize] = useState<number | "">("")
    const [isScaling, setIsScaling] = useState(false)

    const numericRecipeId = Number.parseInt(recipeId)

    // Fetch recipe data
    const { data: recipe, isLoading, error } = useRecipe(numericRecipeId)

    // Fetch scaled recipe if scaling is active
    const { data: scaledRecipe, isLoading: isLoadingScaled } = useScaleRecipe(
        numericRecipeId,
        typeof targetServingSize === "number" ? targetServingSize : 0,
    )

    const deleteMutation = useDeleteRecipe()

    const handleDelete = () => {
        deleteMutation.mutate(numericRecipeId, {
            onSuccess: () => {
                navigate({ to: "/recipes" })
            },
        })
    }

    const handleScaleRecipe = () => {
        if (recipe && typeof targetServingSize === "number" && targetServingSize > 0) {
            setIsScaling(true)
        }
    }

    const resetScaling = () => {
        setIsScaling(false)
        setTargetServingSize("")
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
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

    if (!recipe) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <h2 className="text-2xl font-bold mb-4">Recipe Not Found</h2>
                <p>The recipe you're looking for doesn't exist or has been removed.</p>
                <Button onClick={() => navigate({ to: "/recipes" })} className="mt-4" variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Recipes
                </Button>
            </div>
        )
    }

    // Determine which recipe data to use (original or scaled)
    const displayRecipe = isScaling && scaledRecipe ? scaledRecipe : recipe
    const ingredients = isScaling && scaledRecipe ? scaledRecipe.scaledIngredients : recipe.recipeIngredients

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
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
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Link>
                    </Button>

                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete {recipe.name}. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {deleteMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Trash2 className="h-4 w-4 mr-2" />
                                    )}
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{formatCourseType(recipe.courseType)}</Badge>
                <Badge variant="outline">
                    <Users className="h-4 w-4 mr-1" />
                    Serves {recipe.servingSize}
                </Badge>
                {recipe.isVegan && <Badge variant="secondary">Vegan</Badge>}
                {recipe.isGlutenFree && <Badge variant="secondary">Gluten-Free</Badge>}
                {!recipe.hasOnionGarlic && <Badge variant="secondary">No Onion/Garlic</Badge>}
            </div>

            {/* Recipe scaling controls */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                        <Scale className="h-5 w-5 mr-2" />
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
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Scale className="h-4 w-4 mr-2" />
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

            <Tabs defaultValue="details">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                    <TabsTrigger value="steps">Steps</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recipe Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recipe.description && (
                                <div className="col-span-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                                    <p>{recipe.description}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Cooking Method</h3>
                                <p className="flex items-center">
                                    <UtensilsCrossed className="h-4 w-4 mr-1 text-muted-foreground" />
                                    {formatCookingMethod(recipe.cookingMethod)}
                                </p>
                            </div>

                            {recipe.cookingEquipment && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Equipment Needed</h3>
                                    <p>{recipe.cookingEquipment}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Preparation Time</h3>
                                <p className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                    {recipe.preparationTimeMinutes ? `${recipe.preparationTimeMinutes} minutes` : "Not specified"}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Cooking Time</h3>
                                <p className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                    {recipe.cookingTimeMinutes ? `${recipe.cookingTimeMinutes} minutes` : "Not specified"}
                                </p>
                            </div>

                            {recipe.notes && (
                                <div className="col-span-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                                    <p>{recipe.notes}</p>
                                </div>
                            )}

                            {recipe.submittedBy && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Submitted By</h3>
                                    <p className="flex items-center">
                                        <ChefHat className="h-4 w-4 mr-1 text-muted-foreground" />
                                        {recipe.submittedBy}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ingredients" className="space-y-4">
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
                                <ul className="space-y-2">
                                    {ingredients.map((ingredient) => (
                                        <li key={ingredient.id} className="flex justify-between items-center border-b pb-2">
                                            <div className="flex-1">
                                                <span className="font-medium">{ingredient.ingredient.name}</span>
                                                {ingredient.preparation && (
                                                    <span className="text-muted-foreground"> ({ingredient.preparation})</span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span>
                                                    {isScaling && "scaledQuantity" in ingredient
                                                        ? formatNumber(ingredient.scaledQuantity)
                                                        : formatNumber(ingredient.quantity)}{" "}
                                                    {ingredient.unit.abbreviation}
                                                </span>
                                                {ingredient.isOptional && (
                                                    <Badge variant="outline" className="ml-2">
                                                        Optional
                                                    </Badge>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">No ingredients added yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="steps" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preparation Steps</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recipe.steps && recipe.steps.length > 0 ? (
                                <ol className="space-y-4 list-decimal list-inside">
                                    {recipe.steps.map((step) => (
                                        <li key={step.id} className="pl-2">
                                            <div className="inline-block">
                                                {step.instruction}
                                                {step.estimatedTimeMinutes && (
                                                    <span className="text-muted-foreground ml-2">({step.estimatedTimeMinutes} minutes)</span>
                                                )}
                                                {step.isOptional && (
                                                    <Badge variant="outline" className="ml-2">
                                                        Optional
                                                    </Badge>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <p className="text-muted-foreground">No steps added yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}