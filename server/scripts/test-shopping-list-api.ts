// server/scripts/test-shopping-list-api.ts
import axios from 'axios';

// --- Configuration ---
const BASE_URL = 'http://localhost:3001/api'; // Your backend API base URL
const DELAY_MS = 500; // Small delay between steps

// --- Helper Function for Delay ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Main Test Function ---
async function runShoppingListApiTests() {
    console.log("🚀 Starting Shopping List API Test Script...\n");

    // State variables to store IDs created during the test
    let testEventId: number | null = null;
    let testDayId: number | null = null;
    let testMealId: number | null = null;
    let testShoppingListId: number | null = null;
    let testListItemId_Flour: number | null = null;
    let testListItemId_Salt: number | null = null;
    let testListItemId_Napkins: number | null = null;

    // !! IMPORTANT: Replace these with ACTUAL IDs from your SEEDED DEV database !!
    // TODO: Future improvement - query the database for these IDs instead of hardcoding
    const FLOUR_ID = 1;       // Example: Replace with your Flour ingredient ID
    const SALT_ID = 3;        // Example: Replace with your Salt ingredient ID
    const NAPKIN_ID = 4;      // Example: Replace with your Napkin ingredient ID
    const GRAM_ID = 11;       // Example: Replace with your Gram unit ID
    const COUNT_ID = 13;      // Example: Replace with your Count unit ID
    const BREAD_RECIPE_ID = 301;// Example: Replace with your Bread recipe ID (uses Flour)
    const SOUP_RECIPE_ID = 302; // Example: Replace with your Soup recipe ID (uses Salt)

    // Generate unique name for test event
    const uniqueEventName = `SL Test Event ${ Date.now() }`;

    try {
        // === Prerequisite: Create Test Event, Day, Meal, Links ===
        console.log("--- Setting up Test Event Data ---");

        // 1. Create Event
        console.log("Creating base event...");
        let response = await axios.post(`${ BASE_URL }/events`, {
            eventName: uniqueEventName,
            eventType: "RETREAT",
            eventStartDate: "2024-12-15",
            eventEndDate: "2024-12-16",
            status: "PLANNING",
            defaultAttendeeCount: 10, // Base counts, meal/day counts override for scaling
            defaultVolunteerCount: 2,
        });
        testEventId = response.data.id;
        console.log(`   ✅ CREATED Event ID: ${ testEventId }`);
        await delay(DELAY_MS);

        // 2. Add Event Day
        console.log(`Adding Day 1 to Event ID: ${ testEventId }...`);
        response = await axios.post(`${ BASE_URL }/events/${ testEventId }/days`, {
            date: "2024-12-15",
            dayNumber: 1,
            phase: "MAIN_RETREAT",
            attendeeHeadcountForDay: 25, // Headcount for day consumables = 30
            volunteerHeadcountForDay: 5
        });
        testDayId = response.data.id;
        console.log(`   ✅ Added Day 1 ID: ${ testDayId }`);
        await delay(DELAY_MS);

        // 3. Add Scheduled Meal
        console.log(`Adding Meal to Day ID: ${ testDayId }...`);
        response = await axios.post(`${ BASE_URL }/events/days/${ testDayId }/meals`, {
            time: "19:00", // Dinner
            mealType: "DINNER",
            attendeeHeadcount: 22, // Headcount for meal scaling = 25
            volunteerHeadcount: 3
        });
        testMealId = response.data.id;
        console.log(`   ✅ Added Meal ID: ${ testMealId }`);
        await delay(DELAY_MS);

        // 4. Link Recipes to Meal
        console.log(`Linking Recipes to Meal ID: ${ testMealId }...`);
        await axios.post(`${ BASE_URL }/scheduled-meals/${ testMealId }/recipes`, { recipeId: BREAD_RECIPE_ID });
        await axios.post(`${ BASE_URL }/scheduled-meals/${ testMealId }/recipes`, { recipeId: SOUP_RECIPE_ID });
        console.log(`   ✅ Linked Recipes ${ BREAD_RECIPE_ID } & ${ SOUP_RECIPE_ID }`);
        await delay(DELAY_MS);

        // 5. Add Day Consumable
        console.log(`Adding Day Consumable to Day ID: ${ testDayId }...`);
        await axios.post(`${ BASE_URL }/events/days/${ testDayId }/consumables`, {
            ingredientId: NAPKIN_ID,
            baseServingQuantity: 2, // 2 napkins per person
            baseServingSize: 1,     // Defined per 1 person
            unitId: COUNT_ID,
            notes: "Dinner napkins"
        });
        console.log(`   ✅ Added Napkin Consumable`);
        await delay(DELAY_MS);


        // === Test PUT /events/:eventId/shopping-list (Generate/Replace) ===
        console.log(`\n--- Testing PUT /events/${ testEventId }/shopping-list (Generate List) ---`);
        console.log(`Generating shopping list for Event ID: ${ testEventId }...`);
        // Use PUT for generate/replace endpoint
        response = await axios.put(`${ BASE_URL }/events/${ testEventId }/shopping-list`);
        console.log(`   📊 Generate Status Code: ${ response.status }`);
        if (response.status !== 200) throw new Error(`List generation failed with status ${ response.status }`);

        expectStatusCode(response.status, 200);
        expectProperty(response.data, 'id');
        testShoppingListId = response.data.id; // Store list ID
        expectProperty(response.data, 'eventId', testEventId);
        expectProperty(response.data, 'status', 'GENERATED'); // Check status enum value
        expectProperty(response.data, 'generatedAt');
        expectArray(response.data, 'items');
        expect(response.data.items.length).toBe(3); // Flour, Salt, Napkins expected
        console.log(`   ✅ Generated Shopping List ID: ${ testShoppingListId } with ${ response.data.items.length } items.`);

        // Verify specific items and calculated quantities (ADJUST BASED ON YOUR RECIPE DATA)
        // Bread Recipe: Assume 500g flour per 8 servings. Meal headcount = 25. Qty = 500 * (25/8) = 1562.5g -> rounds to 1563g
        const flourItem = response.data.items.find((item: any) => item.ingredientId === FLOUR_ID);
        expectDefined(flourItem, 'Flour Item');
        expectProperty(flourItem, 'unitId', GRAM_ID);
        expectProperty(flourItem, 'calculatedQuantity', 1563); // Check rounded value
        expectProperty(flourItem, 'status', 'NEEDED');
        testListItemId_Flour = flourItem.id; // Store item ID
        console.log(`      Flour: ${ flourItem.calculatedQuantity } ${ flourItem.unitAbbreviation }`);

        // Soup Recipe: Assume 3g salt per 4 servings. Meal headcount = 25. Qty = 3 * (25/4) = 18.75g -> rounds to 18.8g
        const saltItem = response.data.items.find((item: any) => item.ingredientId === SALT_ID);
        expectDefined(saltItem, 'Salt Item');
        expectProperty(saltItem, 'unitId', GRAM_ID);
        expectProperty(saltItem, 'calculatedQuantity', 18.8); // Check rounded value
        expectProperty(saltItem, 'status', 'NEEDED');
        testListItemId_Salt = saltItem.id;
        console.log(`      Salt: ${ saltItem.calculatedQuantity } ${ saltItem.unitAbbreviation }`);

        // Napkin Consumable: Needs 2 per 1 person. Day headcount = 30. Qty = 2 * (30/1) = 60 -> rounds to 60
        const napkinItem = response.data.items.find((item: any) => item.ingredientId === NAPKIN_ID);
        expectDefined(napkinItem, 'Napkin Item');
        expectProperty(napkinItem, 'unitId', COUNT_ID);
        expectProperty(napkinItem, 'calculatedQuantity', 60); // Check rounded value
        expectProperty(napkinItem, 'status', 'NEEDED');
        testListItemId_Napkins = napkinItem.id;
        console.log(`      Napkins: ${ napkinItem.calculatedQuantity } ${ napkinItem.unitAbbreviation }`);
        await delay(DELAY_MS);

        // === Test GET /events/:eventId/shopping-list ===
        console.log(`\n--- Testing GET /events/${ testEventId }/shopping-list ---`);
        response = await axios.get(`${ BASE_URL }/events/${ testEventId }/shopping-list`);
        console.log(`   📊 GET Status Code: ${ response.status }`);
        expectStatusCode(response.status, 200);
        expectProperty(response.data, 'id', testShoppingListId);
        expectProperty(response.data, 'eventId', testEventId);
        expectArray(response.data, 'items');
        expect(response.data.items.length).toBe(3);
        console.log(`   ✅ Retrieved stored list with ${ response.data.items.length } items.`);
        await delay(DELAY_MS);

        // === Test PUT /shopping-lists/items/:itemId (Updated route) ===
        console.log(`\n--- Testing PUT /shopping-lists/items/:itemId ---`);
        if (!testListItemId_Flour) throw new Error("Flour list item ID not set from previous test");
        console.log(`Updating item ID: ${ testListItemId_Flour }...`);
        const updateData = {
            status: 'PURCHASED', // Use Prisma Enum string value
            notes: 'Got King Arthur brand',
            purchasedQuantity: 1600, // Slightly different from calculated
            orderedFrom: "Store X",
            orderPickupDate: "2024-12-16" // YYYY-MM-DD
        };
        // Updated route to use consolidated structure
        response = await axios.put(`${ BASE_URL }/shopping-lists/items/${ testListItemId_Flour }`, updateData);
        console.log(`   📊 PUT Status Code: ${ response.status }`);
        expectStatusCode(response.status, 200);
        // Fixed to use response.data instead of response.body
        expectProperty(response.data, 'id', testListItemId_Flour);
        expectProperty(response.data, 'status', 'PURCHASED');
        expectProperty(response.data, 'notes', 'Got King Arthur brand');
        expectProperty(response.data, 'purchasedQuantity', 1600);
        expectProperty(response.data, 'orderedFrom', 'Store X');
        expect(response.data.orderPickupDate).toContain('2024-12-16'); // Check date part
        console.log(`   ✅ Updated item ${ testListItemId_Flour } status to PURCHASED.`);
        await delay(DELAY_MS);

        // === NEW TEST: PUT /shopping-lists/:listId (Update List Details) ===
        console.log(`\n--- Testing PUT /shopping-lists/${ testShoppingListId } ---`);
        const listUpdateData = {
            status: 'PURCHASING',
            notes: 'Updated list notes for testing'
        };
        response = await axios.put(`${ BASE_URL }/shopping-lists/${ testShoppingListId }`, listUpdateData);
        console.log(`   📊 PUT Status Code: ${ response.status }`);
        expectStatusCode(response.status, 200);
        expectProperty(response.data, 'id', testShoppingListId);
        expectProperty(response.data, 'status', 'PURCHASING');
        expectProperty(response.data, 'notes', 'Updated list notes for testing');
        console.log(`   ✅ Updated list status to PURCHASING.`);
        await delay(DELAY_MS);

        // === Test GET /shopping-lists/consolidated (Updated route) ===
        console.log(`\n--- Testing GET /shopping-lists/consolidated ---`);
        const startDate = '2024-12-01';
        const endDate = '2024-12-31';
        console.log(`Fetching consolidated list for ${ startDate } to ${ endDate }...`);
        // Updated route to use consolidated structure
        response = await axios.get(`${ BASE_URL }/shopping-lists/consolidated`, {
            params: { startDate, endDate }
        });
        console.log(`   📊 GET Status Code: ${ response.status }`);
        expectStatusCode(response.status, 200);
        expect(response.data).toBeInstanceOf(Object);
        // Check if categories from our test event exist
        expectProperty(response.data, 'Grains & Dry Goods');
        expectProperty(response.data, 'Spices');
        expectProperty(response.data, 'Supplies');
        expect(response.data['Grains & Dry Goods'].length).toBeGreaterThanOrEqual(1);
        expect(response.data['Spices'].length).toBeGreaterThanOrEqual(1);
        expect(response.data['Supplies'].length).toBeGreaterThanOrEqual(1);
        console.log(`   ✅ Retrieved consolidated list with ${ Object.keys(response.data).length } categories.`);
        // Check specific item quantities within the consolidated list (should match single event for this test)
        // Fixed to use FLOUR_ID, SALT_ID, and NAPKIN_ID instead of undefined variables
        const consolFlour = response.data['Grains & Dry Goods']?.find((i: any) => i.ingredientId === FLOUR_ID);
        const consolSalt = response.data['Spices']?.find((i: any) => i.ingredientId === SALT_ID);
        const consolNapkins = response.data['Supplies']?.find((i: any) => i.ingredientId === NAPKIN_ID);
        expect(consolFlour?.totalQuantity).toBeCloseTo(1562.5); // Check unrounded total
        expect(consolSalt?.totalQuantity).toBeCloseTo(18.75);
        expect(consolNapkins?.totalQuantity).toBeCloseTo(60);
        console.log(`      Consolidated Flour Qty: ${ consolFlour?.totalQuantity } ${ consolFlour?.unitAbbreviation }`);
        console.log(`      Consolidated Salt Qty: ${ consolSalt?.totalQuantity } ${ consolSalt?.unitAbbreviation }`);
        console.log(`      Consolidated Napkins Qty: ${ consolNapkins?.totalQuantity } ${ consolNapkins?.unitAbbreviation }`);
        await delay(DELAY_MS);


        console.log("\n✅✅✅ Shopping List API tests passed successfully! ✅✅✅");

    } catch (error: any) {
        console.error("\n❌❌❌ SHOPPING LIST API TEST FAILED! ❌❌❌");
        if (error.response) {
            console.error(`Status: ${ error.response.status }`);
            // console.error("Headers:", JSON.stringify(error.response.headers, null, 2));
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error("No response received:", error.request);
        } else {
            console.error("Error setting up request:", error.message);
        }
        console.error("Full Error Object:", error); // Log the full error object
        process.exitCode = 1; // Indicate failure
    } finally {
        // --- Cleanup ---
        console.log("\n--- Cleanup Phase ---");
        if (testEventId) {
            try {
                console.log(`   Attempting to delete Event ID: ${ testEventId }...`);
                await axios.delete(`${ BASE_URL }/events/${ testEventId }`);
                console.log(`   ✅ Deleted Event ID: ${ testEventId }`);
            } catch (cleanupError: any) {
                console.error(`   ⚠️ Cleanup failed for Event ID ${ testEventId }:`, cleanupError.response?.data || cleanupError.message);
            }
        } else {
            console.log("   ℹ️ Event ID not available for cleanup.");
        }
        // Note: ShoppingList and Items should be cascade deleted by Event deletion
        console.log("🧹 Cleanup attempt finished.");
    }
}

// --- Helper Assertions ---
function expectStatusCode(actual: number, expected: number) {
    if (actual !== expected) {
        throw new Error(`Expected status code ${ expected } but received ${ actual }`);
    }
}

function expectProperty(obj: any, propName: string, expectedValue?: any) {
    if (!(propName in obj)) {
        throw new Error(`Expected response object to have property '${ propName }'`);
    }
    if (expectedValue !== undefined && obj[propName] !== expectedValue) {
        throw new Error(`Expected property '${ propName }' to be ${ JSON.stringify(expectedValue) } but received ${ JSON.stringify(obj[propName]) }`);
    }
}

function expectDefined(value: any, valueName: string) {
    if (value === undefined || value === null) {
        throw new Error(`Expected ${ valueName } to be defined, but it was not.`);
    }
}

function expectArray(obj: any, propName: string) {
    expectProperty(obj, propName);
    if (!Array.isArray(obj[propName])) {
        throw new Error(`Expected property '${ propName }' to be an Array`);
    }
}

// Helper function to check if a value is close to an expected value
function expect(actual: any) {
    return {
        toBe: (expected: any) => {
            if (actual !== expected) {
                throw new Error(`Expected ${ JSON.stringify(expected) } but received ${ JSON.stringify(actual) }`);
            }
        },
        toBeGreaterThanOrEqual: (expected: number) => {
            if (typeof actual !== 'number' || actual < expected) {
                throw new Error(`Expected ${ actual } to be >= ${ expected }`);
            }
        },
        toBeInstanceOf: (expected: any) => {
            if (!(actual instanceof expected)) {
                throw new Error(`Expected instance of ${ expected.name } but received ${ actual.constructor.name }`);
            }
        },
        toContain: (expected: string) => {
            if (typeof actual !== 'string' || !actual.includes(expected)) {
                throw new Error(`Expected "${ actual }" to contain "${ expected }"`);
            }
        },
        toBeCloseTo: (expected: number, precision: number = 2) => {
            if (typeof actual !== 'number') {
                throw new Error(`Expected ${ actual } to be a number`);
            }
            const factor = Math.pow(10, precision);
            const roundedActual = Math.round(actual * factor) / factor;
            const roundedExpected = Math.round(expected * factor) / factor;
            if (roundedActual !== roundedExpected) {
                throw new Error(`Expected ${ actual } to be close to ${ expected } (precision: ${ precision })`);
            }
        }
    };
}

// --- Run the Test ---
runShoppingListApiTests();