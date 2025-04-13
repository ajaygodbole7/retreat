// src/features/events/EventDayForm.tsx

"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { DatePicker } from "../../components/ui/date-picker"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../components/ui/form"
import { useAddEventDay, useUpdateEventDay } from "../../hooks/useEvents"
import { Loader2 } from "lucide-react"
import { EventPhase } from "@server/types/event-types"
import type { EventDay, CreateEventDayInput, UpdateEventDayInput } from "@server/types/event-types"
import { formatEnum } from "../../utils/format-utils"

// Improved Zod Schema with better type handling
const eventDaySchema = z.object({
    date: z.date({ required_error: "Date is required" }),
    dayNumber: z.preprocess(
        (val) => {
            // Handle empty string, null, or undefined
            if (val === "" || val === null || val === undefined) return undefined;
            // Convert to number
            const num = Number(val);
            // Check if it's valid number
            return isNaN(num) ? undefined : num;
        },
        z.number().int().nonnegative({ message: "Day number must be non-negative" })
    ),
    phase: z.nativeEnum(EventPhase, {
        required_error: "Phase is required"
    }).default(EventPhase.MAIN_RETREAT),
    attendeeHeadcountForDay: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return 0;
            const num = Number(val);
            return isNaN(num) ? 0 : num;
        },
        z.number().int().nonnegative().default(0),
    ),
    volunteerHeadcountForDay: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return 0;
            const num = Number(val);
            return isNaN(num) ? 0 : num;
        },
        z.number().int().nonnegative().default(0),
    ),
    notes: z.string().optional().nullable().default(""),
})

type EventDayFormValues = z.infer<typeof eventDaySchema>

interface EventDayFormProps {
    eventId: number
    initialData?: EventDay | null
    existingDayNumbers?: number[]
    onClose: () => void
    onSuccess?: (data: EventDay) => void
}

export function EventDayForm({ eventId, initialData, existingDayNumbers = [], onClose, onSuccess }: EventDayFormProps) {
    const isEditing = !!initialData

    // --- Hooks ---
    const addDayMutation = useAddEventDay()
    const updateDayMutation = useUpdateEventDay(eventId)
    const isMutating = addDayMutation.isPending || updateDayMutation.isPending

    // --- Form Setup ---
    const form = useForm<EventDayFormValues>({
        resolver: zodResolver(eventDaySchema),
        defaultValues: {
            // Initialize with defaults
            date: undefined,
            dayNumber: 0,
            phase: EventPhase.MAIN_RETREAT,
            attendeeHeadcountForDay: 0,
            volunteerHeadcountForDay: 0,
            notes: "",
        },
    })

    // --- Effect to reset form when initialData changes ---
    useEffect(() => {
        if (initialData) {
            form.reset({
                date: initialData.date ? new Date(initialData.date) : undefined,
                dayNumber: initialData.dayNumber ?? 0,
                phase: initialData.phase ?? EventPhase.MAIN_RETREAT,
                attendeeHeadcountForDay: initialData.attendeeHeadcountForDay ?? 0,
                volunteerHeadcountForDay: initialData.volunteerHeadcountForDay ?? 0,
                notes: initialData.notes ?? "",
            })
        } else {
            // Calculate next available day number if not editing
            const nextDayNum = existingDayNumbers.length > 0 ? Math.max(...existingDayNumbers) + 1 : 0
            form.reset({
                date: undefined,
                dayNumber: nextDayNum,
                phase: EventPhase.MAIN_RETREAT,
                attendeeHeadcountForDay: 0,
                volunteerHeadcountForDay: 0,
                notes: "",
            })
        }
    }, [initialData, form, existingDayNumbers])

    // --- Handlers ---
    const onSubmit = (values: EventDayFormValues) => {
        // Simple frontend check for duplicate day number before submitting
        if (!isEditing && existingDayNumbers.includes(values.dayNumber)) {
            form.setError("dayNumber", { type: "manual", message: "Day number already exists for this event." })
            return
        }

        // Allow updating if the day number belongs to the current day being edited
        if (
            isEditing &&
            initialData &&
            initialData.dayNumber !== values.dayNumber &&
            existingDayNumbers.includes(values.dayNumber)
        ) {
            form.setError("dayNumber", { type: "manual", message: "Day number already exists for this event." })
            return
        }

        // Prepare data for submission
        const submissionData = {
            ...values,
            // Make sure to handle nullable fields properly
            notes: values.notes === "" ? null : values.notes,
        };

        // For edit mode - use update mutation
        if (isEditing && initialData) {
            updateDayMutation.mutate(
                {
                    dayId: initialData.id,
                    data: submissionData as UpdateEventDayInput
                },
                {
                    onSuccess: (data) => {
                        onSuccess?.(data)
                        onClose()
                    },
                    onError: (error) => {
                        console.error("Error updating event day:", error);
                        // Optionally show error message
                    }
                },
            )
        } else {
            // For new mode - use create mutation
            addDayMutation.mutate(
                {
                    eventId,
                    data: submissionData as CreateEventDayInput
                },
                {
                    onSuccess: (data) => {
                        onSuccess?.(data)
                        onClose()
                    },
                    onError: (error) => {
                        console.error("Error creating event day:", error);
                        // Optionally show error message
                    }
                },
            )
        }
    }

    // --- TSX ---
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
                {/* Date Picker */}
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date *</FormLabel>
                            <FormControl>
                                <DatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select date"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* Day Number & Phase */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="dayNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Day Number *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="e.g., 0, 1"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => {
                                            const value = e.target.value === "" ? undefined : e.target.value;
                                            field.onChange(value);
                                        }}
                                        min="0"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phase"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phase *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select phase" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(EventPhase).map((phase) => (
                                            <SelectItem key={phase} value={phase}>
                                                {formatEnum(phase)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {/* Headcounts */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="attendeeHeadcountForDay"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Attendees (Consumables)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => {
                                            const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                                            field.onChange(isNaN(value) ? 0 : value);
                                        }}
                                        min="0"
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">Daily snacks, tea, etc.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="volunteerHeadcountForDay"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Volunteers (Consumables)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => {
                                            const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                                            field.onChange(isNaN(value) ? 0 : value);
                                        }}
                                        min="0"
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">Daily snacks, tea, etc.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {/* Notes */}
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Optional notes for this specific day..."
                                    {...field}
                                    value={field.value ?? ""}
                                    rows={3}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* Submit Buttons */}
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isMutating}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isMutating}>
                        {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? "Update Day" : "Add Day"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}