// src/hooks/useShoppingList.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shoppingListApi } from "../lib/api";
import { useToast } from "./use-toast";
import { parseStringsToDates } from "../utils/date-utils";
import type {
    ShoppingListWithItems,
    ShoppingListData,
    ShoppingListItemData,
    GroupedShoppingList
} from "@server/types/shopping-list-types";

/**
 * Hook to fetch a shopping list for an event
 */
export function useEventShoppingList(eventId: number, enabled = true) {
    return useQuery<ShoppingListWithItems | null>({
        queryKey: ["shoppingList", eventId],
        queryFn: async () => {
            if (!eventId || isNaN(eventId) || eventId <= 0) {
                console.warn(`Invalid eventId in useEventShoppingList: ${ eventId }`);
                return null;
            }
            try {
                const data = await shoppingListApi.getEventShoppingList(eventId);
                return data ? parseStringsToDates(data) : null;
            } catch (error) {
                console.error(`Error fetching shopping list for event ${ eventId }:`, error);
                throw error;
            }
        },
        enabled: enabled && !!eventId && eventId > 0,
        staleTime: 1000 * 60, // 1 minute
    });
}

/**
 * Hook to generate a shopping list for an event
 */
export function useGenerateShoppingList(eventId: number) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<ShoppingListWithItems, Error>({
        mutationFn: async () => {
            if (!eventId || isNaN(eventId) || eventId <= 0) {
                throw new Error(`Invalid eventId: ${ eventId }`);
            }
            const data = await shoppingListApi.generateEventShoppingList(eventId);
            return parseStringsToDates(data);
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["shoppingList", eventId], data);
            toast({
                title: "Shopping List Generated",
                description: `Created with ${ data.items.length } items.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error Generating Shopping List",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

/**
 * Hook to update a shopping list item
 */
export function useUpdateShoppingListItem(eventId: number) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<
        ShoppingListItemData,
        Error,
        { itemId: number; data: Partial<ShoppingListItemData> }
    >({
        mutationFn: async ({ itemId, data }) => {
            const result = await shoppingListApi.updateShoppingListItem(itemId, data);
            return parseStringsToDates(result);
        },
        onSuccess: (updatedItem) => {
            // Update the shopping list in the cache
            queryClient.setQueryData<ShoppingListWithItems | null>(
                ["shoppingList", eventId],
                (oldData) => {
                    if (!oldData) return null;

                    return {
                        ...oldData,
                        items: oldData.items.map(item =>
                            item.id === updatedItem.id ? updatedItem : item
                        ),
                    };
                }
            );

            toast({
                title: "Item Updated",
                description: `${ updatedItem.ingredientName } updated successfully.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error Updating Item",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

/**
 * Hook to update shopping list details
 */
export function useUpdateShoppingList(eventId: number) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<
        ShoppingListData,
        Error,
        { listId: number; data: Partial<ShoppingListData> }
    >({
        mutationFn: async ({ listId, data }) => {
            const result = await shoppingListApi.updateShoppingList(listId, data);
            return parseStringsToDates(result);
        },
        onSuccess: (updatedList) => {
            // Update the shopping list in the cache
            queryClient.setQueryData<ShoppingListWithItems | null>(
                ["shoppingList", eventId],
                (oldData) => {
                    if (!oldData) return null;

                    return {
                        ...oldData,
                        ...updatedList,
                    };
                }
            );

            toast({
                title: "Shopping List Updated",
                description: `List status: ${ updatedList.status }`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error Updating Shopping List",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

/**
 * Hook to fetch a consolidated shopping list
 */
export function useConsolidatedShoppingList(params: {
    startDate?: string;
    endDate?: string;
    eventIds?: number[];
    eventTypes?: string[];
    roundQuantities?: boolean;
}, enabled = true) {
    return useQuery<GroupedShoppingList>({
        queryKey: ["consolidatedShoppingList", params],
        queryFn: async () => {
            return await shoppingListApi.getConsolidatedShoppingList(params);
        },
        enabled,
        staleTime: 1000 * 60, // 1 minute
    });
}