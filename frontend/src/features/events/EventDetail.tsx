// src/features/events/EventDetail.tsx
import { useState } from "react"
import { useNavigate, Link, useParams } from "@tanstack/react-router"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { format } from "date-fns"
import { useEvent, useDeleteEvent } from "../../hooks/useEvents"
import { EventDayList } from "./EventDayList"
import { Loader2, Calendar, MapPin, Users, Pencil, Trash2, AlertCircle } from "lucide-react"
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

interface EventDetailProps {
    eventId?: number;  // Optional prop
}

export function EventDetail(props: EventDetailProps) {
    const params = useParams({ from: "/events/$eventId" });

    // Use prop if provided, otherwise use param
    const eventId = props.eventId !== undefined
        ? props.eventId
        : Number(params.eventId);

    console.log("EventDetail - Using eventId:", eventId, "Source:", props.eventId !== undefined ? "props" : "params");

    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("days")
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    // Fetch event data
    const {
        data: event,
        isLoading,
        isError,
        error,
        refetch,
    } = useEvent(eventId, {
        refetchOnWindowFocus: true,
        enabled: !!eventId && eventId > 0 && !isNaN(eventId),
    })

    // Delete mutation
    const deleteMutation = useDeleteEvent()
    const isDeleting = deleteMutation.isPending

    // Handle delete
    const handleDelete = () => {
        deleteMutation.mutate(eventId, {
            onSuccess: () => {
                navigate({ to: "/events" })
            },
        })
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading event details...</span>
            </div>
        )
    }

    // Error state
    if (isError || !event) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Error Loading Event</h2>
                <p className="text-muted-foreground mb-4">{(error as Error)?.message || "Failed to load event details"}</p>
                <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => refetch()}>
                        Try Again
                    </Button>
                    <Button asChild>
                        <Link to="/events">Back to Events</Link>
                    </Button>
                </div>
            </div>
        )
    }

    // Format dates
    const startDate = event.eventStartDate ? format(new Date(event.eventStartDate), "MMMM d, yyyy") : "Not set"
    const endDate = event.eventEndDate ? format(new Date(event.eventEndDate), "MMMM d, yyyy") : "Not set"

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{event.eventName}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant={event.status === "ACTIVE" ? "default" : "outline"}>{formatEnum(event.status)}</Badge>
                        <Badge variant="outline">{formatEnum(event.eventType)}</Badge>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to={`/events/${ eventId }/edit`}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                        </Link>
                    </Button>
                    <Button variant="outline" className="text-destructive" onClick={() => setDeleteDialogOpen(true)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                </div>
            </div>

            {/* Event Details Card */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                    <CardDescription>Basic information about this event</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-start mb-4">
                                <Calendar className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Date Range</p>
                                    <p className="text-muted-foreground">
                                        {startDate} to {endDate}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Users className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Default Headcount</p>
                                    <p className="text-muted-foreground">
                                        {event.defaultAttendeeCount || 0} attendees, {event.defaultVolunteerCount || 0} volunteers
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div>
                            {event.location && (
                                <div className="flex items-start mb-4">
                                    <MapPin className="h-5 w-5 mr-2 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Location</p>
                                        <p className="text-muted-foreground">{event.location}</p>
                                    </div>
                                </div>
                            )}
                            {event.description && (
                                <div>
                                    <p className="font-medium mb-1">Description</p>
                                    <p className="text-muted-foreground">{event.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs for Days, Meals, Shopping List */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="days">Days</TabsTrigger>
                    <TabsTrigger value="meals">Meals</TabsTrigger>
                    <TabsTrigger value="shopping">Shopping List</TabsTrigger>
                </TabsList>
                <TabsContent value="days" className="mt-6">
                    <EventDayList event={event} onUpdate={refetch} />
                </TabsContent>
                <TabsContent value="meals" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Meals</CardTitle>
                            <CardDescription>View and manage all meals across event days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Meal planning view coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="shopping" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shopping List</CardTitle>
                            <CardDescription>Consolidated shopping list for the event</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Shopping list view coming soon.</p>
                        </CardContent>
                    </Card>
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
                            className="bg-destructive text-destructive-foreground"
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