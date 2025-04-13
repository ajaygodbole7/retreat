// src/features/events/EventDayList.tsx
"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Plus, CalendarOff } from "lucide-react" // Added Icon
import { EventDayForm } from "./EventDayForm"
import { EventDayDetail } from "./EventDayDetail" // This component becomes the card content
import type { Event, EventDay } from "@server/types/event-types"
import { ensureArray } from "../../utils/array-utils" // Import helper

interface EventDayListProps {
    event: Event & { days?: EventDay[] }
    onUpdate: () => void // Function to trigger refetch in parent
}

export function EventDayList({ event, onUpdate }: EventDayListProps) {
    const [addDayDialogOpen, setAddDayDialogOpen] = useState(false)

    // Sort days by day number for consistent display order
    const sortedDays = ensureArray(event.days) // Use ensureArray
        .sort((a, b) => a.dayNumber - b.dayNumber);

    // Get existing day numbers for validation in the Add Day form
    const existingDayNumbers = sortedDays.map((day) => day.dayNumber)

    return (
        <div className="space-y-6">
            {/* Add Day Button - Placed above the grid */}
            <div className="flex justify-end">
                <Button onClick={() => setAddDayDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Day
                </Button>
            </div>

            {/* Grid for displaying day cards */}
            {sortedDays.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
                    <CalendarOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No days have been added to this event yet.</p>
                    <Button onClick={() => setAddDayDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Add First Day
                    </Button>
                </div>
            ) : (
                // Responsive Grid Layout
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedDays.map((day) => (
                        <EventDayDetail // EventDayDetail now acts as the Card for each day
                            key={day.id}
                            eventId={event.id}
                            day={day}
                            onUpdate={onUpdate}
                            existingDayNumbers={existingDayNumbers}
                        />
                    ))}
                </div>
            )}

            {/* Add Day Dialog (remains the same) */}
            <Dialog open={addDayDialogOpen} onOpenChange={setAddDayDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Day to {event.eventName}</DialogTitle>
                    </DialogHeader>
                    <EventDayForm
                        eventId={event.id}
                        existingDayNumbers={existingDayNumbers}
                        onClose={() => setAddDayDialogOpen(false)}
                        onSuccess={() => {
                            setAddDayDialogOpen(false)
                            onUpdate() // Trigger parent refetch
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}