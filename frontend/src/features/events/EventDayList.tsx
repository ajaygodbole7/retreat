"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Plus } from "lucide-react"
import { EventDayForm } from "./EventDayForm"
import { EventDayDetail } from "./EventDayDetail"
import type { Event, EventDay } from "@server/types/event-types"

interface EventDayListProps {
    event: Event & { days?: EventDay[] }
    onUpdate: () => void
}

export function EventDayList({ event, onUpdate }: EventDayListProps) {
    const [addDayDialogOpen, setAddDayDialogOpen] = useState(false)

    // Sort days by day number
    const sortedDays = event.days
        ? [...event.days].sort((a, b) => {
            // First by day number
            return a.dayNumber - b.dayNumber
        })
        : []

    // Get existing day numbers for validation
    const existingDayNumbers = sortedDays.map((day) => day.dayNumber)

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Event Days</h2>
                <Button onClick={() => setAddDayDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Day
                </Button>
            </div>

            {sortedDays.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">No days have been added to this event yet.</p>
                    <Button onClick={() => setAddDayDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Add First Day
                    </Button>
                </div>
            ) : (
                <div>
                    {sortedDays.map((day) => (
                        <EventDayDetail
                            key={day.id}
                            eventId={event.id}
                            day={day}
                            onUpdate={onUpdate}
                            existingDayNumbers={existingDayNumbers}
                        />
                    ))}
                </div>
            )}

            {/* Add Day Dialog */}
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
                            onUpdate()
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}