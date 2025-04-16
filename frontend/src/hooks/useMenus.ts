// src/hooks/useMenus.ts (Refactored)
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuApi } from "../lib/api";
import { parseStringsToDates } from "../utils/date-utils";
import { useToast } from "./use-toast";
import type { Menu } from '@server/types/event-types';

/**
 * Hook for fetching a simplified list of menus (id, name, type) for dropdowns.
 */
export function useMenuListSimple() {
    return useQuery<Pick<Menu, 'id' | 'name' | 'mealType'>[]>({
        queryKey: ["menus", "simple"],
        queryFn: async () => {
            const data = await menuApi.getAllSimple();
            return parseStringsToDates(data) as Pick<Menu, 'id' | 'name' | 'mealType'>[];
        },
        staleTime: 1000 * 60 * 15, // Cache menus longer
    });
}

/**
 * Hook for creating a new menu
 */
export function useCreateMenu() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<Menu, Error, { name: string; description?: string; mealType?: string }>({
        mutationFn: async (data) => {
            const result = await menuApi.create(data);
            return parseStringsToDates(result) as Menu;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["menus"] });
            toast({ title: "Success", description: "Menu created." });
        },
        onError: (error: Error) => {
            toast({
                title: "Error Creating Menu",
                description: error.message,
                variant: "destructive"
            });
        }
    });
}

/**
 * Hook for fetching a menu by ID
 */
export function useMenu(menuId: number) {
    return useQuery<Menu>({
        queryKey: ["menu", menuId],
        queryFn: async () => {
            const result = await menuApi.getById(menuId);
            return parseStringsToDates(result) as Menu;
        },
        enabled: !!menuId && menuId > 0
    });
}

/**
 * Hook for deleting a menu
 */
export function useDeleteMenu() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<boolean, Error, number>({
        mutationFn: async (menuId) => {
            return await menuApi.delete(menuId);
        },
        onSuccess: (_, menuId) => {
            queryClient.invalidateQueries({ queryKey: ["menus"] });
            queryClient.removeQueries({ queryKey: ["menu", menuId] });
            toast({ title: "Success", description: "Menu deleted." });
        },
        onError: (error: Error) => {
            toast({
                title: "Error Deleting Menu",
                description: error.message,
                variant: "destructive"
            });
        }
    });
}