// src/features/shopping-list/ShoppingListHeader.tsx
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Loader2, RefreshCw, ShoppingBag, Filter } from 'lucide-react';
import { formatEnum } from "../../utils/format-utils";
import { ShoppingListStatus } from "@server/types/shopping-list-types";

interface ShoppingListHeaderProps {
    listId?: number;
    status?: ShoppingListStatus;
    itemCount: number;
    isGenerating: boolean;
    onGenerate: () => void;
    onUpdateStatus: (status: ShoppingListStatus) => void;
    generatedAt?: string | null;
    categoryFilter: string;
    onCategoryFilterChange: (category: string) => void;
    statusFilter: string;
    onStatusFilterChange: (status: string) => void;
    categories: string[];
}

export function ShoppingListHeader({
    listId,
    status = ShoppingListStatus.DRAFT,
    itemCount,
    isGenerating,
    onGenerate,
    onUpdateStatus,
    generatedAt,
    categoryFilter,
    onCategoryFilterChange,
    statusFilter,
    onStatusFilterChange,
    categories
}: ShoppingListHeaderProps) {
    const formattedDate = generatedAt
        ? new Date(generatedAt).toLocaleString()
        : "Not generated yet";

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold">Shopping List</h2>
                        <Badge>{formatEnum(status)}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                        {itemCount} items • Last generated: {formattedDate}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={listId ? "outline" : "default"}
                        onClick={onGenerate}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                {listId ? "Regenerate List" : "Generate List"}
                            </>
                        )}
                    </Button>
                    {listId && (
                        <Select
                            value={status}
                            onValueChange={(value) => onUpdateStatus(value as ShoppingListStatus)}
                            disabled={isGenerating}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="GENERATED">Generated</SelectItem>
                                <SelectItem value="PURCHASING">Purchasing</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="ARCHIVED">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {itemCount > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>
                    <div className="flex gap-2 flex-1">
                        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                            <SelectTrigger className="h-8 text-xs w-[180px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(category => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                            <SelectTrigger className="h-8 text-xs w-[180px]">
                                <SelectValue placeholder="All Statuses" />
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
                </div>
            )}
        </div>
    );
}