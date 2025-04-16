// src/features/events/EventDetail.tsx
import { useState } from "react";
import { useNavigate, Link, useParams } from "@tanstack/react-router";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"; // Keep Card for Shopping List
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useEvent, useDeleteEvent } from "../../hooks/useEvents";
import { EventDayList } from "./EventDayList";
import { Loader2, Calendar, MapPin, Users, Pencil, Trash2, AlertCircle, Plus, ListChecks, Info } from "lucide-react"; // Keep needed icons
import { formatEnum, formatDate } from "../../utils/format-utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog";
// Import all necessary types from backend
import type {
    Event, EventDay, EventDayConsumable, ScheduledMeal, ScheduledMealRecipe, Menu
} from "@server/types/event-types";
import type { Recipe } from "@server/types/recipe-types";
import type { Ingredient } from "@server/types/ingredient-types";
import type { UnitOfMeasure } from "@server/types/ingredient-types";


// REMOVED: EventOverviewTab Component Definition

// --- ShoppingListTab Component (Placeholder) ---
// Kept as is, no changes requested here
function ShoppingListTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Shopping List</CardTitle>
                {/* Removed CardDescription based on feedback */}
                {/* <CardDescription>Consolidated shopping list for the event</CardDescription> */}
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Shopping list generation feature coming soon.</p>
            </CardContent>
        </Card>
    );
}

// --- Define the detailed type expected from useEvent ---
// (Keep this type definition as it reflects backend structure)
type EventWithDetails = Event & {
    days?: (EventDay & {
        consumables?: (EventDayConsumable & {
            ingredient?: Ingredient;
            unit?: UnitOfMeasure;
        })[];
        scheduledMeals?: (ScheduledMeal & {
            menu?: Menu | null;
            scheduledMealRecipes?: (ScheduledMealRecipe & { recipe?: Recipe })[];
        })[];
    })[];
};

interface EventDetailProps {
    eventId?: number;
}

export function EventDetail(props: EventDetailProps) {
    const params = useParams({ from: "/events/$eventId" });
    const eventId = props.eventId !== undefined
        ? props.eventId
        : Number(params.eventId);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("days"); // Default to Days & Meals tab
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const {
        data: event,
        isLoading,
        isError,
        error,
        refetch,
    } = useEvent(eventId, {
        staleTime: 1000 * 60,
        refetchOnWindowFocus: true,
        enabled: !!eventId && eventId > 0 && !isNaN(eventId),
    }) as { data: EventWithDetails | undefined; isLoading: boolean; isError: boolean; error: unknown; refetch: () => void };

    const deleteMutation = useDeleteEvent();
    const isDeleting = deleteMutation.isPending;

    const handleDelete = () => {
        deleteMutation.mutate(eventId, {
            onSuccess: () => {
                navigate({ to: "/events" });
            },
            // onError handled by hook
        });
    };

    // Loading and Error states
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading event details...</span>
            </div>
        );
    }
    if (isError || !event) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Error Loading Event</h2>
                <p className="text-muted-foreground mb-4">{(error as Error)?.message || "Failed to load event details"}</p>
                <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => refetch()}> Try Again </Button>
                    <Button asChild> <Link to="/events">Back to Events</Link> </Button>
                </div>
            </div>
        );
    }

    // Prepare formatted details for header display
    const startDate = event.eventStartDate ? formatDate(event.eventStartDate) : "N/A";
    const endDate = event.eventEndDate ? formatDate(event.eventEndDate) : "N/A";

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* --- HEADER SECTION REFACTORED --- */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b pb-4 mb-6">
                {/* Left Side: Title, Badges, Integrated Details */}
                <div className="space-y-2 flex-grow"> {/* Added flex-grow */}
                    <h1 className="text-3xl font-bold">{event.eventName}</h1>
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={event.status === "ACTIVE" ? "default" : "outline"}>{formatEnum(event.status)}</Badge>
                        <Badge variant="outline">{formatEnum(event.eventType)}</Badge>
                    </div>
                    {/* Inline Details */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm pt-1"> {/* Added pt-1 */}
                        <span className="flex items-center gap-1.5 whitespace-nowrap"> {/* Added whitespace-nowrap */}
                            <Calendar className="h-4 w-4 flex-shrink-0" /> {startDate} - {endDate}
                        </span>
                        {event.location && (
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 flex-shrink-0" /> {event.location}
                            </span>
                        )}
                        {/* Updated "Default Headcount" label */}
                        <span className="flex items-center gap-1.5" title="Reference headcount used when adding days/meals">
                            <Users className="h-4 w-4 flex-shrink-0" /> {event.defaultAttendeeCount || 0} Att / {event.defaultVolunteerCount || 0} Vol
                        </span>
                    </div>
                    {/* Optional Description */}
                    {event.description && (
                        <p className="text-sm text-muted-foreground pt-1 max-w-3xl"> {/* Adjusted max-width */}
                            {event.description}
                        </p>
                    )}
                </div>
                {/* Right Side: Action Buttons */}
                <div className="flex gap-2 flex-shrink-0 mt-2 md:mt-0 self-start"> {/* Kept flex-shrink-0 */}
                    <Button variant="outline" size="sm" asChild>
                        <Link to={`/events/${ eventId }/edit`}>
                            <Pencil className="h-4 w-4 mr-1.5" /> Edit Event
                        </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)} disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1.5" />}
                        Delete Event
                    </Button>
                </div>
            </div>

            {/* Main Tabs */}
            {/* TabsList now has 2 columns */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    {/* Removed Overview Trigger */}
                    <TabsTrigger value="days"> <Calendar className="h-4 w-4 mr-2" /> Days & Meals</TabsTrigger>
                    <TabsTrigger value="shopping"> <ListChecks className="h-4 w-4 mr-2" /> Shopping List</TabsTrigger>
                </TabsList>


                {/* Tab Content: Days & Meals */}
                <TabsContent value="days" className="mt-0"> {/* Removed margin top */}
                    {/* Pass the fully typed event data */}
                    <EventDayList event={event} onUpdate={refetch} />
                </TabsContent>

                {/* Tab Content: Shopping List */}
                <TabsContent value="shopping" className="mt-0"> {/* Removed margin top */}
                    <ShoppingListTab />
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the event "{event.eventName}" and all associated days, meals, recipes, and consumables. This action cannot be undone.
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
        </div>
    )
}