"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Users, ShoppingCart, ShoppingBag, Check, X } from "lucide-react"
import { formatQuantity } from "@/utils/format-utils"
import { cn } from "@/lib/utils"
import type {
    ShoppingListWithItems,
    ShoppingListItemData,
    ShoppingListItemStatus,
    ShoppingListStatus,
} from "@server/types/shopping-list-types"

interface ShoppingListTableProps {
    shoppingList: ShoppingListWithItems | null
    isGenerating: boolean
    onGenerateList: () => void
    onUpdateItem: (itemId: number, data: Partial<ShoppingListItemData>) => void
    onUpdateStatus: (status: ShoppingListStatus) => void
    isUpdating: boolean
    updatingItemId: number | null
    totalAttendees?: number
    totalVolunteers?: number
}

export function ShoppingListTable({
    shoppingList,
    isGenerating,
    onGenerateList,
    onUpdateItem,
    onUpdateStatus,
    isUpdating,
    updatingItemId,
    totalAttendees = 0,
    totalVolunteers = 0,
}: ShoppingListTableProps) {
    // State for filters
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [view, setView] = useState<"list" | "category">("list")

    // Get unique categories for filter dropdown
    const categories = useMemo(() => {
        if (!shoppingList?.items) return []

        const uniqueCategories = new Set<string>()
        shoppingList.items.forEach((item) => {
            uniqueCategories.add(item.categoryName || "Uncategorized")
        })

        return Array.from(uniqueCategories).sort()
    }, [shoppingList?.items])

    // Filter items based on search term, category, and status
    const filteredItems = useMemo(() => {
        if (!shoppingList?.items) return []

        return shoppingList.items.filter((item) => {
            // Filter by search term
            const matchesSearch = searchTerm === "" || item.ingredientName.toLowerCase().includes(searchTerm.toLowerCase())

            // Filter by category
            const matchesCategory = categoryFilter === "all" || (item.categoryName || "Uncategorized") === categoryFilter

            // Filter by status
            const matchesStatus = statusFilter === "all" || item.status === statusFilter

            return matchesSearch && matchesCategory && matchesStatus
        })
    }, [shoppingList?.items, searchTerm, categoryFilter, statusFilter])

    // Group items by category for category view
    const groupedItems = useMemo(() => {
        const grouped: Record<string, ShoppingListItemData[]> = {}

        filteredItems.forEach((item) => {
            const category = item.categoryName || "Uncategorized"
            if (!grouped[category]) {
                grouped[category] = []
            }
            grouped[category].push(item)
        })

        return grouped
    }, [filteredItems])

    // If no shopping list exists yet
    if (!shoppingList) {
        return (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Shopping List Generated</h3>
                <p className="text-muted-foreground text-center max-w-md">
                    Generate a shopping list based on the meals and consumables for this event.
                </p>
                <Button onClick={onGenerateList} disabled={isGenerating}>
                    {isGenerating ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Generate Shopping List
                        </>
                    )}
                </Button>
            </div>
        )
    }

    // If shopping list exists but has no items
    if (shoppingList.items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Items in Shopping List</h3>
                <p className="text-muted-foreground text-center max-w-md">
                    The shopping list was generated but no items were found. Try adding meals or consumables to your event.
                </p>
                <Button onClick={onGenerateList} disabled={isGenerating}>
                    {isGenerating ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Regenerating...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerate List
                        </>
                    )}
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {/* Header with generation info and headcount */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold">Shopping List</h2>
                        <Badge>{shoppingList.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {shoppingList.items.length} items • Generated: {new Date(shoppingList.generatedAt || "").toLocaleString()}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {totalAttendees + totalVolunteers} people ({totalAttendees} attendees, {totalVolunteers} volunteers)
                    </Badge>
                    <Button size="sm" onClick={onGenerateList} disabled={isGenerating}>
                        {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        <span className="ml-1 hidden sm:inline">Regenerate</span>
                    </Button>
                    <Select value={shoppingList.status} onValueChange={(value) => onUpdateStatus(value as ShoppingListStatus)}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="GENERATED">Generated</SelectItem>
                            <SelectItem value="PURCHASING">Purchasing</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* View toggle */}
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}>
                        List View
                    </Button>
                    <Button variant={view === "category" ? "default" : "outline"} size="sm" onClick={() => setView("category")}>
                        Category View
                    </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                    {filteredItems.length} of {shoppingList.items.length} items shown
                </div>
            </div>

            {/* Table with inline filtering */}
            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">
                                <div className="flex items-center gap-2">
                                    <span>Ingredient</span>
                                    <div className="flex-1 max-w-xs">
                                        <Input
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>
                            </TableHead>
                            <TableHead className="w-[15%]">
                                <div className="flex items-center gap-2">
                                    <span>Category</span>
                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger className="h-8 text-xs w-[120px]">
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TableHead>
                            <TableHead className="w-[15%]">Quantity</TableHead>
                            <TableHead className="w-[15%]">
                                <div className="flex items-center gap-2">
                                    <span>Status</span>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="h-8 text-xs w-[120px]">
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="NEEDED">Needed</SelectItem>
                                            <SelectItem value="PURCHASED">Purchased</SelectItem>
                                            <SelectItem value="PARTIAL">Partial</SelectItem>
                                            <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                                            <SelectItem value="SUBSTITUTED">Substituted</SelectItem>
                                            <SelectItem value="NOT_NEEDED">Not Needed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TableHead>
                            <TableHead className="w-[15%] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No items match your filters.
                                </TableCell>
                            </TableRow>
                        ) : view === "list" ? (
                            // List view - all items in a flat list
                            filteredItems.map((item) => (
                                <ShoppingListTableRow
                                    key={item.id}
                                    item={item}
                                    onUpdateItem={onUpdateItem}
                                    isUpdating={isUpdating && updatingItemId === item.id}
                                />
                            ))
                        ) : (
                            // Category view - items grouped by category
                            Object.entries(groupedItems).map(([category, items], index) => (
                                <>
                                    <TableRow key={`category-${ category }`} className="bg-muted/50">
                                        <TableCell colSpan={5} className="font-medium py-1">
                                            {category}
                                        </TableCell>
                                    </TableRow>
                                    {items.map((item) => (
                                        <ShoppingListTableRow
                                            key={item.id}
                                            item={item}
                                            onUpdateItem={onUpdateItem}
                                            isUpdating={isUpdating && updatingItemId === item.id}
                                        />
                                    ))}
                                </>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

// Table row component for each shopping list item
interface ShoppingListTableRowProps {
    item: ShoppingListItemData
    onUpdateItem: (itemId: number, data: Partial<ShoppingListItemData>) => void
    isUpdating: boolean
}

function ShoppingListTableRow({ item, onUpdateItem, isUpdating }: ShoppingListTableRowProps) {
    const handleStatusChange = (status: ShoppingListItemStatus) => {
        onUpdateItem(item.id, {
            status,
            // If marking as purchased and no purchased quantity is set, use the calculated quantity
            purchasedQuantity:
                status === "PURCHASED" ? item.purchasedQuantity || item.calculatedQuantity : item.purchasedQuantity,
        })
    }

    // Get status badge
    const getStatusBadge = () => {
        switch (item.status) {
            case "PURCHASED":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Purchased
                    </Badge>
                )
            case "PARTIAL":
                return (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" /> Partial
                    </Badge>
                )
            case "OUT_OF_STOCK":
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-300">
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Out of Stock
                    </Badge>
                )
            case "NEEDED":
            default:
                return (
                    <Badge variant="outline" className="bg-gray-100 hover:bg-gray-200">
                        <ShoppingBag className="h-3.5 w-3.5 mr-1" /> Needed
                    </Badge>
                )
        }
    }

    return (
        <TableRow
            className={cn(
                "h-12", // Make rows more compact
                item.status === "PURCHASED" && "bg-green-50",
                item.status === "OUT_OF_STOCK" && "bg-red-50",
                item.status === "PARTIAL" && "bg-amber-50",
            )}
        >
            <TableCell className="font-medium py-2">
                {item.ingredientName}
                {item.notes && <div className="text-xs text-muted-foreground">{item.notes}</div>}
            </TableCell>
            <TableCell className="py-2">{item.categoryName || "Uncategorized"}</TableCell>
            <TableCell className="py-2">
                {formatQuantity(item.calculatedQuantity)} {item.unitAbbreviation}
                {item.purchasedQuantity && item.purchasedQuantity !== item.calculatedQuantity && (
                    <div className="text-xs text-muted-foreground">
                        Purchased: {formatQuantity(item.purchasedQuantity)} {item.unitAbbreviation}
                    </div>
                )}
            </TableCell>
            <TableCell className="py-2">{getStatusBadge()}</TableCell>
            <TableCell className="text-right py-2">
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleStatusChange("PURCHASED")}
                        disabled={isUpdating || item.status === "PURCHASED"}
                        title="Mark Purchased"
                    >
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="sr-only">Mark Purchased</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleStatusChange("OUT_OF_STOCK")}
                        disabled={isUpdating || item.status === "OUT_OF_STOCK"}
                        title="Mark Out of Stock"
                    >
                        <X className="h-4 w-4 text-red-600" />
                        <span className="sr-only">Mark Out of Stock</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                            // Open edit dialog (to be implemented)
                            console.log("Edit item:", item.id)
                        }}
                        disabled={isUpdating}
                        title="Edit Item"
                    >
                        <span className="text-xs">Edit</span>
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    )
}
