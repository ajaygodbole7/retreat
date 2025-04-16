// src/features/events/AddRecipeToMealForm.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { recipeService } from "../../services/recipe-service";
import { useAddRecipeToMeal } from "../../hooks/useScheduledMeals";
import type { Recipe } from "@server/types/recipe-types";

interface AddRecipeToMealFormProps {
    mealId: number;
    eventId: number;
    dayId: number;
    onAdded?: () => void; // Optional callback after adding
}

export function AddRecipeToMealForm({ mealId, eventId, dayId, onAdded }: AddRecipeToMealFormProps) {
    const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
    const [notes, setNotes] = useState("");
    const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
        queryKey: ['recipes'], // Use a general key, or add filters if needed
        queryFn: () => recipeService.getAll() // Fetch all recipes for selection
    });
    const addRecipeMutation = useAddRecipeToMeal(eventId, dayId);

    const handleAdd = () => {
        if (!selectedRecipeId) return;
        addRecipeMutation.mutate({ mealId, data: { recipeId: selectedRecipeId, notes } }, {
            onSuccess: () => {
                setSelectedRecipeId(null);
                setNotes("");
                onAdded?.(); // Call callback if provided
            }
            // onError handled by hook
        });
    };

    return (
        // Main container for the form elements
        <div className="flex items-end gap-2 border-t pt-3 mt-3">
            {/* Recipe Selection Dropdown */}
            <div className="flex-grow space-y-1">
                <Label htmlFor={`recipe-select-${ mealId }`} className="text-xs">Recipe *</Label>
                <Select
                    value={selectedRecipeId?.toString() ?? ""}
                    onValueChange={(val) => setSelectedRecipeId(Number(val) || null)}
                >
                    <SelectTrigger id={`recipe-select-${ mealId }`} className="h-8 text-xs">
                        <SelectValue placeholder="Select Recipe" />
                    </SelectTrigger>
                    <SelectContent>
                        {isLoading && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                        {recipes.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Optional Notes Input */}
            <div className="w-1/3 space-y-1">
                <Label htmlFor={`recipe-notes-${ mealId }`} className="text-xs">Notes (Opt.)</Label>
                <Input id={`recipe-notes-${ mealId }`} className="h-8 text-xs" placeholder="Prep notes..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            {/* Add Button */}
            <Button
                type="button" // Explicitly set type="button" as it's not submitting a parent form
                size="sm"
                className="h-8 px-3" // Adjusted padding
                onClick={handleAdd}
                disabled={!selectedRecipeId || addRecipeMutation.isPending || isLoading}
            >
                {addRecipeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span className="ml-1">Add</span> {/* Added text to the button */}
            </Button>
        </div>
    );
}