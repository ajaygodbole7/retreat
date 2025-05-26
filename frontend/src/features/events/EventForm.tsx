"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, Link } from "@tanstack/react-router"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { DatePicker } from "../../components/ui/date-picker"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { useEvent, useCreateEvent, useUpdateEvent } from "../../hooks/useEvents"
import { Loader2, Save, ArrowLeft } from "lucide-react"
// Import backend enums and types
import { EventType, EventStatus } from "@server/types/event-types"
import type { CreateEventInput, UpdateEventInput } from "@server/types/event-types"
import { formatEnum } from "../../utils/format-utils"

// Zod Schema for Form Validation
const formSchema = z
    .object({
        eventName: z.string().min(1, "Event name is required"),
        description: z.string().optional().nullable(),
        eventType: z.nativeEnum(EventType, { required_error: "Event type is required" }),
        eventStartDate: z.date({ required_error: "Start date is required" }),
        eventEndDate: z.date({ required_error: "End date is required" }),
        location: z.string().optional().nullable(),
        defaultAttendeeCount: z.coerce.number().int().nonnegative("Must be 0 or positive").default(0),
        defaultVolunteerCount: z.coerce.number().int().nonnegative("Must be 0 or positive").default(0),
        status: z.nativeEnum(EventStatus, { required_error: "Status is required" }),
    })
    .refine(
        (data) => {
            if (data.eventStartDate && data.eventEndDate) {
                return data.eventEndDate.getTime() >= data.eventStartDate.getTime()
            }
            return true
        },
        {
            message: "End date cannot be before start date",
            path: ["eventEndDate"],
        },
    )

// Type derived from Zod schema
type FormValues = z.infer<typeof formSchema>

export function EventForm() {
    const navigate = useNavigate()

    // Simplified approach: directly check the URL to determine mode
    // This avoids any complex router hooks that might not be ready during initial render
    const isEditing = window.location.pathname.includes("/edit")
    const eventId = isEditing ? Number.parseInt(window.location.pathname.split("/")[2], 10) : undefined

    console.log(`EventForm Render - Edit Mode: ${ isEditing }, Event ID: ${ eventId }`)

    // --- Data Fetching & Mutations ---
    const {
        data: eventData,
        isLoading: eventLoading,
        isError,
        error: fetchError,
    } = useEvent(eventId!, {
        enabled: isEditing && !!eventId && !isNaN(eventId),
    })
    const createMutation = useCreateEvent()
    const updateMutation = useUpdateEvent()
    const isMutating = createMutation.isPending || updateMutation.isPending

    // --- Form Setup ---
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            eventName: "",
            description: "",
            eventType: EventType.RETREAT,
            eventStartDate: undefined,
            eventEndDate: undefined,
            location: "",
            defaultAttendeeCount: 0,
            defaultVolunteerCount: 0,
            status: EventStatus.PLANNING,
        },
        mode: "onChange",
    })

    // --- Effect to Populate Form on Edit or Reset on New ---
    useEffect(() => {
        if (isEditing) {
            if (eventData) {
                console.log("EventForm Effect: Populating form with edit data", eventData)
                form.reset({
                    eventName: eventData.eventName,
                    description: eventData.description ?? "",
                    eventType: eventData.eventType,
                    eventStartDate: eventData.eventStartDate ? new Date(eventData.eventStartDate) : undefined,
                    eventEndDate: eventData.eventEndDate ? new Date(eventData.eventEndDate) : undefined,
                    location: eventData.location ?? "",
                    defaultAttendeeCount: eventData.defaultAttendeeCount ?? 0,
                    defaultVolunteerCount: eventData.defaultVolunteerCount ?? 0,
                    status: eventData.status,
                })
            }
        } else {
            console.log("EventForm Effect: Resetting form to defaults for new event")
            form.reset({
                eventName: "",
                description: "",
                eventType: EventType.RETREAT,
                eventStartDate: undefined,
                eventEndDate: undefined,
                location: "",
                defaultAttendeeCount: 0,
                defaultVolunteerCount: 0,
                status: EventStatus.PLANNING,
            })
        }
    }, [isEditing, eventData, form])

    // --- Submit Handler ---
    const onSubmit = (values: FormValues) => {
        console.log("EventForm Submit:", isEditing ? "Updating" : "Creating", values)
        if (isEditing && eventId) {
            updateMutation.mutate(
                { eventId, data: values as UpdateEventInput },
                { 
                    onSuccess: () => {
                        // FIX: Use string template for navigation
                        navigate({ to: `/events/${eventId}` })
                    }
                },
            )
        } else {
            createMutation.mutate(values as CreateEventInput, {
                onSuccess: (newEvent) => {
                    // FIX: Use string template for navigation
                    navigate({ to: `/events/${newEvent.id}` })
                }
            })
        }
    }

    // --- Loading/Error States for Edit Mode ---
    if (isEditing && eventLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading Event Data...</span>
            </div>
        )
    }
    if (isEditing && isError) {
        return (
            <div className="text-center py-12 text-destructive">
                <p>Error loading event data: {(fetchError as Error)?.message || "Unknown error"}</p>
                <Link to="/events">
                    <Button variant="outline" className="mt-4">
                        Back to Events
                    </Button>
                </Link>
            </div>
        )
    }

    // --- Back Navigation Path ---
    const backPath = isEditing && eventId ? `/events/${eventId}` : "/events"

    // --- TSX ---
    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <Button variant="outline" size="icon" asChild>
                    <Link to={backPath}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">
                    {isEditing ? `Editing: ${ form.watch("eventName") || "Event" }` : "Create New Event"}
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Event Information</CardTitle>
                    <CardDescription>Fill in the details for the event.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Form fields remain the same */}
                            <FormField
                                control={form.control}
                                name="eventName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Spring Kriya Retreat 2024" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Optional: Add a brief description..."
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Event Type */}
                            <FormField
                                control={form.control}
                                name="eventType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Type *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(EventType).map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {formatEnum(type)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Start & End Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="eventStartDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start Date *</FormLabel>
                                            <FormControl>
                                                <DatePicker value={field.value} onChange={field.onChange} placeholder="Select start date" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="eventEndDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>End Date *</FormLabel>
                                            <FormControl>
                                                <DatePicker value={field.value} onChange={field.onChange} placeholder="Select end date" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {/* Display Zod refine error for date range */}
                            {form.formState.errors.eventEndDate?.message && form.formState.errors.eventEndDate.type === "custom" && (
                                <p className="text-sm font-medium text-destructive">{form.formState.errors.eventEndDate.message}</p>
                            )}
                            {/* Location */}
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Optional: Venue name or address" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Headcounts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="defaultAttendeeCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Default Attendees</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                                                    min="0"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="defaultVolunteerCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Default Volunteers</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                                                    min="0"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {/* Status */}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(EventStatus).map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {formatEnum(status)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate({ to: backPath })}
                                    disabled={isMutating}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isMutating}>
                                    {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} <Save className="mr-2 h-4 w-4" />
                                    {isEditing ? "Update Event" : "Create Event"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}