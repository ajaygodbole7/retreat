// src/features/events/ScheduledMealsList.tsx
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Edit, Trash2, Clock, Users, Utensils, Info, CookingPot, List } from "lucide-react";
import { formatEnum } from "../../utils/format-utils";
import { ensureArray } from "../../utils/array-utils";
import { formatTimeForDisplay } from "../../utils/date-utils";
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
} from "../../components/ui/alert-dialog";
// Import types needed for display
import type { ScheduledMeal, ScheduledMealRecipe, Menu } from '@server/types/event-types';
import type { Recipe } from "@server/types/recipe-types";

// Define a more specific type for the meal prop
type ScheduledMealWithRelations = ScheduledMeal & {
    menu?: Menu | null;
    scheduledMealRecipes?: (ScheduledMealRecipe & { recipe?: Recipe })[];
};

interface ScheduledMealsListProps {
    meals: ScheduledMealWithRelations[] | ScheduledMealWithRelations | undefined | null;
    onEdit: (meal: ScheduledMeal) => void; // Callback to open the edit dialog
    onDelete: (meal: ScheduledMeal) => void; // Callback for deletion
}

export function ScheduledMealsList({ meals = [], onEdit, onDelete }: ScheduledMealsListProps) {
    const [mealToDelete, setMealToDelete] = useState<ScheduledMeal | null>(null);

    const mealsArray = ensureArray(meals);
    const validMeals = mealsArray.filter(meal => meal && typeof meal === 'object' && 'id' in meal && meal.id);

    if (validMeals.length === 0) {
        return <p className="text-xs text-muted-foreground text-center py-3 italic">No meals scheduled yet.</p>;
    }

    // Sort meals by time
    const sortedMeals = [...validMeals].sort((a, b) => {
        const timeA = formatTimeForDisplay(a.time, "00:00");
        const timeB = formatTimeForDisplay(b.time, "00:00");
        return timeA.localeCompare(timeB);
    });

    return (
        <div className="space-y-2">
            {sortedMeals.map(meal => {
                const recipes = ensureArray(meal.scheduledMealRecipes);

                return (
                    <div key={meal.id} className="border rounded-md px-3 py-2 bg-background hover:bg-slate-50 transition-colors group relative">
                        {/* Edit/Delete Buttons */}
                        <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                            {/* Ensure onClick calls the onEdit prop with the current meal */}
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(meal)} title="Edit Meal Details">
                                <Edit className="h-3.5 w-3.5" /> <span className="sr-only">Edit</span>
                            </Button>
                            <AlertDialog open={mealToDelete?.id === meal.id} onOpenChange={(isOpen) => !isOpen && setMealToDelete(null)}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" title="Delete Meal" onClick={() => setMealToDelete(meal)}>
                                        <Trash2 className="h-3.5 w-3.5" /> <span className="sr-only">Delete</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Meal?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete this {formatEnum(meal.mealType)} at {formatTimeForDisplay(meal.time)}? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setMealToDelete(null)}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => { onDelete(meal); setMealToDelete(null); }} className="bg-destructive hover:bg-destructive/90">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                        {/* Meal Details (Content aligned left by default) */}
                        <div className="pr-14 space-y-1.5 text-left"> {/* Added text-left and adjusted pr */}
                            {/* Basic Info Row */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 font-semibold">
                                    <Clock className="h-3 w-3 mr-1" /> {formatTimeForDisplay(meal.time)}
                                </Badge>
                                <Badge className="text-xs px-1.5 py-0.5 font-medium">
                                    {formatEnum(meal.mealType)}
                                </Badge>
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                    <Users className="h-3 w-3 mr-1" />
                                    {(meal.attendeeHeadcount || 0)}A + {(meal.volunteerHeadcount || 0)}V = {(meal.attendeeHeadcount || 0) + (meal.volunteerHeadcount || 0)}
                                </Badge>
                            </div>

                            {/* Linked Menu & Recipes */}
                            <div className="text-xs space-y-1">
                                {meal.menu && (
                                    <p className="text-muted-foreground flex items-center gap-1">
                                        <List className="h-3 w-3 flex-shrink-0" />
                                        Menu: <span className="font-medium text-foreground">{meal.menu.name || "Unnamed Menu"}</span>
                                    </p>
                                )}
                                {recipes.length > 0 && (
                                    <div className="pl-4">
                                        <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1 -ml-4 mb-0.5"><CookingPot className="h-3 w-3" /> Recipes:</h4>
                                        <ul className="list-disc list-inside space-y-0">
                                            {recipes.slice(0, 3).map((r, idx) => (
                                                <li key={r.id || idx} className="text-xs">
                                                    {r.recipe?.name ?? `Recipe ID ${ r.recipeId }`}
                                                    {r.notes && <span className="text-muted-foreground italic text-[11px]"> ({r.notes})</span>}
                                                </li>
                                            ))}
                                            {recipes.length > 3 && <li className="text-xs text-muted-foreground italic">...and {recipes.length - 3} more</li>}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            {meal.notes && (
                                <p className="text-xs text-muted-foreground flex items-start gap-1 pt-1">
                                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span>{meal.notes}</span>
                                </p>
                            )}

                            {/* Placeholder text */}
                            {!meal.menu && recipes.length === 0 && (
                                <p className="text-xs text-orange-500 italic mt-1">(No menu or specific recipes assigned)</p>
                            )}
                            {meal.menu && recipes.length === 0 && (
                                <p className="text-xs text-gray-500 italic mt-1">(Using recipes from menu template)</p>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    );
}