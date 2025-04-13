// src/features/events/ScheduledMealsList.tsx
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Edit, Trash2, Clock, Users, Utensils, Info, FileText } from "lucide-react";
import { formatEnum } from "../../utils/format-utils";
import { ensureArray } from "../../utils/array-utils";
import { formatTimeForDisplay } from "../../utils/date-utils"; // Import our new utility
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
import type { ScheduledMeal } from '@server/types/event-types';

interface ScheduledMealsListProps {
    meals: ScheduledMeal[] | ScheduledMeal | undefined | null;
    onEdit: (meal: ScheduledMeal) => void;
    onDelete: (meal: ScheduledMeal) => void;
}

export function ScheduledMealsList({ meals = [], onEdit, onDelete }: ScheduledMealsListProps) {
    // Debug log the meals passed to this component
    console.log("ScheduledMealsList received meals:", meals);

    // Ensure we have a valid array of meals
    const mealsArray = ensureArray(meals);
    console.log("Processed meals array:", mealsArray);

    // Check if we have any valid meals
    if (!mealsArray || mealsArray.length === 0) {
        return <p className="text-xs text-muted-foreground text-center py-3 italic">No meals scheduled yet.</p>;
    }

    // Filter out any meals with invalid data structure
    const validMeals = mealsArray.filter(meal =>
        meal && typeof meal === 'object' && 'id' in meal && meal.id
    );

    // If there are no valid meals after filtering, show no meals message
    if (validMeals.length === 0) {
        return <p className="text-xs text-muted-foreground text-center py-3 italic">No valid meals found.</p>;
    }

    // Sort meals by time for consistent display
    const sortedMeals = [...validMeals].sort((a, b) => {
        // Format times using our utility function
        const timeA = formatTimeForDisplay(a.time, "00:00");
        const timeB = formatTimeForDisplay(b.time, "00:00");

        // Now we can safely compare the formatted strings
        return timeA.localeCompare(timeB);
    });

    return (
        <div className="space-y-2">
            {sortedMeals.map(meal => (
                <div key={meal.id} className="border rounded-md p-2.5 bg-background hover:bg-muted/20 transition-colors group relative">
                    {/* Edit/Delete Buttons */}
                    <div className="absolute top-1.5 right-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(meal)} title="Edit Meal">
                            <Edit className="h-3.5 w-3.5" /> <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" title="Delete Meal">
                                    <Trash2 className="h-3.5 w-3.5" /> <span className="sr-only">Delete</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Meal?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this {meal.mealType ? formatEnum(meal.mealType) : "meal"} at {formatTimeForDisplay(meal.time)}?
                                        This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(meal)} className="bg-destructive hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    {/* Meal Details */}
                    <div className="pr-16">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTimeForDisplay(meal.time)}
                            </Badge>
                            <Badge className="text-xs px-1.5 py-0.5">
                                {meal.mealType ? formatEnum(meal.mealType) : "Meal"}
                            </Badge>
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                <Users className="h-3 w-3 mr-1" />
                                {(meal.attendeeHeadcount || 0) + (meal.volunteerHeadcount || 0)}
                                ({meal.attendeeHeadcount || 0}A + {meal.volunteerHeadcount || 0}V)
                            </Badge>
                        </div>
                        {meal.menu && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                <Utensils className="h-3 w-3" />
                                Menu: <span className="font-medium">{meal.menu.name || "Unknown Menu"}</span>
                            </p>
                        )}
                        {meal.scheduledMealRecipes && ensureArray(meal.scheduledMealRecipes).length > 0 && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mb-1">
                                <FileText className="h-3 w-3" />
                                (+{ensureArray(meal.scheduledMealRecipes).length} specific recipes)
                            </p>
                        )}
                        {meal.notes && (
                            <p className="text-xs text-muted-foreground flex items-start gap-1">
                                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>{meal.notes}</span>
                            </p>
                        )}
                        {(!meal.menu || !meal.menu.name) && (!meal.scheduledMealRecipes || ensureArray(meal.scheduledMealRecipes).length === 0) && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 italic mt-1">(No menu or specific recipes assigned yet)</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}