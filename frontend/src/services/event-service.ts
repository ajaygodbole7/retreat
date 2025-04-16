// src/services/event-service.ts
import { eventApi } from "../lib/api";
import { convertDatesToStrings, parseStringsToDates } from "../utils/date-utils";
import type {
    Event,
    EventDay,
    EventDayConsumable,
    CreateEventInput,
    UpdateEventInput,
    CreateEventDayInput,
    UpdateEventDayInput,
    EventDayConsumableInput,
    UpdateEventDayConsumableInput
} from '@server/types/event-types';

export const eventService = {
    /**
     * Get all events
     */
    async getAll(): Promise<Event[]> {
        try {
            const data = await eventApi.getAll();
            return parseStringsToDates(data); // Parse dates on receiving
        } catch (error) {
            console.error("Error fetching events:", error);
            throw error; // Re-throw after logging
        }
    },

    /**
     * Get a single event by ID (includes days, meals, consumables potentially)
     */
    async getById(eventId: number): Promise<Event & { days?: (EventDay & { consumables?: EventDayConsumable[] })[] }> { // Add expected relations type
        try {
            const data = await eventApi.getById(eventId);
            return parseStringsToDates(data); // Parse dates recursively
        } catch (error) {
            console.error(`Error fetching event ${ eventId }:`, error);
            throw error;
        }
    },

    /**
     * Create a new event
     */
    async create(eventData: CreateEventInput): Promise<Event> {
        try {
            const dataToSend = convertDatesToStrings(eventData); // Stringify dates before sending
            const data = await eventApi.create(dataToSend);
            return parseStringsToDates(data);
        } catch (error) {
            console.error("Error creating event:", error);
            throw error;
        }
    },

    /**
     * Update an existing event
     */
    async update(eventId: number, eventData: UpdateEventInput): Promise<Event> {
        try {
            const dataToSend = convertDatesToStrings(eventData); // Stringify dates before sending
            const data = await eventApi.update(eventId, dataToSend);
            return parseStringsToDates(data);
        } catch (error) {
            console.error(`Error updating event ${ eventId }:`, error);
            throw error;
        }
    },

    /**
     * Delete an event
     */
    async delete(eventId: number): Promise<boolean> {
        try {
            return await eventApi.delete(eventId);
        } catch (error) {
            console.error(`Error deleting event ${ eventId }:`, error);
            throw error;
        }
    },

    // --- Event Day Methods ---

    /**
     * Add a day to an event
     */
    async addDay(eventId: number, dayData: CreateEventDayInput): Promise<EventDay> {
        try {
            console.log(`Adding day to event ${ eventId } with data:`, dayData);

            // Ensure date is properly formatted
            const dataToSend = convertDatesToStrings({
                ...dayData,
                // Explicitly handle nullable values
                notes: dayData.notes === "" ? null : dayData.notes,
                // Ensure numeric values are actually numbers
                dayNumber: typeof dayData.dayNumber === 'string' ? parseInt(dayData.dayNumber) : dayData.dayNumber,
                attendeeHeadcountForDay: typeof dayData.attendeeHeadcountForDay === 'string'
                    ? parseInt(dayData.attendeeHeadcountForDay)
                    : dayData.attendeeHeadcountForDay || 0,
                volunteerHeadcountForDay: typeof dayData.volunteerHeadcountForDay === 'string'
                    ? parseInt(dayData.volunteerHeadcountForDay)
                    : dayData.volunteerHeadcountForDay || 0,
            });

            console.log("Sending data to API:", dataToSend);
            const data = await eventApi.addDay(eventId, dataToSend);
            console.log("API response:", data);

            return parseStringsToDates(data);
        } catch (error) {
            console.error(`Error adding day to event ${ eventId }:`, error);
            throw error;
        }
    },

    /**
     * Update an event day
     */
    async updateDay(dayId: number, dayData: UpdateEventDayInput): Promise<EventDay> {
        try {
            console.log(`Updating event day ${ dayId } with data:`, dayData);

            // Ensure date is properly formatted
            const dataToSend = convertDatesToStrings({
                ...dayData,
                // Explicitly handle nullable values
                notes: dayData.notes === "" ? null : dayData.notes,
                // Ensure numeric values are actually numbers
                dayNumber: typeof dayData.dayNumber === 'string' ? parseInt(dayData.dayNumber) : dayData.dayNumber,
                attendeeHeadcountForDay: typeof dayData.attendeeHeadcountForDay === 'string'
                    ? parseInt(dayData.attendeeHeadcountForDay)
                    : dayData.attendeeHeadcountForDay || 0,
                volunteerHeadcountForDay: typeof dayData.volunteerHeadcountForDay === 'string'
                    ? parseInt(dayData.volunteerHeadcountForDay)
                    : dayData.volunteerHeadcountForDay || 0,
            });

            console.log("Sending data to API:", dataToSend);
            const data = await eventApi.updateDay(dayId, dataToSend);
            console.log("API response:", data);

            return parseStringsToDates(data);
        } catch (error) {
            console.error(`Error updating event day ${ dayId }:`, error);
            throw error;
        }
    },

    /**
     * Delete an event day
     */
    async deleteDay(dayId: number): Promise<boolean> {
        try {
            return await eventApi.deleteDay(dayId);
        } catch (error) {
            console.error(`Error deleting event day ${ dayId }:`, error);
            throw error;
        }
    },

    // --- Event Day Consumable Methods ---

    /**
     * Add a consumable to an event day
     */
    async addConsumable(dayId: number, consumableData: EventDayConsumableInput): Promise<EventDayConsumable> {
        try {
            // No dates involved usually, directly call API
            const data = await eventApi.addConsumable(dayId, consumableData);
            return parseStringsToDates(data); // Parse just in case of createdAt/updatedAt
        } catch (error) {
            console.error(`Error adding consumable to day ${ dayId }:`, error);
            throw error;
        }
    },

    /**
     * Update an event day consumable
     */
    async updateConsumable(consumableId: number, consumableData: UpdateEventDayConsumableInput): Promise<EventDayConsumable> {
        try {
            // No dates involved usually
            const data = await eventApi.updateConsumable(consumableId, consumableData);
            return parseStringsToDates(data);
        } catch (error) {
            console.error(`Error updating consumable ${ consumableId }:`, error);
            throw error;
        }
    },

    /**
     * Delete an event day consumable
     */
    async deleteConsumable(consumableId: number): Promise<boolean> {
        try {
            return await eventApi.deleteConsumable(consumableId);
        } catch (error) {
            console.error(`Error deleting consumable ${ consumableId }:`, error);
            throw error;
        }
    },
};