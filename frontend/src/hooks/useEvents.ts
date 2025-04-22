// src/hooks/useEvents.ts
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"; // Import useQueryClient
import { eventApi } from "../lib/api";
import { useToast } from "./use-toast";
import { parseStringsToDates, convertDatesToStrings } from "../utils/date-utils";
import type {
    Event,
    EventDay,
    EventDayConsumable,
    CreateEventInput,
    UpdateEventInput,
    CreateEventDayInput,
    UpdateEventDayInput,
    EventDayConsumableInput,
    UpdateEventDayConsumableInput,
    ScheduledMeal
} from '@server/types/event-types';

// Define the detailed type using imported backend types
// Define the detailed type using imported backend types
// Ensure EventDay includes consumables here if fetched within the main Event query
type EventWithDetails = Event & {
    days?: (EventDay & {
        consumables?: EventDayConsumable[] // Include day consumables
        // Include scheduledMeals relation if needed by components using useEvent directly
        scheduledMeals?: ScheduledMeal[]
    })[]
};
/** Hook for fetching a list of all events */
export function useEventList(options?: Partial<UseQueryOptions<Event[]>>) {
    return useQuery<Event[]>({
        queryKey: ["events"],
        queryFn: async () => {
            const data = await eventApi.getAll();
            return parseStringsToDates(data);
        },
        ...options,
    });
}

/** Hook for fetching a single event by ID */
export function useEvent(eventId: number, options?: Partial<UseQueryOptions<EventWithDetails>>) {
    return useQuery<EventWithDetails>({
        queryKey: ["event", eventId],
        queryFn: async () => {
            const data = await eventApi.getById(eventId);
            return parseStringsToDates(data);
        },
        enabled: !!eventId && eventId > 0 && !isNaN(eventId),
        ...options,
    });
}

/** Hook for creating a new event */
export function useCreateEvent() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation<Event, Error, CreateEventInput>({
        mutationFn: async (data: CreateEventInput) => {
            const dataToSend = convertDatesToStrings(data);
            const result = await eventApi.create(dataToSend);
            return parseStringsToDates(result);
        },
        onSuccess: (newEvent) => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            queryClient.setQueryData(["event", newEvent.id], newEvent);
            toast({ title: "Success", description: "Event created." });
        },
        onError: (error: Error) => {
            toast({ title: "Error Creating Event", description: error.message, variant: "destructive" });
        },
    });
}

/** Hook for updating an event */
export function useUpdateEvent() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation<Event, Error, { eventId: number; data: UpdateEventInput }>({
        mutationFn: async ({ eventId, data }) => {
            const dataToSend = convertDatesToStrings(data);
            const result = await eventApi.update(eventId, dataToSend);
            return parseStringsToDates(result);
        },
        onSuccess: (updatedEvent, variables) => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            // Update the specific event cache directly for immediate UI update
            queryClient.setQueryData(["event", variables.eventId], updatedEvent);
            toast({ title: "Success", description: "Event updated." });
        },
        onError: (error: Error) => {
            toast({ title: "Error Updating Event", description: error.message, variant: "destructive" });
        },
    });
}

/** Hook for deleting an event */
export function useDeleteEvent() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation<boolean, Error, number>({
        mutationFn: (eventId: number) => eventApi.delete(eventId),
        onSuccess: (_, eventId) => {
            // Invalidate the list of all events
            queryClient.invalidateQueries({ queryKey: ["events"] });
            // Remove the specific event from the cache
            queryClient.removeQueries({ queryKey: ["event", eventId] });
            toast({ title: "Success", description: "Event deleted." });
        },
        onError: (error: Error) => {
            toast({ title: "Error Deleting Event", description: error.message, variant: "destructive" });
        },
    });
}

// --- Event Day Hooks ---

/** Hook for adding a day */
export function useAddEventDay() {
    const queryClient = useQueryClient(); // Get query client instance
    const { toast } = useToast();
    return useMutation<EventDay, Error, { eventId: number; data: CreateEventDayInput }>({
        mutationFn: async ({ eventId, data }) => {
            console.log(`Adding day to event ${ eventId } with data:`, data);
            const dataToSend = convertDatesToStrings({
                ...data,
                notes: data.notes === "" ? null : data.notes,
                dayNumber: typeof data.dayNumber === 'string' ? parseInt(data.dayNumber) : data.dayNumber,
                attendeeHeadcountForDay: typeof data.attendeeHeadcountForDay === 'string'
                    ? parseInt(data.attendeeHeadcountForDay)
                    : data.attendeeHeadcountForDay || 0,
                volunteerHeadcountForDay: typeof data.volunteerHeadcountForDay === 'string'
                    ? parseInt(data.volunteerHeadcountForDay)
                    : data.volunteerHeadcountForDay || 0,
            });
            console.log("Sending data to API:", dataToSend);
            const result = await eventApi.addDay(eventId, dataToSend);
            console.log("API response:", result);
            return parseStringsToDates(result);
        },
        onSuccess: (newDay, variables) => {
            console.log("Successfully created day:", newDay);
            // Invalidate the parent event's query to trigger refetch including the new day
            queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
            toast({ title: "Success", description: "Event day added." });
        },
        onError: (error: Error) => {
            console.error("Error adding event day:", error);
            toast({
                title: "Error Adding Day",
                description: error.message || "Failed to add day. Please try again.",
                variant: "destructive"
            });
        },
    });
}

/** Hook for updating a day */
export function useUpdateEventDay(eventId: number) {
    const queryClient = useQueryClient(); // Get query client instance
    const { toast } = useToast();
    return useMutation<EventDay, Error, { dayId: number; data: UpdateEventDayInput }>({
        mutationFn: async ({ dayId, data }) => {
            console.log(`Updating event day ${ dayId } with data:`, data);
            const dataToSend = convertDatesToStrings({
                ...data,
                notes: data.notes === "" ? null : data.notes,
                dayNumber: typeof data.dayNumber === 'string' ? parseInt(data.dayNumber) : data.dayNumber,
                attendeeHeadcountForDay: typeof data.attendeeHeadcountForDay === 'string'
                    ? parseInt(data.attendeeHeadcountForDay)
                    : data.attendeeHeadcountForDay || 0,
                volunteerHeadcountForDay: typeof data.volunteerHeadcountForDay === 'string'
                    ? parseInt(data.volunteerHeadcountForDay)
                    : data.volunteerHeadcountForDay || 0,
            });
            console.log("Sending data to API:", dataToSend);
            const result = await eventApi.updateDay(dayId, dataToSend);
            console.log("API response:", result);
            return parseStringsToDates(result);
        },
        onSuccess: (updatedDay) => {
            console.log("Successfully updated day:", updatedDay);
            // Invalidate the parent event's query to trigger refetch including the updated day
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
            // Also invalidate specific day's meals queries if they exist
            if (updatedDay.id) {
                queryClient.invalidateQueries({ queryKey: ["scheduledMeals", updatedDay.id] });
            }
            toast({ title: "Success", description: "Event day updated." });
        },
        onError: (error: Error) => {
            console.error("Error updating event day:", error);
            toast({
                title: "Error Updating Day",
                description: error.message || "Failed to update day. Please try again.",
                variant: "destructive"
            });
        },
    });
}

/** Hook for deleting a day */
export function useDeleteEventDay(eventId: number) {
    const queryClient = useQueryClient(); // Get query client instance
    const { toast } = useToast();
    return useMutation<boolean, Error, number>({
        mutationFn: (dayId: number) => eventApi.deleteDay(dayId),
        onSuccess: (_, dayId) => { // dayId is passed as the second arg to onSuccess
            console.log(`Successfully deleted day ${ dayId }`);
            // Invalidate the parent event's query to trigger refetch (day will be gone)
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
            // Remove queries related to the deleted day's meals if they exist
            queryClient.removeQueries({ queryKey: ["scheduledMeals", dayId] });
            toast({ title: "Success", description: "Event day deleted." });
        },
        onError: (error: Error) => {
            toast({ title: "Error Deleting Day", description: error.message, variant: "destructive" });
        },
    });
}


// --- Event Day Consumable Hooks --- 

/** Hook for adding a consumable */
export function useAddEventDayConsumable(eventId: number, dayId?: number) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation<EventDayConsumable, Error, { dayId?: number; data: EventDayConsumableInput }>({
        mutationFn: async ({ dayId: paramDayId, data }) => {
            // Use the dayId from the parameter if provided, otherwise use the one from the hook
            const effectiveDayId = paramDayId || dayId

            if (!effectiveDayId) {
                throw new Error("Day ID is required to add a consumable")
            }

            const result = await eventApi.addConsumable(effectiveDayId, data);
            return parseStringsToDates(result);
        },
        onSuccess: () => { // Added variables here
            // Invalidate the main event query to reflect the added consumable
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
            toast({ title: "Success", description: "Consumable added." });
        },
        onError: (error: Error) => {
            toast({ title: "Error Adding Consumable", description: error.message, variant: "destructive" });
        },
    });
}

/** Hook for updating a consumable */
export function useUpdateEventDayConsumable(eventId: number) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation<EventDayConsumable, Error, { consumableId: number; data: UpdateEventDayConsumableInput }>({
        mutationFn: async ({ consumableId, data }) => {
            const result = await eventApi.updateConsumable(consumableId, data);
            return parseStringsToDates(result);
        },
        onSuccess: () => {
            // Invalidate the main event query to reflect the updated consumable
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
            toast({ title: "Success", description: "Consumable updated." });
        },
        onError: (error: Error) => {
            toast({ title: "Error Updating Consumable", description: error.message, variant: "destructive" });
        },
    });
}

/** Hook for deleting a consumable */
export function useDeleteEventDayConsumable(eventId: number) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation<boolean, Error, number>({
        mutationFn: (consumableId: number) => eventApi.deleteConsumable(consumableId),
        onSuccess: () => {
            // Invalidate the main event query to reflect the deleted consumable
            queryClient.invalidateQueries({ queryKey: ["event", eventId] });
            toast({ title: "Success", description: "Consumable deleted." });
        },
        onError: (error: Error) => {
            toast({ title: "Error Deleting Consumable", description: error.message, variant: "destructive" });
        },
    });
}