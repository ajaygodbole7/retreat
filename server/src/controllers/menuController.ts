import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { createMenuSchema, updateMenuSchema, menuRecipeSchema } from '../schemas/menuSchemas'; // Use correct MenuRecipe schema name
import { HttpStatus } from '../constants/httpStatus';
import { parseBody, parseIdParam } from '../utils/validateRequestUtils';
import { addCreationTracking, addUpdateTracking, getCurrentUserId } from '../utils/whoUtils';

// --- Menu CRUD ---
export const getAllMenus = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const menus = await prisma.menu.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { menuItems: true } } } // Correct relation name
        });
        res.status(HttpStatus.OK).json(menus);
    } catch (error) { next(error); }
};

export const getMenuById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const menuId = parseIdParam(req); // Use 'id' from route param
        const menu = await prisma.menu.findUnique({
            where: { id: menuId },
            include: {
                menuItems: { // Correct relation name
                    orderBy: { displayOrder: 'asc' },
                    include: { recipe: { select: { id: true, name: true, servingSize: true } } }
                }
            }
        });
        if (!menu) throw new AppError('Menu not found', HttpStatus.NOT_FOUND);
        res.status(HttpStatus.OK).json(menu);
    } catch (error) { next(error); }
};

export const createMenu = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = parseBody(req, createMenuSchema);
        const userId = getCurrentUserId(req);
        const trackedData = addCreationTracking(data, userId);
        // ** Use transaction **
        const newMenu = await prisma.$transaction(async (tx) => {
            // Name uniqueness handled by DB constraint P2002
            return tx.menu.create({ data: trackedData });
        });
        res.status(HttpStatus.CREATED).json(newMenu);
    } catch (error) { if ((error as any)?.code === 'P2002' && (error as any)?.meta?.target?.includes('name')) { next(new AppError('Menu name already exists.', HttpStatus.CONFLICT)); } else { next(error); } }
};

export const updateMenu = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const menuId = parseIdParam(req);
        const data = parseBody(req, updateMenuSchema);
        const userId = getCurrentUserId(req);
        const trackedData = addUpdateTracking(data, userId);
        // ** Use transaction **
        const updatedMenu = await prisma.$transaction(async (tx) => {
            const existing = await tx.menu.findUnique({ where: { id: menuId }, select: { id: true } });
            if (!existing) throw new AppError('Menu not found', HttpStatus.NOT_FOUND);
            return tx.menu.update({ where: { id: menuId }, data: trackedData });
        });
        res.status(HttpStatus.OK).json(updatedMenu);
    } catch (error) { if (error instanceof AppError) { next(error); } else if ((error as any)?.code === 'P2025') { next(new AppError('Menu not found', HttpStatus.NOT_FOUND)); } else if ((error as any)?.code === 'P2002') { next(new AppError('Menu name already exists.', HttpStatus.CONFLICT)); } else { next(error); } }
};

export const deleteMenu = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const menuId = parseIdParam(req);
        // ** Use transaction **
        await prisma.$transaction(async (tx) => {
            const existing = await tx.menu.findUnique({ where: { id: menuId }, select: { id: true } });
            if (!existing) throw new AppError('Menu not found', HttpStatus.NOT_FOUND);
            // Cascade delete should handle MenuRecipes
            // SetNull handles ScheduledMeals linking to this menu
            await tx.menu.delete({ where: { id: menuId } });
        });
        res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) { if (error instanceof AppError) { next(error); } else if ((error as any)?.code === 'P2025') { next(new AppError('Menu not found', HttpStatus.NOT_FOUND)); } else { next(error); } }
};

// --- MenuRecipe ---
export const addRecipeToMenu = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const menuId = parseIdParam(req, 'menuId');
        const data = parseBody(req, menuRecipeSchema); // Use correct schema name
        // const userId = getCurrentUserId(req); // Tracking might be added here if needed

        // ** Use transaction **
        const newItem = await prisma.$transaction(async (tx) => {
            const [menuExists, recipeExists] = await Promise.all([
                tx.menu.findUnique({ where: { id: menuId }, select: { id: true } }),
                tx.recipe.findUnique({ where: { id: data.recipeId }, select: { id: true } })
            ]);
            if (!menuExists) throw new AppError('Menu not found', HttpStatus.NOT_FOUND);
            if (!recipeExists) throw new AppError('Recipe not found', HttpStatus.NOT_FOUND);

            return tx.menuRecipe.create({ // Use correct model name
                data: { menuId: menuId, recipeId: data.recipeId, displayOrder: data.displayOrder ?? 0 }
            });
        });
        res.status(HttpStatus.CREATED).json(newItem);
    } catch (error) { if ((error as any)?.code === 'P2002') { next(new AppError('Recipe already exists in this menu.', HttpStatus.CONFLICT)); } else { next(error); } }
};

export const removeRecipeFromMenu = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const menuId = parseIdParam(req, 'menuId');
        const recipeId = parseIdParam(req, 'recipeId');

        // ** Use transaction ** (Optional for single delete, but good practice)
        await prisma.$transaction(async (tx) => {
            // Delete based on the composite unique key
            await tx.menuRecipe.delete({ // Use correct model name
                where: { menuId_recipeId: { menuId: menuId, recipeId: recipeId } }
            });
            // No need to check if deleted, P2025 error handled below if not found
        });
        res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) { if ((error as any)?.code === 'P2025') { next(new AppError('Recipe not found in this menu.', HttpStatus.NOT_FOUND)); } else { next(error); } }
};