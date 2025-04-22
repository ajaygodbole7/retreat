// src/features/shopping-list/ShoppingListItem.tsx
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Loader2, Check, X, ShoppingBag, AlertCircle } from 'lucide-react';
import { formatQuantity } from "../../utils/format-utils";
import { cn } from "@/lib/utils";
import type { ShoppingListItemData, ShoppingListItemStatus } from "@server/types/shopping-list-types";

interface ShoppingListItemProps {
    item: ShoppingListItemData;
    onUpdate: (itemId: number, data: Partial<ShoppingListItemData>) => void;
    isUpdating: boolean;
    updatingItemId: number | null;
}

export function ShoppingListItem({ item, onUpdate, isUpdating, updatingItemId }: ShoppingListItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [purchasedQuantity, setPurchasedQuantity] = useState<number | undefined>(item.purchasedQuantity || undefined);
    const [notes, setNotes] = useState(item.notes || "");
    const [status, setStatus] = useState<ShoppingListItemStatus>(item.status);

    const isCurrentlyUpdating = isUpdating && updatingItemId === item.id;

    const handleStatusChange = (newStatus: ShoppingListItemStatus) => {
        setStatus(newStatus);

        // If marking as purchased and no purchased quantity is set, use the calculated quantity
        if (newStatus === "PURCHASED" && purchasedQuantity === undefined) {
            setPurchasedQuantity(item.calculatedQuantity);
        }

        // If not editing, update immediately
        if (!isEditing) {
            onUpdate(item.id, { status: newStatus });
        }
    };

    const handleSave = () => {
        onUpdate(item.id, {
            status,
            purchasedQuantity,
            notes: notes || null
        });
        setIsEditing(false);
    };

    const getStatusBadge = () => {
        switch (status) {
            case "PURCHASED":
                return <Badge className="bg-green-500">Purchased</Badge>;
            case "PARTIAL":
                return <Badge className="bg-amber-500">Partial</Badge>;
            case "OUT_OF_STOCK":
                return <Badge className="bg-red-500">Out of Stock</Badge>;
            case "SUBSTITUTED":
                return <Badge className="bg-blue-500">Substituted</Badge>;
            case "NOT_NEEDED":
                return <Badge variant="outline">Not Needed</Badge>;
            default:
                return <Badge variant="outline" className="bg-gray-100">Needed</Badge>;
        }
    };

    return (
        <div className={cn(
            "border rounded-md p-3 mb-2 transition-colors",
            status === "PURCHASED" && "bg-green-50 border-green-200",
            status === "PARTIAL" && "bg-amber-50 border-amber-200",
            status === "OUT_OF_STOCK" && "bg-red-50 border-red-200",
            status === "SUBSTITUTED" && "bg-blue-50 border-blue-200",
            status === "NOT_NEEDED" && "bg-gray-50 border-gray-200"
        )}>
            <div className="flex justify-between items-start">
                <div>
                    <div className="font-medium">{item.ingredientName}</div>
                    <div className="text-sm text-gray-600">
                        {formatQuantity(item.calculatedQuantity)} {item.unitAbbreviation}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {getStatusBadge()}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        disabled={isCurrentlyUpdating}
                    >
                        {isEditing ? "Cancel" : "Edit"}
                    </Button>
                </div>
            </div>

            {isEditing ? (
                <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs font-medium mb-1 block">Status</label>
                            <Select value={status} onValueChange={(val) => setStatus(val as ShoppingListItemStatus)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NEEDED">Needed</SelectItem>
                                    <SelectItem value="PURCHASED">Purchased</SelectItem>
                                    <SelectItem value="PARTIAL">Partial</SelectItem>
                                    <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                                    <SelectItem value="SUBSTITUTED">Substituted</SelectItem>
                                    <SelectItem value="NOT_NEEDED">Not Needed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block">Purchased Quantity</label>
                            <Input
                                type="number"
                                value={purchasedQuantity === undefined ? "" : purchasedQuantity}
                                onChange={(e) => setPurchasedQuantity(e.target.value === "" ? undefined : Number(e.target.value))}
                                placeholder={`${ item.calculatedQuantity }`}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1 block">Notes</label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes (e.g., brand, substitutions)"
                            rows={2}
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(false)}
                            disabled={isCurrentlyUpdating}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isCurrentlyUpdating}
                        >
                            {isCurrentlyUpdating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Save
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    {(status === "PURCHASED" || status === "PARTIAL") && (
                        <div className="mt-2 text-sm">
                            <span className="font-medium">Purchased:</span> {formatQuantity(purchasedQuantity || 0)} {item.unitAbbreviation}
                        </div>
                    )}
                    {notes && (
                        <div className="mt-2 text-sm italic text-gray-600">
                            {notes}
                        </div>
                    )}
                    {!isEditing && (
                        <div className="mt-2 flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleStatusChange("PURCHASED")}
                                disabled={status === "PURCHASED" || isCurrentlyUpdating}
                            >
                                <Check className="mr-1 h-3 w-3" />
                                Mark Purchased
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleStatusChange("OUT_OF_STOCK")}
                                disabled={status === "OUT_OF_STOCK" || isCurrentlyUpdating}
                            >
                                <X className="mr-1 h-3 w-3" />
                                Out of Stock
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}