// src/features/events/DayConsumablesSection.tsx
"use client";

import { useState, useMemo } from "react"; // Added useMemo
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Loader2, Plus, Trash2, AppleIcon, PopcornIcon } from "lucide-react";
import {
    useAddEventDayConsumable,
    useDeleteEventDayConsumable,
    // useUpdateEventDayConsumable // Keep commented if not used
} from "../../hooks/useEvents";
import { ingredientService } from "../../services/ingredient-service";
import { unitService } from "../../services/unit-service";
import { useCategoryList } from "../../hooks/useCategories"; // *** Import category hook ***
import { formatQuantity } from "../../utils/format-utils";
import { ensureArray } from "../../utils/array-utils";
import type { EventDayConsumable } from "@server/types/event-types";
import type { Ingredient } from "@server/types/ingredient-types";
import type { UnitOfMeasure } from "@server/types/ingredient-types";

interface DayConsumablesSectionProps {
    eventId: number;
    dayId: number;
    // Expect relations to be included from parent query
    consumables: (EventDayConsumable & { ingredient?: Ingredient, unit?: UnitOfMeasure })[] | undefined | null;
    onUpdate: () => void;
}

// Constant for the category name to filter by
const READY_TO_EAT_CATEGORY_NAME = "Ready to Eat";

export function DayConsumablesSection({ eventId, dayId, consumables, onUpdate }: DayConsumablesSectionProps) {
    const [selectedIngredientId, setSelectedIngredientId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [notes, setNotes] = useState("");
    const [baseServingSize, setBaseServingSize] = useState<number>(8);

    // --- Fetching Logic ---
    // 1. Fetch all categories
    const { data: categories = [], isLoading: categoriesLoading } = useCategoryList();

    // 2. Find the ID for the target category
    const readyToEatCategoryId = useMemo(() => {
        const foundCategory = categories.find(cat => cat.name === READY_TO_EAT_CATEGORY_NAME);
        if (!foundCategory && !categoriesLoading) {
            console.warn(`Category "${ READY_TO_EAT_CATEGORY_NAME }" not found.`);
        }
        return foundCategory?.id;
    }, [categories, categoriesLoading]);

    // 3. Fetch ingredients *filtered* by the category ID
    const { data: readyToEatIngredients = [], isLoading: ingredientsLoading } = useQuery<Ingredient[]>({
        // Query key includes the category ID to ensure correct caching
        queryKey: ['ingredients', { categoryId: readyToEatCategoryId }],
        queryFn: () => {
            // Only run the query if the category ID exists
            if (!readyToEatCategoryId) {
                console.log("Skipping ingredient fetch: Category ID not yet found.");
                return Promise.resolve([]);
            }
            console.log(`Fetching ingredients for category ID: ${ readyToEatCategoryId }`);
            // Call the service with the filter
            return ingredientService.getAll({ categoryId: readyToEatCategoryId.toString() });
        },
        // Enable this query only when the category ID is available and categories have loaded
        enabled: !!readyToEatCategoryId && !categoriesLoading,
        staleTime: 1000 * 60 * 5, // Cache for 5 mins
    });

    // 4. Fetch all units (no change here)
    const { data: units = [], isLoading: unitsLoading } = useQuery<UnitOfMeasure[]>({
        queryKey: ['units'],
        queryFn: () => unitService.getAll()
    });
    // --- End Fetching Logic ---

    // Mutations
    const addConsumableMutation = useAddEventDayConsumable(eventId, dayId);
    const deleteConsumableMutation = useDeleteEventDayConsumable(eventId);

    // Memoized list of consumables from props
    const dayConsumables = useMemo(() => ensureArray(consumables), [consumables]);

    // Handlers
    const handleAdd = () => {
        if (!selectedIngredientId || !selectedUnitId || quantity <= 0 || baseServingSize <= 0) {
            console.error("Missing required fields for day consumable");
            // TODO: Add user feedback (toast)
            return;
        }
        addConsumableMutation.mutate(
            {
                dayId,
                data: {
                    ingredientId: selectedIngredientId,
                    baseServingQuantity: quantity,
                    baseServingSize: baseServingSize,
                    unitId: selectedUnitId,
                    notes,
                },
            }, {
            onSuccess: () => {
                setSelectedIngredientId(null);
                setQuantity(1);
                setSelectedUnitId(null);
                setNotes("");
                setBaseServingSize(8);
                onUpdate();
            }
            // onError handled by hook
        });
    };

    const handleDelete = (consumableId: number) => {
        deleteConsumableMutation.mutate(consumableId, {
            onSuccess: onUpdate
            // onError handled by hook
        });
    };

    // Combined loading state for form elements
    const isLoadingData = categoriesLoading || ingredientsLoading || unitsLoading;

    return (
        <Card className="mt-4">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <AppleIcon className="h-4 w-4" /> Day-Level Ready To Eat
                </CardTitle>
                <CardDescription className="text-xs">Items needed for the day (fruits, snacks).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-3">
                {/* List existing day consumables */}
                {dayConsumables.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2 italic">No day-level consumables added.</p>
                ) : (
                    <ul className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-2">
                        {dayConsumables.map((c) => (
                            <li key={c.id} className="flex items-center justify-between text-xs border-b pb-1.5">
                                <div className="text-left">
                                    <span className="font-medium">{c.ingredient?.name ?? `Ing #${ c.ingredientId }`}</span>: {' '}
                                    <span>{formatQuantity(c.baseServingQuantity)} {c.unit?.abbreviation ?? `Unit #${ c.unitId }`}</span>
                                    <span className="text-muted-foreground text-xs"> (for {c.baseServingSize} ppl)</span>
                                    {c.notes && <p className="text-xs text-muted-foreground italic mt-0.5"> - {c.notes}</p>}
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 px-1 text-destructive flex-shrink-0" onClick={() => handleDelete(c.id)} disabled={deleteConsumableMutation.isPending && deleteConsumableMutation.variables === c.id}>
                                    {deleteConsumableMutation.isPending && deleteConsumableMutation.variables === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Add New Day Consumable Form */}
                <div className="border-t pt-3">
                    <h4 className="text-xs font-medium mb-2">Add Ready To Eat Item</h4>
                    <div className="grid grid-cols-2 gap-2 items-end">
                        {/* Ingredient (Filtered Dropdown) */}
                        <div className="col-span-2 space-y-1">
                            <Label htmlFor={`day-cons-ing-select-${ dayId }`} className="text-xs">Item ({READY_TO_EAT_CATEGORY_NAME}) *</Label>
                            <Select
                                value={selectedIngredientId?.toString() ?? ""}
                                onValueChange={(val) => setSelectedIngredientId(Number(val) || null)}
                                disabled={isLoadingData || !readyToEatCategoryId} // Disable logic based on loading and category ID
                            >
                                <SelectTrigger id={`day-cons-ing-select-${ dayId }`} className="h-8 text-xs">
                                    {/* Dynamic Placeholder Text */}
                                    <SelectValue placeholder={isLoadingData ? "Loading..." : (!readyToEatCategoryId && !categoriesLoading ? `Category '${ READY_TO_EAT_CATEGORY_NAME }' not found` : "Select Item")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Loading/Not Found States */}
                                    {isLoadingData ? <SelectItem value="loading" disabled>Loading...</SelectItem> : null}
                                    {!readyToEatCategoryId && !categoriesLoading && <SelectItem value="notfound" disabled>Category '{READY_TO_EAT_CATEGORY_NAME}' not found</SelectItem>}
                                    {/* Filtered Ingredient Options */}
                                    {readyToEatIngredients.map(i => <SelectItem key={i.id} value={i.id.toString()}>{i.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Quantity */}
                        <div className="space-y-1">
                            <Label htmlFor={`day-cons-qty-${ dayId }`} className="text-xs">Base Qty *</Label>
                            <Input id={`day-cons-qty-${ dayId }`} type="number" min="0.01" step="any" className="h-8 text-xs" value={quantity} onChange={e => setQuantity(Number(e.target.value) || 0)} />
                        </div>
                        {/* Unit */}
                        <div className="space-y-1">
                            <Label htmlFor={`day-cons-unit-${ dayId }`} className="text-xs">Unit *</Label>
                            <Select
                                value={selectedUnitId?.toString() ?? ""}
                                onValueChange={(val) => setSelectedUnitId(Number(val) || null)}
                                disabled={unitsLoading}
                            >
                                <SelectTrigger id={`day-cons-unit-${ dayId }`} className="h-8 text-xs"> <SelectValue placeholder="Unit" /> </SelectTrigger>
                                <SelectContent>
                                    {unitsLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> : null}
                                    {units.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.abbreviation || u.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Base Serving Size */}
                        <div className="space-y-1">
                            <Label htmlFor={`day-cons-base-${ dayId }`} className="text-xs">Base Size *</Label>
                            <Input id={`day-cons-base-${ dayId }`} type="number" min="1" step="1" className="h-8 text-xs" placeholder="e.g., 8" value={baseServingSize} onChange={e => setBaseServingSize(Number(e.target.value) || 1)} />
                        </div>
                        {/* Notes */}
                        <div className="space-y-1">
                            <Label htmlFor={`day-cons-notes-${ dayId }`} className="text-xs">Notes</Label>
                            <Input id={`day-cons-notes-${ dayId }`} className="h-8 text-xs" placeholder="Optional notes" value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>
                    </div>
                    {/* Add Button */}
                    <div className="flex justify-end mt-2">
                        <Button
                            size="sm" className="h-8 px-3" onClick={handleAdd}
                            // Updated disabled logic
                            disabled={!selectedIngredientId || !selectedUnitId || quantity <= 0 || baseServingSize <= 0 || addConsumableMutation.isPending || isLoadingData}
                        >
                            {addConsumableMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                            Add
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}