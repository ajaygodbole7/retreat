"use client"

import { useState } from "react"
import {
    useEventShoppingList,
    useGenerateShoppingList,
    useUpdateShoppingListItem,
    useUpdateShoppingList,
} from "../../hooks/useShoppingList"
import { ShoppingListTable } from "./ShoppingListTable"
import { Loader2, AlertCircle } from "lucide-react"
import { useEvent } from "../../hooks/useEvents"
import { Button } from "../../components/ui/button"
import type { ShoppingListItemData, ShoppingListStatus } from "@server/types/shopping-list-types"

interface ShoppingListTabProps {
    eventId: number
}

export function ShoppingListTab({ eventId }: ShoppingListTabProps) {
    const [updatingItemId, setUpdatingItemId] = useState<number | null>(null)

    // Fetch shopping list data
    const { data: shoppingList, isLoading, isError, error, refetch } = useEventShoppingList(eventId)

    // Fetch event data to get headcount
    const { data: event } = useEvent(eventId)

    // Calculate total headcount from event days
    const totalAttendees = event?.days?.reduce((sum, day) => sum + (day.attendeeHeadcountForDay || 0), 0) || 0
    const totalVolunteers = event?.days?.reduce((sum, day) => sum + (day.volunteerHeadcountForDay || 0), 0) || 0

    // Mutations
    const generateMutation = useGenerateShoppingList(eventId)
    const updateItemMutation = useUpdateShoppingListItem(eventId)
    const updateListMutation = useUpdateShoppingList(eventId)

    // Handlers
    const handleGenerateList = () => {
        generateMutation.mutate()
    }

    const handleUpdateItem = (itemId: number, data: Partial<ShoppingListItemData>) => {
        setUpdatingItemId(itemId)
        updateItemMutation.mutate({ itemId, data }, { onSettled: () => setUpdatingItemId(null) })
    }

    const handleUpdateStatus = (status: ShoppingListStatus) => {
        if (!shoppingList?.id) return

        updateListMutation.mutate({
            listId: shoppingList.id,
            data: { status },
        })
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span>Loading shopping list...</span>
            </div>
        )
    }

    // Error state
    if (isError) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
                <h2 className="text-lg font-bold mb-2">Error Loading Shopping List</h2>
                <p className="text-muted-foreground mb-4">{(error as Error)?.message || "Failed to load shopping list"}</p>
                <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => refetch()}>
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <ShoppingListTable
            shoppingList={shoppingList}
            isGenerating={generateMutation.isPending}
            onGenerateList={handleGenerateList}
            onUpdateItem={handleUpdateItem}
            onUpdateStatus={handleUpdateStatus}
            isUpdating={updateItemMutation.isPending}
            updatingItemId={updatingItemId}
            totalAttendees={totalAttendees}
            totalVolunteers={totalVolunteers}
        />
    )
}
