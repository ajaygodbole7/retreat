"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "@tanstack/react-router"
import { useRecipe, useScaleRecipe, useDeleteRecipe } from "../../hooks/useRecipes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Scale,
    Edit,
    Trash2,
    ArrowLeft,
    Loader2,
    Users,
    Utensils,
    Clock,
    ChefHat,
    AlertCircle,
    Printer,
    Leaf,
    Wheat,
    Tag,
    ListChecks,
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import { getCourseTypeLabel, getCookingMethodLabel, formatTime, formatQuantity } from "../../utils/format-utils"
import { ensureArray } from "../../utils/array-utils"

export function RecipeDetail() {
    // Access route params with strict: false to work with nested routes
    const params = useParams({ strict: false })
    const recipeId = Number.parseInt(params.recipeId, 10)
    const navigate = useNavigate()

    // State for scaling
    const [targetServingSize, setTargetServingSize] = useState<number | "">("")
    const [isScaling, setIsScaling] = useState(false)
    const [showScalingControls, setShowScalingControls] = useState(false)

    // State for details section
    const [showDetails, setShowDetails] = useState(false)

    // State for delete confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    // Fetch recipe data
    const { data: recipe, isLoading, isError } = useRecipe(recipeId)

    // Fetch scaled recipe if scaling is active
    const { data: scaledRecipe, isLoading: isLoadingScaled } = useScaleRecipe(
        recipeId,
        typeof targetServingSize === "number" ? targetServingSize : 0,
    )

    // Effect to log scaling state for debugging
    useEffect(() => {
        if (isScaling) {
            console.log("Scaling active:", { targetServingSize, scaledRecipe })
        }
    }, [isScaling, targetServingSize, scaledRecipe])

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

    // Handle print
    const handlePrint = () => {
        window.print()
    }

    // Toggle scaling controls
    const toggleScalingControls = () => {
        setShowScalingControls(!showScalingControls)
    }

    // Toggle details section
    const toggleDetails = () => {
        setShowDetails(!showDetails)
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

    // Ensure ingredients and steps are arrays
    const ingredients = ensureArray(recipe.recipeIngredients)
    const steps = ensureArray(recipe.steps).sort((a, b) => a.stepNumber - b.stepNumber)

    // Get scaled ingredients if available
    const scaledIngredients = scaledRecipe?.scaledIngredients ? ensureArray(scaledRecipe.scaledIngredients) : []

    return (
        <div className="container mx-auto py-6 print:py-2">
            {/* Compact header with back button, title, and action buttons */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link to="/recipes">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">{recipe.name}</h1>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to={`/recipes/${ recipeId }/edit`}>
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

            {/* Print-only header */}
            <div className="hidden print:block print:mb-4">
                <h1 className="text-3xl font-bold">{recipe.name}</h1>
            </div>

            {/* Simplified Recipe Card with Essential Details */}
            <Card className="mb-6">
                <CardHeader className="p-3 space-y-2 border-b bg-slate-50/70">
                    {/* Essential Info Section */}
                    <div className="flex justify-between items-center gap-3">
                        {/* Left Side: Essential Recipe Info */}
                        <div className="flex flex-col items-start text-sm flex-grow min-w-0">
                            {/* Essential Badges Row */}
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs">
                                <Badge className="bg-primary text-primary-foreground">{getCourseTypeLabel(recipe.courseType)}</Badge>
                                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                    <Users className="h-3.5 w-3.5" />
                                    Serves {isScaling && scaledRecipe ? scaledRecipe.targetServingSize : recipe.servingSize}
                                </span>
                            </div>
                        </div>

                        {/* Right Side: Dietary Indicators */}
                        <div className="flex gap-1.5 flex-shrink-0">
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
                                    Onion/Garlic
                                </Badge>
                            )}
                            {/* Recipe Description */}
                            {recipe.description && (
                                <div className="text-sm">
                                    <p>{recipe.description}</p>
                                </div>
                            )}

                            {/* Recipe Notes */}
                            {recipe.notes && (
                                <div className="text-sm bg-amber-50 border border-amber-100 p-2 rounded">
                                    <p className="font-medium mb-1">Notes:</p>
                                    <p>{recipe.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>



                    {/* Collapsible Details Section */}
                    <div className="pt-1 border-t">
                        <Button
                            variant="ghost"
                            className="p-0 h-auto flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                            onClick={toggleDetails}
                        >
                            {showDetails ? (
                                <>
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                    Hide Details
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    Show Details
                                </>
                            )}
                        </Button>

                        {showDetails && (
                            <div className="mt-2 space-y-2 text-sm">
                                {/* Additional Recipe Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {recipe.cookingMethod && (
                                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                            <Utensils className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>Method: {getCookingMethodLabel(recipe.cookingMethod)}</span>
                                        </div>
                                    )}

                                    {(recipe.preparationTimeMinutes || recipe.cookingTimeMinutes) && (
                                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>
                                                {recipe.preparationTimeMinutes ? `Prep: ${ formatTime(recipe.preparationTimeMinutes) }` : ""}
                                                {recipe.preparationTimeMinutes && recipe.cookingTimeMinutes ? " | " : ""}
                                                {recipe.cookingTimeMinutes ? `Cook: ${ formatTime(recipe.cookingTimeMinutes) }` : ""}
                                            </span>
                                        </div>
                                    )}

                                    {recipe.submittedBy && (
                                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                            <ChefHat className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span>Submitted by: {recipe.submittedBy}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Equipment */}
                                {recipe.cookingEquipment && (
                                    <div>
                                        <p className="font-medium mb-1">Equipment Needed:</p>
                                        <p>{recipe.cookingEquipment}</p>
                                    </div>
                                )}

                                {/* Recipe Tags */}
                                {recipe.tags && (
                                    <div>
                                        <p className="font-medium mb-1">Tags:</p>
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
                            </div>
                        )}
                    </div>

                    {/* Scaling Button - Just shows a button that reveals controls */}
                    <div className="pt-1 border-t print:hidden">
                        <Button
                            variant="ghost"
                            className="p-0 h-auto flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                            onClick={toggleScalingControls}
                        >
                            <Scale className="h-4 w-4 mr-1.5" />
                            {showScalingControls ? "Hide Scaling Controls" : "Scale Recipe"}
                        </Button>

                        {showScalingControls && (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min="1"
                                        className="w-20 h-8 text-sm"
                                        value={targetServingSize}
                                        onChange={(e) => {
                                            const value = e.target.value ? Number.parseInt(e.target.value, 10) : ""
                                            setTargetServingSize(value)
                                        }}
                                        placeholder={recipe.servingSize.toString()}
                                    />
                                    <span className="text-sm text-muted-foreground">servings</span>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={handleScaleRecipe}
                                        disabled={typeof targetServingSize !== "number" || targetServingSize <= 0 || isLoadingScaled}
                                        className="h-8"
                                    >
                                        {isLoadingScaled ? (
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Scale className="mr-1.5 h-3.5 w-3.5" />
                                        )}
                                        Scale
                                    </Button>
                                    {isScaling && (
                                        <Button size="sm" variant="outline" onClick={resetScaling} className="h-8">
                                            Reset
                                        </Button>
                                    )}
                                </div>
                                {isScaling && scaledRecipe && (
                                    <span className="text-xs text-muted-foreground">
                                        Scaling factor: {scaledRecipe.scalingFactor.toFixed(2)}x
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Ingredients and Steps Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ingredients Card */}
                <Card>
                    <CardHeader className="py-2.5 px-3 border-b bg-slate-50/70">
                        <div className="flex items-center">
                            <ListChecks className="h-4 w-4 mr-1.5 text-muted-foreground" />
                            <span className="font-semibold text-base">Ingredients</span>
                            {isScaling && scaledRecipe && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                    (Scaled for {scaledRecipe.targetServingSize} servings)
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-3">
                        {ingredients && ingredients.length > 0 ? (
                            <div className="space-y-2">
                                {/* Ingredients List - Using dl for better semantics */}
                                <dl className="space-y-2">
                                    {ingredients.map((ingredient, index) => {
                                        // Find the corresponding scaled ingredient if scaling is active
                                        const scaledIngredient =
                                            isScaling && scaledIngredients.length > 0
                                                ? scaledIngredients.find((si) => si.ingredientId === ingredient.ingredientId)
                                                : null

                                        return (
                                            <div
                                                key={ingredient.id || index}
                                                className="flex flex-wrap items-center border-b pb-2 last:border-0"
                                            >
                                                <dt className="w-full md:w-1/2 font-medium">
                                                    {ingredient.ingredient?.name || "Unknown Ingredient"}
                                                    {ingredient.preparation && (
                                                        <span className="text-muted-foreground"> ({ingredient.preparation})</span>
                                                    )}
                                                    {ingredient.isOptional && (
                                                        <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
                                                    )}
                                                    {ingredient.notes && (
                                                        <div className="text-xs text-muted-foreground mt-0.5">{ingredient.notes}</div>
                                                    )}
                                                </dt>
                                                <dd className="flex justify-between w-full md:w-1/2 mt-1 md:mt-0">
                                                    <span className="text-sm">
                                                        {formatQuantity(ingredient.quantity)}{" "}
                                                        {ingredient.unit?.abbreviation || ingredient.unit?.name || ""}
                                                    </span>
                                                    {isScaling && scaledRecipe && (
                                                        <span className="text-sm font-medium">
                                                            {scaledIngredient ? (
                                                                <>
                                                                    {formatQuantity(scaledIngredient.scaledQuantity)}{" "}
                                                                    {ingredient.unit?.abbreviation || ingredient.unit?.name || ""}
                                                                </>
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </span>
                                                    )}
                                                </dd>
                                            </div>
                                        )
                                    })}
                                </dl>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No ingredients added yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Steps Card */}
                <Card>
                    <CardHeader className="py-2.5 px-3 border-b bg-slate-50/70">
                        <div className="flex items-center">
                            <ListChecks className="h-4 w-4 mr-1.5 text-muted-foreground" />
                            <span className="font-semibold text-base">Preparation Steps</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3">
                        {steps && steps.length > 0 ? (
                            <ol className="space-y-0 list-decimal list-outside ml-5">
                                {steps.map((step, index) => (
                                    <li key={step.id || index} className="py-3">
                                        <div>
                                            <p>{step.instruction}</p>
                                            {(step.estimatedTimeMinutes || step.isOptional) && (
                                                <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                                                    {step.estimatedTimeMinutes && (
                                                        <span className="flex items-center">
                                                            <Clock className="mr-1 h-3.5 w-3.5" />
                                                            {formatTime(step.estimatedTimeMinutes)}
                                                        </span>
                                                    )}
                                                    {step.isOptional && <span>(Optional)</span>}
                                                </div>
                                            )}
                                        </div>
                                        {index < steps.length - 1 && <hr className="mt-3 border-t border-gray-200 dark:border-gray-700" />}
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No steps added yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{recipe.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteRecipeMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={deleteRecipeMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteRecipeMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Print styles */}
            <style jsx global>{`
        @media print {
          body {
            font-size: 12pt;
          }
          
          h1 {
            font-size: 18pt;
            margin-bottom: 8pt;
          }
          
          h2 {
            font-size: 14pt;
            margin-bottom: 6pt;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          /* Avoid page breaks inside elements */
          li, p {
            page-break-inside: avoid;
          }
        }
      `}</style>
        </div>
    )
}

export default RecipeDetail