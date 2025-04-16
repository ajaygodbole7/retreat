// src/services/menu-service.ts
import { menuApi } from "../lib/api";
import { parseStringsToDates } from "../utils/date-utils";
// Import backend types
import type { Menu } from '@server/types/event-types'; // Use Menu type from backend

export const menuService = {
    /** Get simplified list of menus for dropdowns */
    async getAllSimple(): Promise<Pick<Menu, 'id' | 'name' | 'mealType'>[]> {
         try {
            const data = await menuApi.getAllSimple();
            // Only basic fields usually returned, parse if dates were included
            return parseStringsToDates(data) as Pick<Menu, 'id' | 'name' | 'mealType'>[];
        } catch (error) {
            console.error("Error fetching simple menu list:", error);
            throw error;
        }
    },

    // Add other menu service functions (create, getById, delete, add/remove recipe)
    // based on menuApi and test script actions if needed elsewhere in the app
    async create(data: { name: string; description?: string; mealType?: string }): Promise<Menu> {
        try {
            const createdMenu = await menuApi.create(data);
            return parseStringsToDates(createdMenu) as Menu;
        } catch(error) {
             console.error("Error creating menu:", error);
             throw error;
        }
    },
     async getById(menuId: number): Promise<Menu> {
         try {
             const menu = await menuApi.getById(menuId);
             return parseStringsToDates(menu) as Menu;
         } catch(error) {
              console.error(`Error fetching menu ${menuId}:`, error);
              throw error;
         }
    },
     async delete(menuId: number): Promise<boolean> {
         try {
            return await menuApi.delete(menuId);
         } catch(error) {
             console.error(`Error deleting menu ${menuId}:`, error);
             throw error;
         }
    },
     async addRecipeToMenu(menuId: number, recipeId: number, displayOrder?: number ): Promise<any> {
         try {
             return await menuApi.addRecipeToMenu(menuId, { recipeId, displayOrder });
         } catch(error) {
              console.error(`Error adding recipe ${recipeId} to menu ${menuId}:`, error);
              throw error;
         }
    },
     async removeRecipeFromMenu(menuId: number, recipeId: number): Promise<boolean> {
         try {
             return await menuApi.removeRecipeFromMenu(menuId, recipeId);
         } catch(error) {
              console.error(`Error removing recipe ${recipeId} from menu ${menuId}:`, error);
              throw error;
         }
    }
}