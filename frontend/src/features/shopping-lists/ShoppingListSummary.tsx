"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { ShoppingBag, AlertCircle, Loader2 } from "lucide-react"
import { useEventShoppingList } from "../../hooks/useShoppingList"
import { formatEnum } from "../../utils/format-utils"
import { ShoppingListItemStatus } from "@server/types/shopping-list-types"

interface ShoppingListSummaryProps {
    eventId: number
    onViewList: () => void
}

export function ShoppingListSummary({ eventId, onViewList }: ShoppingListSummaryProps) {
    const { data: shoppingList, isLoading, isError } = useEventShoppingList(eventId)

    // Calculate stats
    const stats = {
        total: shoppingList?.items?.length || 0,
        purchased: 0,
        needed: 0,
        outOfStock: 0,
    }

    if (shoppingList?.items) {
        shoppingList.items.forEach((item) => {
            if (item.status === ShoppingListItemStatus.PURCHASED) stats.purchased++
            else if (item.status === ShoppingListItemStatus.NEEDED) stats.needed++
            else if (item.status === ShoppingListItemStatus.OUT_OF_STOCK) stats.outOfStock++
        })
    }

    // Calculate progress percentage
    const progressPercentage = stats.total > 0 ? Math.round((stats.purchased / stats.total) * 100) : 0

    // Loading state
    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                        <ShoppingBag className="h-4 w-4 mr-2" /> Shopping List
                    </CardTitle>
                </CardHeader>
                <CardContent className="py-4 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </CardContent>
            </Card>
        )
    }

    // Error state
    if (isError) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                        <ShoppingBag className="h-4 w-4 mr-2" /> Shopping List
                    </CardTitle>
                </CardHeader>
                <CardContent className="py-4 text-center">
                    <AlertCircle className="h-5 w-5 text-destructive mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Error loading shopping list</p>
                </CardContent>
            </Card>
        )
    }

    // No list generated yet
    if (!shoppingList) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                        <ShoppingBag className="h-4 w-4 mr-2" /> Shopping List
                    </CardTitle>
                </CardHeader>
                <CardContent className="py-4 text-center">
                    <p className="text-xs text-muted-foreground mb-3">No shopping list generated yet</p>
                    <Button size="sm" onClick={onViewList}>
                        Generate List
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // List exists
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <div className="flex items-center">
                        <ShoppingBag className="h-4 w-4 mr-2" /> Shopping List
                    </div>
                    <Badge>{formatEnum(shoppingList.status)}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                {/* Progress bar */}
                <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                        <div className="text-lg font-bold">{stats.total}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{stats.purchased}</div>
                        <div className="text-xs text-muted-foreground">Purchased</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-amber-600">{stats.needed}</div>
                        <div className="text-xs text-muted-foreground">Needed</div>
                    </div>
                </div>

                <Button size="sm" className="w-full" onClick={onViewList}>
                    View Shopping List
                </Button>
            </CardContent>
        </Card>
    )
}
