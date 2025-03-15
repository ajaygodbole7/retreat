import express from 'express';
import {
    getUnits,
    getUnitById,
    createUnit,
    updateUnit,
    deleteUnit,
    convertUnits
} from '../controllers/unitController';
import { validateRequest } from '../middleware/validateRequest';
import {
    createUnitSchema,
    updateUnitSchema,
    unitConversionSchema
} from '../schemas/unitSchemas';

const router = express.Router();

router.get('/', getUnits);
router.get('/:id', getUnitById);
router.post('/', validateRequest({ body: createUnitSchema }), createUnit);
router.put('/:id', validateRequest({ body: updateUnitSchema }), updateUnit);
router.delete('/:id', deleteUnit);
router.post('/convert', validateRequest({ body: unitConversionSchema }), convertUnits);

export { router as unitRoutes };