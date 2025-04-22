// src/features/events/EventDayDetail.tsx
import { useState, useEffect, useMemo } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card" // Removed CardDescription
import { Badge } from "../../components/ui/badge"
import { format } from "date-fns"
import { Loader2, Plus, Calendar, Users, Utensils, Pencil, Trash2, Maximize2, PackageIcon } from "lucide-react" // Calendar icon is removed from render
import { useDeleteEventDay } from "../../hooks/useEvents"
import { useScheduledMealsForDay, useDeleteScheduledMeal } from "../../hooks/useScheduledMeals"
import { EventDayForm } from "./EventDayForm"
import { ScheduledMealForm } from "./ScheduledMealForm"
import { ScheduledMealsList } from "./ScheduledMealsList" // Ensure this is imported
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { EditScheduledMealDialog } from "./EditScheduledMealDialog"
import { DayConsumablesSection } from "./DayConsumablesSection"
import { formatEnum } from "../../utils/format-utils"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog"
import type {
    EventDay,
    ScheduledMeal,
    EventDayConsumable,
    ScheduledMealRecipe,
    Menu
} from "@server/types/event-types"
import type { Recipe } from "@server/types/recipe-types"
import type { Ingredient } from "@server/types/ingredient-types"
import type { UnitOfMeasure } from "@server/types/ingredient-types"
import { ensureArray } from "../../utils/array-utils"

// Define the expected shape of the day prop more accurately
type EventDayWithRelations = EventDay & {
    consumables?: (EventDayConsumable & { ingredient?: Ingredient, unit?: UnitOfMeasure })[];
    scheduledMeals?: (ScheduledMeal & {
        menu?: Menu | null;
        scheduledMealRecipes?: (ScheduledMealRecipe & { recipe?: Recipe })[];
    })[];
};

interface EventDayDetailProps {
    eventId: number;
    day: EventDayWithRelations;
    onUpdate: () => void;
    existingDayNumbers: number[];
}

export function EventDayDetail({ eventId, day, onUpdate, existingDayNumbers }: EventDayDetailProps) {
    const [editDayDialogOpen, setEditDayDialogOpen] = useState(false);
    const [addMealDialogOpen, setAddMealDialogOpen] = useState(false);
    const [deleteDayDialogOpen, setDeleteDayDialogOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState<ScheduledMeal | null>(null);

    const {
        data: scheduledMealsData,
        isLoading: mealsLoading,
        isError: mealsError,
        error: mealsErrorDetails,
        refetch: refetchMeals
    } = useScheduledMealsForDay(day.id, true);

    const deleteMealMutation = useDeleteScheduledMeal(eventId);
    const deleteDayMutation = useDeleteEventDay(eventId);
    const isDeletingDay = deleteDayMutation.isPending;

    const formattedDate = day.date ? format(new Date(day.date), "EEEE, MMM d") : "No date set";

    // Calculate Day Headcount (Removed Max calculation)
    const dayAttendeeCount = day.attendeeHeadcountForDay || 0;
    const dayVolunteerCount = day.volunteerHeadcountForDay || 0;

    // Handlers
    const handleDeleteDay = () => {
        deleteDayMutation.mutate(day.id, {
            onSuccess: () => { setDeleteDayDialogOpen(false); onUpdate(); },
        });
    };
    const handleEditMeal = (meal: ScheduledMeal) => {
        // Ensure we have the latest data if possible
        const fullMealData = scheduledMealsData?.find(m => m.id === meal.id) || meal;
        console.log("Setting meal to edit in EventDayDetail:", fullMealData); // Debug log
        setEditingMeal(fullMealData);
    };
    const handleCloseEditMealDialog = () => setEditingMeal(null);
    const handleDeleteMeal = (meal: ScheduledMeal) => {
        deleteMealMutation.mutate({ mealId: meal.id, dayId: day.id }, { onSuccess: onUpdate });
    };
    const handleMealUpdate = () => {
        setAddMealDialogOpen(false);
        setEditingMeal(null);
        onUpdate();
    };

    // Memoized data
    const mealsToShow = useMemo(() => scheduledMealsData || ensureArray(day.scheduledMeals), [scheduledMealsData, day.scheduledMeals]);
    const dayConsumablesToShow = useMemo(() => ensureArray(day.consumables), [day.consumables]);

    return (
        <> {/* Fragment */}
            <Card className="flex flex-col h-full border shadow-sm mb-6">
                {/* === CARD HEADER REFINED === */}
                <CardHeader className="py-2.5 px-3 border-b bg-slate-50/70"> {/* Adjusted padding */}
                    <div className="flex justify-between items-center gap-3"> {/* Increased gap */}
                        {/* Left Side: Combined Day Info */}
                        <div className="flex flex-col items-start text-sm flex-grow min-w-0"> {/* Added min-w-0 for wrap */}
                            {/* Day Number & Date (Main Title) */}
                            <div className="font-semibold text-base mb-0.5 truncate"> {/* Slightly larger, truncate if needed */}
                                Day {day.dayNumber}: {formattedDate}
                            </div>
                            {/* Phase & Headcount Row */}
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs"> {/* Added flex-wrap */}
                                <Badge variant="secondary" className="px-1.5 py-0.5 font-normal">{formatEnum(day.phase)}</Badge>
                                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400" title="Attendee / Volunteer headcount for this day">
                                    <Users className="h-3.5 w-3.5" />
                                    {dayAttendeeCount} A / {dayVolunteerCount} V
                                </span>
                            </div>
                        </div>

                        {/* Right Side: Action Buttons */}
                        <div className="flex gap-1 flex-shrink-0">
                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setAddMealDialogOpen(true)}>
                                <Plus className="h-3.5 w-3.5 mr-1" /> Meal
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setEditDayDialogOpen(true)}>
                                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                            </Button>
                            <Button
                                variant="outline" size="sm" className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteDayDialogOpen(true)} disabled={isDeletingDay}
                            >
                                {isDeletingDay ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
                                Del
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                {/* --- END CARD HEADER REFACTOR --- */}

                {/* Added text-left to CardContent */}
                <CardContent className="pt-3 pb-4 px-3 flex-grow space-y-4 overflow-y-auto text-left">
                    {/* Notes Section */}
                    {day.notes && (
                        <div className="mb-3 text-left"> {/* Ensure left align */}
                            <h4 className="text-xs font-medium mb-0.5 text-muted-foreground">Day Notes:</h4>
                            <p className="text-sm bg-amber-50 border border-amber-100 p-1.5 rounded">{day.notes}</p>
                        </div>
                    )}

                    {/* Meals Section */}
                    <div>
                        <h3 className="text-sm font-semibold mb-1.5 flex items-center text-muted-foreground">
                            <Utensils className="mr-1.5 h-4 w-4" /> Scheduled Meals
                        </h3>
                        {mealsLoading ? (<div className="flex justify-center py-2"> <Loader2 className="h-4 w-4 animate-spin text-primary" /> </div>)
                            : mealsError ? (<div className="text-center py-2 text-destructive text-xs"> <p>Error loading meals.</p> <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-1" onClick={() => refetchMeals()}> Retry </Button> </div>)
                                : (
                                    <ScheduledMealsList
                                        meals={mealsToShow}
                                        onEdit={handleEditMeal} // Ensure this prop is passed correctly
                                        onDelete={handleDeleteMeal}
                                    />
                                )}
                    </div>

                    {/* Day-Level Consumables Section */}
                    <DayConsumablesSection
                        eventId={eventId}
                        dayId={day.id}
                        consumables={dayConsumablesToShow}
                        onUpdate={onUpdate}
                    />

                </CardContent>
            </Card>

            {/* DIALOGS (Remain unchanged structurally, content handled separately) */}
            <Dialog open={editDayDialogOpen} onOpenChange={setEditDayDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>Edit Day {day.dayNumber}</DialogTitle></DialogHeader>
                    <EventDayForm eventId={eventId} initialData={day} existingDayNumbers={existingDayNumbers.filter((num) => num !== day.dayNumber)} onClose={() => setEditDayDialogOpen(false)} onSuccess={onUpdate} />
                </DialogContent>
            </Dialog>
            <Dialog open={addMealDialogOpen} onOpenChange={setAddMealDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>Add Meal for {formattedDate}</DialogTitle></DialogHeader>
                    <ScheduledMealForm eventId={eventId} dayId={day.id} defaultHeadcounts={{ attendees: day.attendeeHeadcountForDay || 0, volunteers: day.volunteerHeadcountForDay || 0 }} onClose={() => setAddMealDialogOpen(false)} onSuccess={handleMealUpdate} />
                </DialogContent>
            </Dialog>
            <AlertDialog open={deleteDayDialogOpen} onOpenChange={setDeleteDayDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader> <AlertDialogTitle>Are you sure?</AlertDialogTitle> <AlertDialogDescription> This will delete Day {day.dayNumber} ({formattedDate}) and all associated meals. This action cannot be undone. </AlertDialogDescription> </AlertDialogHeader>
                    <AlertDialogFooter> <AlertDialogCancel disabled={isDeletingDay}>Cancel</AlertDialogCancel> <AlertDialogAction onClick={handleDeleteDay} disabled={isDeletingDay} className="bg-destructive text-destructive-foreground hover:bg-destructive/90"> {isDeletingDay && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete </AlertDialogAction> </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* Edit Meal Dialog */}
            <EditScheduledMealDialog
                isOpen={!!editingMeal}
                meal={editingMeal}
                eventId={eventId}
                dayId={day.id}
                onClose={handleCloseEditMealDialog}
                onUpdate={handleMealUpdate}
            />
        </>
    )
}