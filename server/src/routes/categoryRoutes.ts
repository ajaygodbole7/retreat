import express from 'express';
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getSubcategories,
    getSubcategoryById,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory
} from '../controllers/categoryController';
import { validateRequest } from '../middleware/validateRequest';
import {
    createCategorySchema,
    updateCategorySchema,
    createSubcategorySchema,
    updateSubcategorySchema
} from '../schemas/categorySchemas';

const router = express.Router();

// Category routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', validateRequest({ body: createCategorySchema }), createCategory);
router.put('/:id', validateRequest({ body: updateCategorySchema }), updateCategory);
router.delete('/:id', deleteCategory);

// Subcategory routes
router.get('/:categoryId/subcategories', getSubcategories);
router.get('/subcategories/:id', getSubcategoryById);
router.post('/:categoryId/subcategories', validateRequest({ body: createSubcategorySchema }), createSubcategory);
router.put('/subcategories/:id', validateRequest({ body: updateSubcategorySchema }), updateSubcategory);
router.delete('/subcategories/:id', deleteSubcategory);

export { router as categoryRoutes };