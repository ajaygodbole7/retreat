// src/features/events/EditScheduledMealDialog.tsx
"use client";

import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { ScheduledMealForm } from "./ScheduledMealForm"; // For basic details editing
import { AddRecipeToMealForm } from "./AddRecipeToMealForm"; // Import recipe helper
import { useRemoveRecipeFromMeal } from "../../hooks/useScheduledMeals";
import { Loader2, Trash2, CookingPot } from "lucide-react"; // Correct icons
import { formatEnum } from "../../utils/format-utils";
import { formatTimeForDisplay } from "../../utils/date-utils";
import { ensureArray } from "../../utils/array-utils";
import type { ScheduledMeal, ScheduledMealRecipe } from "@server/types/event-types";
import type { Recipe } from "@server/types/recipe-types"; // Import for nested recipe name

interface EditScheduledMealDialogProps {
    meal: ScheduledMeal | null;
    eventId: number;
    dayId: number;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void; // To refresh the parent list after changes
}

// Define type for meal with recipe relation included
type ScheduledMealWithRecipes = ScheduledMeal & {
    scheduledMealRecipes?: (ScheduledMealRecipe & { recipe?: Recipe })[];
};

export function EditScheduledMealDialog({ meal, eventId, dayId, isOpen, onClose, onUpdate }: EditScheduledMealDialogProps) {
    const removeRecipeMutation = useRemoveRecipeFromMeal(eventId, dayId);

    // Memoize recipes from the meal prop
    const recipes = useMemo(() => ensureArray((meal as ScheduledMealWithRecipes)?.scheduledMealRecipes), [meal?.scheduledMealRecipes]);

    if (!meal) return null; // Don't render if no meal is selected

    const handleRemoveRecipe = (recipeId: number) => {
        if (!meal?.id) return;
        removeRecipeMutation.mutate({ mealId: meal.id, recipeId }, {
            onSuccess: onUpdate // Refresh list on success
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col"> {/* Width adjustment */}
                <DialogHeader>
                    <DialogTitle>Edit Meal: {formatEnum(meal.mealType)} at {formatTimeForDisplay(meal.time)}</DialogTitle>
                </DialogHeader>

                {/* Scrollable Content Area */}
                <div className="flex-grow overflow-y-auto pr-6 pl-1 space-y-6 py-4 -mr-6 -ml-1"> {/* Adjusted padding for scrollbar */}
                    {/* Basic Meal Details Card */}
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-lg">Basic Details</CardTitle></CardHeader>
                        <CardContent>
                            {/* Use the basic form, passing initialData */}
                            <ScheduledMealForm
                                key={`basic-${ meal.id }`} // Key to force re-render if meal changes
                                eventId={eventId}
                                dayId={dayId}
                                initialData={meal}
                                onClose={onClose} // Close the entire dialog
                                onSuccess={onUpdate} // Update parent list
                            />
                        </CardContent>
                    </Card>

                    {/* Assigned Recipes Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><CookingPot className="h-5 w-5" /> Recipes</CardTitle>
                            <CardDescription>Manage specific recipes for this meal.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recipes.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-2 italic">No specific recipes added.</p>
                            ) : (
                                <ul className="space-y-2 mb-3">
                                    {recipes.map((r) => (
                                        <li key={r.id ?? `recipe-${ r.recipeId }`} className="flex items-center justify-between text-sm border-b pb-1.5">
                                            <div className="flex-1">
                                                {/* Display Recipe Name and Notes */}
                                                <span>{r.recipe?.name ?? `Recipe ID ${ r.recipeId }`}</span>
                                                {r.notes && <p className="text-xs text-muted-foreground italic ml-2"> - {r.notes}</p>}
                                            </div>
                                            {/* Remove Recipe Button */}
                                            <Button variant="ghost" size="sm" className="h-6 px-1 text-destructive" onClick={() => handleRemoveRecipe(r.recipeId)} disabled={removeRecipeMutation.isPending && removeRecipeMutation.variables?.recipeId === r.recipeId}>
                                                {removeRecipeMutation.isPending && removeRecipeMutation.variables?.recipeId === r.recipeId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {/* Add Recipe Form Helper */}
                            <AddRecipeToMealForm mealId={meal.id} eventId={eventId} dayId={dayId} onAdded={onUpdate} />
                        </CardContent>
                    </Card>

                    {/* Meal Consumables Section REMOVED */}

                </div> {/* End Scrollable Area */}

                <DialogFooter className="pt-4 border-t mt-auto"> {/* Ensure footer is at bottom */}
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}