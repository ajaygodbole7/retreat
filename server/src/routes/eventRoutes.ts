import express from 'express';
import * as eventController from '../controllers/eventController';
import * as scheduledMealController from '../controllers/scheduledMealController'; // Import meal controller
import { validateRequest } from '../middleware/validateRequest';
import { createEventSchema, updateEventSchema, createEventDaySchema, updateEventDaySchema, eventDayConsumableSchema, updateEventDayConsumableSchema } from '../schemas/eventSchemas';
import { createScheduledMealSchema } from '../schemas/scheduledMealSchemas'; // Import meal schema

const router = express.Router();

// --- Event Routes ---
router.get('/', eventController.getAllEvents);
router.post('/', validateRequest({ body: createEventSchema }), eventController.createEvent);
router.get('/:eventId', eventController.getEventById); // Renamed param for clarity
router.put('/:eventId', validateRequest({ body: updateEventSchema }), eventController.updateEvent);
router.delete('/:eventId', eventController.deleteEvent);

// --- EventDay Routes (Nested under Event) ---
router.post('/:eventId/days', validateRequest({ body: createEventDaySchema }), eventController.addEventDay);
// Note: Getting all days for an event is handled by getEventById include typically
router.put('/days/:dayId', validateRequest({ body: updateEventDaySchema }), eventController.updateEventDay);
router.delete('/days/:dayId', eventController.deleteEventDay);

// --- EventDayConsumable Routes (Nested under EventDay) ---
router.post('/days/:dayId/consumables', validateRequest({ body: eventDayConsumableSchema }), eventController.addEventDayConsumable);
router.put('/consumables/:consumableId', validateRequest({ body: updateEventDayConsumableSchema }), eventController.updateEventDayConsumable); // Update by consumable ID
router.delete('/consumables/:consumableId', eventController.deleteEventDayConsumable); // Delete by consumable ID
// Note: Getting consumables is handled by getEventById include

// --- ScheduledMeal Routes (Nested under EventDay) ---
router.get('/days/:dayId/meals', scheduledMealController.getMealsForEventDay);
router.post('/days/:dayId/meals', validateRequest({ body: createScheduledMealSchema }), scheduledMealController.createMealForEventDay);
// Individual meal updates/deletes use the separate scheduledMealRoutes below


export { router as eventRoutes };