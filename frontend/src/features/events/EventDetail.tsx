// src/features/events/EventDetail.tsx
import { useState } from "react"
import { useNavigate, Link, useParams } from "@tanstack/react-router"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { format } from "date-fns"
import { useEvent, useDeleteEvent } from "../../hooks/useEvents"
import { EventDayList } from "./EventDayList" // We will reuse this to render the grid
import { Loader2, Calendar, MapPin, Users, Pencil, Trash2, AlertCircle, Plus, ListChecks, Info } from "lucide-react" // Added Icons
import { formatEnum, formatDate } from "../../utils/format-utils" // Adjusted import
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

// --- EventOverviewTab Component (New Inner Component) ---
function EventOverviewTab({ event }: { event: NonNullable<ReturnType<typeof useEvent>['data']> }) {
    const startDate = event.eventStartDate ? formatDate(event.eventStartDate) : "Not set"
    const endDate = event.eventEndDate ? formatDate(event.eventEndDate) : "Not set"

    return (
        <Card>
            <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Basic information about this event</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div>
                        <div className="flex items-start mb-4">
                            <Calendar className="h-5 w-5 mr-3 text-muted-foreground mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-sm mb-0.5">Date Range</p>
                                <p className="text-muted-foreground text-sm">
                                    {startDate} to {endDate}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Users className="h-5 w-5 mr-3 text-muted-foreground mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-sm mb-0.5">Default Headcount</p>
                                <p className="text-muted-foreground text-sm">
                                    {event.defaultAttendeeCount || 0} attendees, {event.defaultVolunteerCount || 0} volunteers
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Right Column */}
                    <div>
                        {event.location && (
                            <div className="flex items-start mb-4">
                                <MapPin className="h-5 w-5 mr-3 text-muted-foreground mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-sm mb-0.5">Location</p>
                                    <p className="text-muted-foreground text-sm">{event.location}</p>
                                </div>
                            </div>
                        )}
                        {event.description && (
                            <div className="flex items-start">
                                <Info className="h-5 w-5 mr-3 text-muted-foreground mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-sm mb-0.5">Description</p>
                                    <p className="text-muted-foreground text-sm">{event.description}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// --- ShoppingListTab Component (Placeholder) ---
function ShoppingListTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Shopping List</CardTitle>
                <CardDescription>Consolidated shopping list for the event</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Shopping list generation feature coming soon.</p>
                {/* Add Export Button here later */}
            </CardContent>
        </Card>
    );
}


// --- Main EventDetail Component ---
interface EventDetailProps {
    eventId?: number;
}

export function EventDetail(props: EventDetailProps) {
    const params = useParams({ from: "/events/$eventId" });
    const eventId = props.eventId !== undefined
        ? props.eventId
        : Number(params.eventId);
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("days") // Default to Days & Meals tab
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const {
        data: event,
        isLoading,
        isError,
        error,
        refetch, // Keep refetch for the main event query
    } = useEvent(eventId, {
        refetchOnWindowFocus: true,
        enabled: !!eventId && eventId > 0 && !isNaN(eventId),
    })

    const deleteMutation = useDeleteEvent()
    const isDeleting = deleteMutation.isPending

    const handleDelete = () => {
        deleteMutation.mutate(eventId, {
            onSuccess: () => {
                navigate({ to: "/events" })
            },
            // onError handled by hook
        })
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading event details...</span>
            </div>
        )
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
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6"> {/* Increased max-width */}
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Event Title and Badges */}
                <div>
                    <h1 className="text-3xl font-bold">{event.eventName}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant={event.status === "ACTIVE" ? "default" : "outline"}>{formatEnum(event.status)}</Badge>
                        <Badge variant="outline">{formatEnum(event.eventType)}</Badge>
                    </div>
                </div>
                {/* Action Buttons */}
                <div className="flex gap-2 self-start sm:self-center">
                    <Button variant="outline" asChild>
                        <Link to={`/events/${ eventId }/edit`}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit Event
                        </Link>
                    </Button>
                    <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                        Delete Event
                    </Button>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="overview"> <Info className="h-4 w-4 mr-2" /> Overview</TabsTrigger>
                    <TabsTrigger value="days"> <Calendar className="h-4 w-4 mr-2" /> Days & Meals</TabsTrigger>
                    <TabsTrigger value="shopping"> <ListChecks className="h-4 w-4 mr-2" /> Shopping List</TabsTrigger>
                </TabsList>

                {/* Tab Content: Overview */}
                <TabsContent value="overview">
                    <EventOverviewTab event={event} />
                </TabsContent>

                {/* Tab Content: Days & Meals */}
                <TabsContent value="days" className="mt-6">
                    {/* EventDayList will now render the grid */}
                    <EventDayList event={event} onUpdate={refetch} />
                </TabsContent>

                {/* Tab Content: Shopping List */}
                <TabsContent value="shopping" className="mt-6">
                    <ShoppingListTab />
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the event "{event.eventName}" and all associated days, meals, and
                            consumables. This action cannot be undone.
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