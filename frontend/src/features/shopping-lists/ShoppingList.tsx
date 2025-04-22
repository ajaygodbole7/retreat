// src/features/shopping-list/ShoppingList.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Loader2, ShoppingBag, AlertCircle, ListChecks } from 'lucide-react';
import { ShoppingListItem } from "./ShoppingListItem";
import { ShoppingListHeader } from "./ShoppingListHeader";
import { useEventShoppingList, useGenerateShoppingList, useUpdateShoppingListItem, useUpdateShoppingList } from "../../hooks/useShoppingList";
import type { ShoppingListItemData, ShoppingListStatus, ShoppingListItemStatus } from "@server/types/shopping-list-types";

interface ShoppingListProps {
    eventId: number;
}

export function ShoppingList({ eventId }: ShoppingListProps) {
    // State for filters
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState("list");

    // Fetch shopping list data
    const {
        data: shoppingList,
        isLoading,
        isError,
        error
    } = useEventShoppingList(eventId);

    // Mutations
    const generateMutation = useGenerateShoppingList(eventId);
    const updateItemMutation = useUpdateShoppingListItem(eventId);
    const updateListMutation = useUpdateShoppingList(eventId);

    // Derived state
    const categories = useMemo(() => {
        if (!shoppingList?.items) return [];

        const uniqueCategories = new Set<string>();
        shoppingList.items.forEach(item => {
            if (item.categoryName) {
                uniqueCategories.add(item.categoryName);
            }
        });

        return Array.from(uniqueCategories).sort();
    }, [shoppingList?.items]);

    // Filtered items
    const filteredItems = useMemo(() => {
        if (!shoppingList?.items) return [];

        return shoppingList.items.filter(item => {
            const matchesCategory = categoryFilter === "all" || item.categoryName === categoryFilter;
            const matchesStatus = statusFilter === "all" || item.status === statusFilter;
            return matchesCategory && matchesStatus;
        });
    }, [shoppingList?.items, categoryFilter, statusFilter]);

    // Group items by category
    const groupedItems = useMemo(() => {
        const grouped: Record<string, ShoppingListItemData[]> = {};

        filteredItems.forEach(item => {
            const category = item.categoryName || "Uncategorized";
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(item);
        });

        // Sort categories alphabetically, but keep "Uncategorized" at the end
        return Object.entries(grouped)
            .sort(([a], [b]) => {
                if (a === "Uncategorized") return 1;
                if (b === "Uncategorized") return -1;
                return a.localeCompare(b);
            })
            .reduce((acc, [category, items]) => {
                acc[category] = items;
                return acc;
            }, {} as Record<string, ShoppingListItemData[]>);
    }, [filteredItems]);

    // Handlers
    const handleGenerateList = () => {
        generateMutation.mutate();
    };

    const handleUpdateStatus = (status: ShoppingListStatus) => {
        if (!shoppingList?.id) return;

        updateListMutation.mutate({
            listId: shoppingList.id,
            data: { status }
        });
    };

    const handleUpdateItem = (itemId: number, data: Partial<ShoppingListItemData>) => {
        setUpdatingItemId(itemId);
        updateItemMutation.mutate(
            { itemId, data },
            { onSettled: () => setUpdatingItemId(null) }
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <span>Loading shopping list...</span>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Error Loading Shopping List</h2>
                <p className="text-muted-foreground mb-4">{(error as Error)?.message || "Failed to load shopping list"}</p>
                <Button onClick={handleGenerateList}>Try Generating a New List</Button>
            </div>
        );
    }

    // Empty state - no list generated yet
    if (!shoppingList) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Shopping List</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                    <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Shopping List Generated</h3>
                    <p className="text-muted-foreground mb-6">
                        Generate a shopping list based on the meals and consumables for this event.
                    </p>
                    <Button
                        onClick={handleGenerateList}
                        disabled={generateMutation.isPending}
                    >
                        {generateMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Generate Shopping List
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // List exists but is empty
    if (shoppingList.items.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <ShoppingListHeader
                        listId={shoppingList.id}
                        status={shoppingList.status}
                        itemCount={0}
                        isGenerating={generateMutation.isPending}
                        onGenerate={handleGenerateList}
                        onUpdateStatus={handleUpdateStatus}
                        generatedAt={shoppingList.generatedAt}
                        categoryFilter={categoryFilter}
                        onCategoryFilterChange={setCategoryFilter}
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                        categories={categories}
                    />
                </CardHeader>
                <CardContent className="text-center py-12">
                    <ListChecks className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Items in Shopping List</h3>
                    <p className="text-muted-foreground mb-6">
                        The shopping list was generated but no items were found. Try adding meals or consumables to your event.
                    </p>
                    <Button
                        onClick={handleGenerateList}
                        disabled={generateMutation.isPending}
                    >
                        {generateMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Regenerating...
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Regenerate Shopping List
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Render shopping list with items
    return (
        <Card>
            <CardHeader>
                <ShoppingListHeader
                    listId={shoppingList.id}
                    status={shoppingList.status}
                    itemCount={shoppingList.items.length}
                    isGenerating={generateMutation.isPending}
                    onGenerate={handleGenerateList}
                    onUpdateStatus={handleUpdateStatus}
                    generatedAt={shoppingList.generatedAt}
                    categoryFilter={categoryFilter}
                    onCategoryFilterChange={setCategoryFilter}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    categories={categories}
                />
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="list">List View</TabsTrigger>
                        <TabsTrigger value="category">Category View</TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="space-y-4">
                        {filteredItems.length === 0 ? (
                            <p className="text-center py-4 text-muted-foreground">No items match the selected filters.</p>
                        ) : (
                            filteredItems.map(item => (
                                <ShoppingListItem
                                    key={item.id}
                                    item={item}
                                    onUpdate={handleUpdateItem}
                                    isUpdating={updateItemMutation.isPending}
                                    updatingItemId={updatingItemId}
                                />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="category" className="space-y-6">
                        {Object.keys(groupedItems).length === 0 ? (
                            <p className="text-center py-4 text-muted-foreground">No items match the selected filters.</p>
                        ) : (
                            Object.entries(groupedItems).map(([category, items]) => (
                                <div key={category} className="space-y-2">
                                    <h3 className="font-medium text-lg border-b pb-1">{category}</h3>
                                    {items.map(item => (
                                        <ShoppingListItem
                                            key={item.id}
                                            item={item}
                                            onUpdate={handleUpdateItem}
                                            isUpdating={updateItemMutation.isPending}
                                            updatingItemId={updatingItemId}
                                        />
                                    ))}
                                </div>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}