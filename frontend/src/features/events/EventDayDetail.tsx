// src/features/events/EventDayDetail.tsx
import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { format } from "date-fns"
import { Loader2, Plus, Calendar, Clock, Users, Utensils, Pencil, Trash2 } from "lucide-react"
import { useDeleteEventDay } from "../../hooks/useEvents"
import { useScheduledMealsForDay, useDeleteScheduledMeal } from "../../hooks/useScheduledMeals" // Keep this import
import { EventDayForm } from "./EventDayForm"
import { ScheduledMealForm } from "./ScheduledMealForm"
import { ScheduledMealsList } from "./ScheduledMealsList"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { formatEnum } from "../../utils/format-utils"
import { formatTimeForDisplay } from "../../utils/date-utils" // Import new utility
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
import type { EventDay, ScheduledMeal } from "@server/types/event-types"
import { ensureArray } from "../../utils/array-utils"

interface EventDayDetailProps {
    eventId: number
    day: EventDay
    onUpdate: () => void // This likely triggers refetch in parent (EventDetail), which is good.
    existingDayNumbers: number[]
}

export function EventDayDetail({ eventId, day, onUpdate, existingDayNumbers }: EventDayDetailProps) {
    // State for dialogs and editing
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [addMealDialogOpen, setAddMealDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editingMeal, setEditingMeal] = useState<ScheduledMeal | null>(null)
    const [mealDialogOpen, setMealDialogOpen] = useState(false)

    // Fetch scheduled meals for this day
    const {
        data: scheduledMeals,
        isLoading: mealsLoading,
        isError: mealsError,
        error: mealsErrorDetails,
        refetch: refetchMeals // Keep refetch for manual refresh button
    } = useScheduledMealsForDay(day.id, true)

    // Get delete meal mutation
    const deleteMealMutation = useDeleteScheduledMeal(eventId)

    // Effect to handle initial load (optional, as RQ handles caching)
    useEffect(() => {
        console.log(`EventDayDetail mounted/updated for day ${ day.id }`);
        // Optional: refetch on mount if needed, but RQ usually handles this
        // if (day.id) refetchMeals();
    }, [day.id]); // Removed refetchMeals from dependencies

    // Debug logging for the fetched meals
    useEffect(() => {
        console.log(`Day ${ day.id } - Scheduled meals loaded:`, scheduledMeals);
        console.log(`Day ${ day.id } - Meals from day object:`, day.scheduledMeals);
        console.log(`Day ${ day.id } - Loading state:`, mealsLoading);
        console.log(`Day ${ day.id } - Error state:`, mealsError, mealsErrorDetails);
    }, [scheduledMeals, day.scheduledMeals, mealsLoading, mealsError, mealsErrorDetails, day.id]);

    // Delete mutation
    const deleteDayMutation = useDeleteEventDay(eventId)
    const isDeleting = deleteDayMutation.isPending

    // Format date for display
    const formattedDate = day.date ? format(new Date(day.date), "EEEE, MMMM d, yyyy") : "No date set"

    // Handle delete day
    const handleDelete = () => {
        deleteDayMutation.mutate(day.id, {
            onSuccess: () => {
                setDeleteDialogOpen(false)
                onUpdate() // Call parent update (likely triggers event refetch)
            },
            // onError handled by the hook's toast
        })
    }

    // Handle meal edit
    const handleEditMeal = (meal: ScheduledMeal) => {
        console.log("Editing meal:", meal)
        setEditingMeal(meal)
        setMealDialogOpen(true)
    }

    // Handle meal delete
    const handleDeleteMeal = (meal: ScheduledMeal) => {
        console.log("Deleting meal:", meal);
        // The onSuccess logic (refetching) is now handled inside useDeleteScheduledMeal hook
        deleteMealMutation.mutate({
            mealId: meal.id,
            dayId: day.id // Pass dayId for invalidation key
        }, {
            onSuccess: () => {
                // Optional: Add any UI-specific logic needed after successful deletion,
                // but don't manually refetch here.
                console.log("Meal deletion mutation succeeded (handled by hook).");
                onUpdate(); // Notify parent if necessary
            },
            onError: (error) => {
                // Error is handled by the hook's toast
                console.error("Meal deletion mutation failed:", error);
            }
        });
    }

    // Handle meal form success
    const handleMealFormSuccess = () => {
        console.log("Meal form success - invalidation handled by hook")
        // Close dialogs
        setMealDialogOpen(false)
        setAddMealDialogOpen(false)
        setEditingMeal(null)
        // Refetching is now handled by the mutation hook's onSuccess invalidation
        onUpdate() // Notify parent if necessary
    }

    // Determine what meals to show - use the fetched meals if available, otherwise use day.scheduledMeals
    const mealsToShow = scheduledMeals || ensureArray(day.scheduledMeals);

    return (
        <>
            <Card className="mb-6">
                <CardHeader className="pb-3">
                    {/* ... Header remains the same ... */}
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl flex items-center">
                                <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                                Day {day.dayNumber}: {formattedDate}
                            </CardTitle>
                            <CardDescription className="mt-1.5">
                                <Badge variant="outline" className="mr-2">
                                    {formatEnum(day.phase)}
                                </Badge>
                                <span className="text-sm">
                                    {day.attendeeHeadcountForDay || 0} attendees, {day.volunteerHeadcountForDay || 0} volunteers
                                </span>
                            </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                                <Pencil className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive"
                                onClick={() => setDeleteDialogOpen(true)}
                                disabled={isDeleting} // Disable while deleting day
                            >
                                {isDeleting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                                Delete
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Notes Section */}
                    {day.notes && (
                        <div className="mb-4">
                            <h4 className="text-sm font-medium mb-1">Notes:</h4>
                            <p className="text-sm text-muted-foreground">{day.notes}</p>
                        </div>
                    )}
                    {/* Meals Section */}
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-md font-medium flex items-center">
                                <Utensils className="mr-2 h-4 w-4" /> Scheduled Meals
                            </h3>
                            <div className="flex gap-2">
                                {/* Manual Refresh Button */}
                                <Button size="sm" variant="outline" onClick={() => refetchMeals()} disabled={mealsLoading}>
                                    {mealsLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Loader2 className="h-3 w-3 mr-1" />}
                                    Refresh
                                </Button>
                                <Button size="sm" onClick={() => setAddMealDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Meal
                                </Button>
                            </div>
                        </div>
                        {mealsLoading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            </div>
                        ) : mealsError ? (
                            <div className="text-center py-4 text-destructive">
                                <p>Error loading meals: {(mealsErrorDetails as Error)?.message || "Unknown error"}</p>
                                <Button variant="outline" size="sm" className="mt-2" onClick={() => refetchMeals()}>
                                    <div className="flex items-center gap-1">
                                        <Loader2 className="h-3 w-3" /> Retry
                                    </div>
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Debug info - remove for production */}
                                {/* <p className="text-xs text-muted-foreground mb-2"> {mealsToShow.length || 0} meals found for Day {day.id} </p> */}
                                {/* Use the ScheduledMealsList component */}
                                <ScheduledMealsList
                                    meals={mealsToShow}
                                    onEdit={handleEditMeal}
                                    onDelete={handleDeleteMeal} // Pass the handler
                                />
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Edit Day Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Day {day.dayNumber}</DialogTitle>
                    </DialogHeader>
                    <EventDayForm
                        eventId={eventId}
                        initialData={day}
                        existingDayNumbers={existingDayNumbers.filter((num) => num !== day.dayNumber)}
                        onClose={() => setEditDialogOpen(false)}
                        onSuccess={onUpdate} // onUpdate likely triggers parent refetch
                    />
                </DialogContent>
            </Dialog>

            {/* Add Meal Dialog */}
            <Dialog open={addMealDialogOpen} onOpenChange={setAddMealDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Meal for {formattedDate}</DialogTitle>
                    </DialogHeader>
                    <ScheduledMealForm
                        eventId={eventId}
                        dayId={day.id}
                        defaultHeadcounts={{
                            attendees: day.attendeeHeadcountForDay || 0,
                            volunteers: day.volunteerHeadcountForDay || 0,
                        }}
                        onClose={() => setAddMealDialogOpen(false)}
                        onSuccess={handleMealFormSuccess} // This now just closes dialogs/resets state
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Meal Dialog */}
            <Dialog open={mealDialogOpen} onOpenChange={(isOpen) => { setMealDialogOpen(isOpen); if (!isOpen) setEditingMeal(null); }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingMeal ? `Edit ${ formatEnum(editingMeal.mealType) } at ${ formatTimeForDisplay(editingMeal.time) }` : "Edit Meal"}
                        </DialogTitle>
                    </DialogHeader>
                    {editingMeal && (
                        <ScheduledMealForm
                            eventId={eventId}
                            dayId={day.id}
                            initialData={editingMeal}
                            onClose={() => {
                                setMealDialogOpen(false);
                                setEditingMeal(null);
                            }}
                            onSuccess={handleMealFormSuccess} // This now just closes dialogs/resets state
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Day Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete Day {day.dayNumber} ({formattedDate}) and all associated meals and consumables. This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}