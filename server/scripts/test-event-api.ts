// server/scripts/test-event-api.ts
import axios from 'axios';

// --- Configuration ---
const BASE_URL = 'http://localhost:3001/api'; // Your backend API base URL
const DELAY_MS = 500; // Small delay between steps for readability/server processing

// --- Helper Function for Delay ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Main Test Function ---
async function runApiTests() {
    console.log("🚀 Starting API Test Script...\n");

    // State variables to store IDs created during the test
    let eventId: number | null = null;
    let day1Id: number | null = null;
    let day2Id: number | null = null;
    let menuId: number | null = null;
    let meal1Id: number | null = null;
    let meal2Id: number | null = null;
    let consumableId: number | null = null;

    // Assume these Recipe/Ingredient/Unit IDs exist in your seeded DB
    // !! IMPORTANT: Make sure these IDs actually exist in your database !!
    const existingRecipeId1 = 37; // Example: Poha ID (Check your DB)
    const existingRecipeId2 = 38; // Example: Upma ID (Check your DB)
    const existingRecipeId3 = 53; // Example: Roti ID (Check your DB)
    const existingIngredientId = 33; // Example: Tea Bags ID (Check your DB)
    const existingUnitId = 24; // Example: box ID (Check your DB)

    // Generate unique names for tests
    const uniqueEventName = `Test Event ${Date.now()}`;
    const uniqueMenuName = `Test Menu ${Date.now()}`;

    try {
        // === 1. Event API Tests ===
        console.log("\n--- Testing Event API ---");

        // 1a. CREATE Event
        console.log("1a. Creating Event...");
        let response = await axios.post(`${BASE_URL}/events`, {
            eventName: uniqueEventName,
            description: "Event created by test script.",
            eventType: "RETREAT",
            eventStartDate: "2024-09-15", // Use YYYY-MM-DD format
            eventEndDate: "2024-09-17",   // Use YYYY-MM-DD format
            location: "Test Location",
            defaultAttendeeCount: 20,
            defaultVolunteerCount: 5,
            status: "PLANNING"
        });
        eventId = response.data.id;
        console.log(`   ✅ CREATED Event ID: ${eventId}, Name: ${response.data.eventName}`);
        await delay(DELAY_MS);

        // 1b. GET All Events
        console.log("1b. Getting All Events...");
        response = await axios.get(`${BASE_URL}/events`);
        console.log(`   ✅ Found ${response.data.length} events.`);
        await delay(DELAY_MS);

        // 1c. GET Single Event
        console.log(`1c. Getting Event ID: ${eventId}...`);
        response = await axios.get(`${BASE_URL}/events/${eventId}`);
        console.log(`   ✅ Got Event: ${response.data.eventName}`);
        await delay(DELAY_MS);

        // 1d. UPDATE Event
        console.log(`1d. Updating Event ID: ${eventId}...`);
        response = await axios.put(`${BASE_URL}/events/${eventId}`, {
            description: "Updated description via test script.",
            status: "ACTIVE",
            defaultAttendeeCount: 25 // Example update field
        });
        console.log(`   ✅ Updated Event: ${response.data.eventName} (Status: ${response.data.status}, Attendees: ${response.data.defaultAttendeeCount})`);
        await delay(DELAY_MS);

        // === 2. Event Day API Tests ===
        console.log("\n--- Testing Event Day API ---");

        // 2a. ADD Day 1 to Event
        console.log(`2a. Adding Day 1 to Event ID: ${eventId}...`);
        response = await axios.post(`${BASE_URL}/events/${eventId}/days`, {
            date: "2024-09-15", // Use YYYY-MM-DD format
            dayNumber: 1,
            phase: "MAIN_RETREAT",
            notes: "Day 1 Notes",
            attendeeHeadcountForDay: 25, // Test new field
            volunteerHeadcountForDay: 5   // Test new field
        });
        day1Id = response.data.id;
        console.log(`   ✅ Added Day 1 ID: ${day1Id}`);
        await delay(DELAY_MS);

        // 2b. ADD Day 2 to Event
        console.log(`2b. Adding Day 2 to Event ID: ${eventId}...`);
        response = await axios.post(`${BASE_URL}/events/${eventId}/days`, {
            date: "2024-09-16", // Use YYYY-MM-DD format
            dayNumber: 2,
            phase: "MAIN_RETREAT",
            attendeeHeadcountForDay: 26, // Different count for variety
            volunteerHeadcountForDay: 6
        });
        day2Id = response.data.id;
        console.log(`   ✅ Added Day 2 ID: ${day2Id}`);
        await delay(DELAY_MS);

        // 2c. GET Event again (should show days and their details)
        console.log(`2c. Getting Event ID ${eventId} again (with days)...`);
        response = await axios.get(`${BASE_URL}/events/${eventId}`);
        console.log(`   ✅ Event has ${response.data.days?.length || 0} days.`);
        if (response.data.days && response.data.days.length > 0) {
            console.log(`   ✅ Day 1 Details Sample: Day#: ${response.data.days[0].dayNumber}, Attendee#: ${response.data.days[0].attendeeHeadcountForDay}`);
        }
        await delay(DELAY_MS);

        // 2d. UPDATE Day 1
        console.log(`2d. Updating Day ID: ${day1Id}...`);
        response = await axios.put(`${BASE_URL}/events/days/${day1Id}`, {
            notes: "Updated Day 1 Notes!",
            attendeeHeadcountForDay: 24 // Update headcount
        });
        console.log(`   ✅ Updated Day 1 Notes: ${response.data.notes}, Attendees: ${response.data.attendeeHeadcountForDay}`);
        await delay(DELAY_MS);

        // === 3. Menu API Tests ===
        console.log("\n--- Testing Menu API ---");

        // 3a. CREATE Menu
        console.log("3a. Creating Menu...");
        response = await axios.post(`${BASE_URL}/menus`, {
            name: uniqueMenuName, description: "Menu for testing", mealType: "LUNCH"
        });
        menuId = response.data.id;
        console.log(`   ✅ Created Menu ID: ${menuId}, Name: ${response.data.name}`);
        await delay(DELAY_MS);

        // 3b. GET Single Menu
        console.log(`3b. Getting Menu ID: ${menuId}...`);
        response = await axios.get(`${BASE_URL}/menus/${menuId}`);
        console.log(`   ✅ Got Menu: ${response.data.name}`);
        await delay(DELAY_MS);

        // === 4. MenuRecipe API Tests ===
        console.log("\n--- Testing MenuRecipe API ---");

        // 4a. ADD Recipe to Menu
        console.log(`4a. Adding Recipe ID ${existingRecipeId1} to Menu ID ${menuId}...`);
        await axios.post(`${BASE_URL}/menus/${menuId}/recipes`, { recipeId: existingRecipeId1, displayOrder: 1 });
        console.log(`   ✅ Added Recipe ${existingRecipeId1}`);
        await delay(DELAY_MS);

        // 4b. ADD Another Recipe to Menu
        console.log(`4b. Adding Recipe ID ${existingRecipeId2} to Menu ID ${menuId}...`);
        await axios.post(`${BASE_URL}/menus/${menuId}/recipes`, { recipeId: existingRecipeId2, displayOrder: 0 });
        console.log(`   ✅ Added Recipe ${existingRecipeId2}`);
        await delay(DELAY_MS);

        // 4c. GET Menu again (should show recipes)
        console.log(`4c. Getting Menu ID ${menuId} again...`);
        response = await axios.get(`${BASE_URL}/menus/${menuId}`);
        console.log(`   ✅ Menu has ${response.data.menuItems?.length || 0} recipes.`);
        if (response.data.menuItems?.length > 0) {
             console.log(`   ✅ Sample Recipe in Menu: ID ${response.data.menuItems[0].recipe.id}, Name: ${response.data.menuItems[0].recipe.name}`);
        }
        await delay(DELAY_MS);

        // 4d. REMOVE Recipe from Menu
        console.log(`4d. Removing Recipe ID ${existingRecipeId1} from Menu ID ${menuId}...`);
        await axios.delete(`${BASE_URL}/menus/${menuId}/recipes/${existingRecipeId1}`);
        console.log(`   ✅ Removed Recipe ${existingRecipeId1}`);
        await delay(DELAY_MS);

        // === 5. Scheduled Meal API Tests ===
        console.log("\n--- Testing Scheduled Meal API ---");

        // 5a. ADD Meal to Day 2 (no menu link initially)
        console.log(`5a. Adding Meal to Day ID: ${day2Id}...`);
        response = await axios.post(`${BASE_URL}/events/days/${day2Id}/meals`, {
            time: "08:00", // Use HH:MM format as per schema
            mealType: "BREAKFAST",
            attendeeHeadcount: 20,
            volunteerHeadcount: 5
        });
        meal1Id = response.data.id;
        console.log(`   ✅ Added Meal 1 ID: ${meal1Id}`);
        await delay(DELAY_MS);

        // 5b. ADD Another Meal to Day 2 (linking Menu)
        console.log(`5b. Adding Meal to Day ID: ${day2Id} with Menu ID ${menuId}...`);
        response = await axios.post(`${BASE_URL}/events/days/${day2Id}/meals`, {
            time: "12:30", // Use HH:MM format
            mealType: "LUNCH",
            attendeeHeadcount: 22,
            volunteerHeadcount: 4,
            menuId: menuId // Link the menu created earlier
        });
        meal2Id = response.data.id;
        console.log(`   ✅ Added Meal 2 ID: ${meal2Id} (Linked to Menu ${menuId})`);
        await delay(DELAY_MS);

        // 5c. UPDATE Meal 1 (add menu link and change headcount)
        console.log(`5c. Updating Meal ID: ${meal1Id} to link Menu ID ${menuId}...`);
        response = await axios.put(`${BASE_URL}/scheduled-meals/${meal1Id}`, {
             menuId: menuId,
             attendeeHeadcount: 19 // Update headcount
             });
        console.log(`   ✅ Updated Meal 1 (Menu ID: ${response.data.menuId}, Attendees: ${response.data.attendeeHeadcount})`);
        await delay(DELAY_MS);

        // === 6. ScheduledMealRecipe API Tests ===
        console.log("\n--- Testing ScheduledMealRecipe API ---");

        // 6a. ADD Recipe Directly to Meal 1
        console.log(`6a. Adding Recipe ID ${existingRecipeId3} directly to Meal ID ${meal1Id}...`);
        await axios.post(`${BASE_URL}/scheduled-meals/${meal1Id}/recipes`, { recipeId: existingRecipeId3 });
        console.log(`   ✅ Added Recipe ${existingRecipeId3} to Meal ${meal1Id}`);
        await delay(DELAY_MS);

        // 6b. GET Event Day Meals (check Meal 1 recipes)
        console.log(`6b. Getting Meals for Day ID ${day2Id}...`);
        response = await axios.get(`${BASE_URL}/events/days/${day2Id}/meals`);
        const meal1Details = response.data.find((m: any) => m.id === meal1Id);
        console.log(`   ✅ Meal 1 has ${meal1Details?.scheduledMealRecipes?.length || 0} directly linked recipes.`);
        if (meal1Details?.scheduledMealRecipes?.length > 0) {
             console.log(`   ✅ Sample Direct Recipe: ID ${meal1Details.scheduledMealRecipes[0].recipe.id}, Name: ${meal1Details.scheduledMealRecipes[0].recipe.name}`);
        }
        await delay(DELAY_MS);

        // 6c. REMOVE Recipe Directly from Meal 1
        console.log(`6c. Removing Recipe ID ${existingRecipeId3} directly from Meal ID ${meal1Id}...`);
        await axios.delete(`${BASE_URL}/scheduled-meals/${meal1Id}/recipes/${existingRecipeId3}`);
        console.log(`   ✅ Removed Recipe ${existingRecipeId3} from Meal ${meal1Id}`);
        await delay(DELAY_MS);

        // === 7. Event Day Consumable API Tests ===
        console.log("\n--- Testing Event Day Consumable API ---");

        // 7a. ADD Consumable to Day 1
        console.log(`7a. Adding Consumable (Ing ID ${existingIngredientId}, Unit ID ${existingUnitId}) to Day ID ${day1Id}...`);
        response = await axios.post(`${BASE_URL}/events/days/${day1Id}/consumables`, {
            ingredientId: existingIngredientId,
            // Use NEW fields based on updated schema
            baseServingQuantity: 2, // e.g., 2 boxes
            baseServingSize: 1, // e.g., per 1 person (or use default 8 if appropriate)
            unitId: existingUnitId,
            notes: "Tea bags for breaks",
            purchaseTiming: "Pre-Event"
        });
        consumableId = response.data.id;
        console.log(`   ✅ Added Consumable ID: ${consumableId}`);
        await delay(DELAY_MS);

        // 7b. GET Event (check Day 1 consumables)
        console.log(`7b. Getting Event ID ${eventId} again (with consumables)...`);
        response = await axios.get(`${BASE_URL}/events/${eventId}`);
        const day1Details = response.data.days?.find((d: any) => d.id === day1Id);
        console.log(`   ✅ Day 1 has ${day1Details?.consumables?.length || 0} consumables listed.`);
         if (day1Details?.consumables?.length > 0) {
             const cons = day1Details.consumables[0];
             console.log(`   ✅ Sample Consumable: Ing: ${cons.ingredient.name}, Qty: ${cons.baseServingQuantity}, Size: ${cons.baseServingSize}, Unit: ${cons.unit.abbreviation}`);
        }
        await delay(DELAY_MS);

        // 7c. UPDATE Consumable
        console.log(`7c. Updating Consumable ID: ${consumableId}...`);
        // Only update fields allowed by updateEventDayConsumableSchema
        response = await axios.put(`${BASE_URL}/events/consumables/${consumableId}`, {
             baseServingQuantity: 3, // Update quantity
             notes: "Updated: Extra tea bags needed",
             purchaseTiming: "Day 1 Purchase"
             });
        console.log(`   ✅ Updated Consumable ${consumableId} (Qty: ${response.data.baseServingQuantity}, Notes: ${response.data.notes})`);
        await delay(DELAY_MS);

        console.log("\n✅✅✅ All API tests passed successfully! ✅✅✅");

    } catch (error: any) {
        console.error("\n❌❌❌ API TEST FAILED! ❌❌❌");
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error(`Status: ${error.response.status}`);
            console.error("Headers:", JSON.stringify(error.response.headers, null, 2));
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received:", error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error setting up request:", error.message);
        }
        console.error("Full Error Object:", error); // Log the full error object
        process.exitCode = 1; // Indicate failure
    } finally {
        // --- Cleanup (Optional - Delete created test data) ---
        // Consider using a dedicated test database that gets reset instead of manual cleanup
        console.log("\n--- Cleanup Phase ---");
        if (eventId) {
            try {
                console.log(`   Attempting to delete Event ID: ${eventId}...`);
                await axios.delete(`${BASE_URL}/events/${eventId}`);
                console.log(`   ✅ Deleted Event ID: ${eventId}`);
            } catch (cleanupError: any) {
                console.error(`   ⚠️ Cleanup failed for Event ID ${eventId}:`, cleanupError.response?.data || cleanupError.message);
            }
        } else {
             console.log("   ℹ️ Event ID not available for cleanup.");
        }

        // Menu is not cascade deleted with Event, delete separately
        if (menuId) {
            try {
                console.log(`   Attempting to delete Menu ID: ${menuId}...`);
                await axios.delete(`${BASE_URL}/menus/${menuId}`);
                console.log(`   ✅ Deleted Menu ID: ${menuId}`);
            } catch (cleanupError: any) {
                console.error(`   ⚠️ Cleanup failed for Menu ID ${menuId}:`, cleanupError.response?.data || cleanupError.message);
            }
        } else {
            console.log("   ℹ️ Menu ID not available for cleanup.");
        }
        console.log("🧹 Cleanup attempt finished.");
    }
}

// --- Run the Test ---
runApiTests();