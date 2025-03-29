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

        const category = await prisma.$transaction(async (tx) => {
            return tx.ingredientCategory.create({
                data: {
                    name: categoryData.name,
                    description: categoryData.description,
                    storeSection: categoryData.storeSection,
                    displayOrder: categoryData.displayOrder ?? 0
                }
            });
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
        const categoryId = Number(id);
        const updateData = req.body;

        const category = await prisma.$transaction(async (tx) => {
            // First check if category exists
            const existingCategory = await tx.ingredientCategory.findUnique({
                where: { id: categoryId }
            });

            if (!existingCategory) {
                throw new AppError('Category not found', 404);
            }

            return tx.ingredientCategory.update({
                where: { id: categoryId },
                data: updateData
            });
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
        const categoryId = parseInt(id);

        // Check if category has ingredients
        const ingredientCount = await prisma.ingredient.count({
            where: { categoryId: Number(id) }
        });

        if (ingredientCount > 0) {
            throw new AppError('Cannot delete category with associated ingredients', 400);
        }

        await prisma.$transaction(async (tx) => {
            // Check if category exists
            const category = await tx.ingredientCategory.findUnique({
                where: { id: categoryId }
            });

            if (!category) {
                throw new AppError('Category not found', 404);
            }

            // Check if category has ingredients
            const ingredientCount = await tx.ingredient.count({
                where: { categoryId }
            });

            if (ingredientCount > 0) {
                throw new AppError('Cannot delete category with associated ingredients', 400);
            }

            // Check if category has subcategories
            const subcategoryCount = await tx.ingredientSubcategory.count({
                where: { categoryId }
            });

            if (subcategoryCount > 0) {
                throw new AppError('Cannot delete category with associated subcategories', 400);
            }

            await tx.ingredientCategory.delete({
                where: { id: categoryId }
            });
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
        const parsedCategoryId = Number(categoryId);
        const subcategoryData = req.body;

        const subcategory = await prisma.$transaction(async (tx) => {
            // First check if category exists
            const category = await tx.ingredientCategory.findUnique({
                where: { id: parsedCategoryId }
            });

            if (!category) {
                throw new AppError('Category not found', 404);
            }

            return tx.ingredientSubcategory.create({
                data: {
                    name: subcategoryData.name,
                    description: subcategoryData.description,
                    displayOrder: subcategoryData.displayOrder ?? 0,
                    categoryId: parsedCategoryId
                },
                include: { category: true }
            });
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
        const subcategoryId = Number(id);
        const updateData = req.body;

        const subcategory = await prisma.$transaction(async (tx) => {
            // First check if subcategory exists
            const existingSubcategory = await tx.ingredientSubcategory.findUnique({
                where: { id: subcategoryId }
            });

            if (!existingSubcategory) {
                throw new AppError('Subcategory not found', 404);
            }

            return tx.ingredientSubcategory.update({
                where: { id: subcategoryId },
                data: updateData,
                include: { category: true }
            });
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
        const subcategoryId = Number(id);

        await prisma.$transaction(async (tx) => {
            // Check if subcategory exists
            const subcategory = await tx.ingredientSubcategory.findUnique({
                where: { id: subcategoryId }
            });

            if (!subcategory) {
                throw new AppError('Subcategory not found', 404);
            }

            // Check if subcategory has ingredients
            const ingredientCount = await tx.ingredient.count({
                where: { subcategoryId }
            });

            if (ingredientCount > 0) {
                throw new AppError('Cannot delete subcategory with associated ingredients', 400);
            }

            await tx.ingredientSubcategory.delete({
                where: { id: subcategoryId }
            });
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};