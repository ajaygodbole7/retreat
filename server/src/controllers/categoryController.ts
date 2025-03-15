import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import {
    CreateCategoryInput,
    UpdateCategoryInput,
    CreateSubcategoryInput,
    UpdateSubcategoryInput
} from '../schemas/categorySchemas';

// Category Controllers
export const getCategories = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const categories = await prisma.ingredientCategory.findMany({
            orderBy: { displayOrder: 'asc' }
        });

        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

export const getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const category = await prisma.ingredientCategory.findUnique({
            where: { id: Number(id) },
            include: {
                subcategories: {
                    orderBy: { displayOrder: 'asc' }
                }
            }
        });

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (
    req: Request<{}, {}, CreateCategoryInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const categoryData = req.body;

        const category = await prisma.ingredientCategory.create({
            data: {
                name: categoryData.name,
                description: categoryData.description,
                storeSection: categoryData.storeSection,
                displayOrder: categoryData.displayOrder ?? 0
            }
        });

        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (
    req: Request<{ id: string }, {}, UpdateCategoryInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const category = await prisma.ingredientCategory.update({
            where: { id: Number(id) },
            data: updateData
        });

        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if category has ingredients
        const ingredientCount = await prisma.ingredient.count({
            where: { categoryId: Number(id) }
        });

        if (ingredientCount > 0) {
            throw new AppError('Cannot delete category with associated ingredients', 400);
        }

        await prisma.ingredientCategory.delete({
            where: { id: Number(id) }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// Subcategory Controllers
export const getSubcategories = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { categoryId } = req.params;

        const subcategories = await prisma.ingredientSubcategory.findMany({
            where: { categoryId: Number(categoryId) },
            orderBy: { displayOrder: 'asc' }
        });

        res.status(200).json(subcategories);
    } catch (error) {
        next(error);
    }
};

export const getSubcategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const subcategory = await prisma.ingredientSubcategory.findUnique({
            where: { id: Number(id) },
            include: { category: true }
        });

        if (!subcategory) {
            throw new AppError('Subcategory not found', 404);
        }

        res.status(200).json(subcategory);
    } catch (error) {
        next(error);
    }
};

export const createSubcategory = async (
    req: Request<{ categoryId: string }, {}, CreateSubcategoryInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { categoryId } = req.params;
        const subcategoryData = req.body;

        const subcategory = await prisma.ingredientSubcategory.create({
            data: {
                name: subcategoryData.name,
                description: subcategoryData.description,
                displayOrder: subcategoryData.displayOrder ?? 0,
                categoryId: Number(categoryId)
            },
            include: { category: true }
        });

        res.status(201).json(subcategory);
    } catch (error) {
        next(error);
    }
};

export const updateSubcategory = async (
    req: Request<{ id: string }, {}, UpdateSubcategoryInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const subcategory = await prisma.ingredientSubcategory.update({
            where: { id: Number(id) },
            data: updateData,
            include: { category: true }
        });

        res.status(200).json(subcategory);
    } catch (error) {
        next(error);
    }
};

export const deleteSubcategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if subcategory has ingredients
        const ingredientCount = await prisma.ingredient.count({
            where: { subcategoryId: Number(id) }
        });

        if (ingredientCount > 0) {
            throw new AppError('Cannot delete subcategory with associated ingredients', 400);
        }

        await prisma.ingredientSubcategory.delete({
            where: { id: Number(id) }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};