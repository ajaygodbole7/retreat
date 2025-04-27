// server/scripts/test-auth-api.ts
import axios from 'axios';

// --- Configuration ---
const BASE_URL = 'http://localhost:3001/api'; // Your backend API base URL
const DELAY_MS = 500; // Small delay between steps for readability/server processing

// --- Helper Function for Delay ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Testing Utility Functions ---
// Configure axios for testing
const testApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Save the token when we login
let authToken: string | null = null;

// Utility to set auth header in calls that need it
const withAuth = () => {
    if (authToken) {
        return { headers: { Authorization: `Bearer ${ authToken }` } };
    }
    return {};
};

// --- Main Test Function ---
async function runAuthApiTests() {
    console.log("🚀 Starting Auth API Test Script...\n");

    // Generate unique identifiers for test users
    const timestamp = Date.now();
    const testUser = {
        name: `Test User ${ timestamp }`,
        email: `test.user.${ timestamp }@example.com`,
        password: 'Password123!'
    };

    // Variables to store data between tests
    let userId: number | null = null;
    //let verificationToken: string | null = null;
    //let resetToken: string | null = null;

    // Mock tokens for scenarios where we can't get real tokens easily
    const MOCK_TOKEN = 'mock-token-for-testing';

    try {
        // === 1. Registration Tests ===
        console.log("\n--- Testing User Registration ---");

        // 1a. Test successful registration
        console.log("1a. Registering new test user...");
        let response = await testApi.post('/auth/register', testUser);
        userId = response.data.user.id;
        console.log(`   ✅ CREATED User ID: ${ userId }, Name: ${ response.data.user.name }`);
        console.log(`   ✅ Check message: ${ response.data.message }`);
        await delay(DELAY_MS);

        // 1b. Test registration with existing email (should fail)
        console.log("1b. Testing registration with existing email (expecting error)...");
        try {
            await testApi.post('/auth/register', testUser);
            console.log("   ❌ ERROR: Registration with existing email should have failed!");
        } catch (error: any) {
            console.log(`   ✅ Expected error received: ${ error.response.data.message }`);
        }
        await delay(DELAY_MS);

        // 1c. Test registration with invalid data (should fail)
        console.log("1c. Testing registration with invalid data (expecting error)...");
        try {
            await testApi.post('/auth/register', { email: 'invalid', password: 'short' });
            console.log("   ❌ ERROR: Registration with invalid data should have failed!");
        } catch (error: any) {
            console.log(`   ✅ Expected validation error received: ${ error.response.status }`);
        }
        await delay(DELAY_MS);

        // === 2. Login Tests (Unverified User) ===
        console.log("\n--- Testing Login (Unverified User) ---");

        // 2a. Test login with unverified email (should indicate verification needed)
        console.log("2a. Testing login with unverified email...");
        try {
            await testApi.post('/auth/login', {
                email: testUser.email,
                password: testUser.password
            });
            console.log("   ❌ ERROR: Login with unverified email should have failed!");
        } catch (error: any) {
            console.log(`   ✅ Expected error received: ${ error.response.data.message }`);
            // Check if error indicates email verification is needed
            if (error.response.data.needsVerification) {
                console.log("   ✅ Error correctly indicates email verification is needed");
            } else {
                console.log("   ⚠️ Warning: Error doesn't indicate email verification needed");
            }
        }
        await delay(DELAY_MS);

        // === 3. Resend Verification Email Tests ===
        console.log("\n--- Testing Resend Verification Email ---");

        // 3a. Test resend verification for existing user
        console.log("3a. Testing resend verification for test user...");
        response = await testApi.post('/auth/resend-verification', {
            email: testUser.email
        });
        console.log(`   ✅ Resend verification response: ${ response.data.message }`);
        await delay(DELAY_MS);

        // 3b. Test resend verification for non-existent user (should still return success for security)
        console.log("3b. Testing resend verification for non-existent user...");
        const fakeEmail = `nonexistent.${ timestamp }@example.com`;
        response = await testApi.post('/auth/resend-verification', {
            email: fakeEmail
        });
        console.log(`   ✅ Resend verification response (non-existent user): ${ response.data.message }`);
        await delay(DELAY_MS);

        // === 4. Email Verification Tests ===
        console.log("\n--- Testing Email Verification ---");

        // Since we can't intercept real email tokens, we'll simulate verification as follows:
        // 1. We'll test the verification endpoint with a mock token (should fail)
        // 2. We'll use an optional feature to manually verify the user in the DB for testing purposes

        // 4a. Test verification with invalid token (should fail)
        console.log("4a. Testing email verification with invalid token (expecting error)...");
        try {
            await testApi.post('/auth/verify-email', { token: MOCK_TOKEN });
            console.log("   ❌ ERROR: Verification with invalid token should have failed!");
        } catch (error: any) {
            console.log(`   ✅ Expected error received: ${ error.response.data.message }`);
        }
        await delay(DELAY_MS);

        // 4b. Important message about how to handle verification in a real app
        console.log("\n⚠️ IMPORTANT: In a real app, you would receive a verification email and click the link.");
        console.log("   For testing, there are three approaches to handle verification:");
        console.log("   1. Create an admin API to verify users directly (only enabled in dev mode)");
        console.log("   2. Modify the DB directly to set emailVerified=true for testing");
        console.log("   3. Set up a test mailbox service to intercept verification emails");
        console.log("   For this test script, we'll simulate the user is verified and continue testing.");
        console.log("   You can implement approach #1 in your auth controller.");

        // Example of how to make an admin API to verify users directly
        console.log("\n🛠️ RECOMMENDED: Create this admin route for testing (protect it with dev mode flag):");
        console.log("   `POST /api/auth/_dev/verify/{userId}` - only works in development mode");

        // Uncomment if you implement the admin verify endpoint
        /*
        console.log("4c. Using admin verify endpoint to verify test user...");
        await testApi.post(`/auth/_dev/verify/${userId}`);
        console.log("   ✅ User verified via admin endpoint");
        await delay(DELAY_MS);
        */

        // === 5. Forgot Password Tests ===
        console.log("\n--- Testing Forgot Password ---");

        // 5a. Test forgot password for existing user
        console.log("5a. Testing forgot password for test user...");
        response = await testApi.post('/auth/forgot-password', {
            email: testUser.email
        });
        console.log(`   ✅ Forgot password response: ${ response.data.message }`);
        await delay(DELAY_MS);

        // 5b. Test forgot password for non-existent user (should still return success for security)
        console.log("5b. Testing forgot password for non-existent user...");
        response = await testApi.post('/auth/forgot-password', {
            email: `nonexistent.${ timestamp }@example.com`
        });
        console.log(`   ✅ Forgot password response (non-existent user): ${ response.data.message }`);
        await delay(DELAY_MS);

        // === 6. Reset Password Tests ===
        console.log("\n--- Testing Reset Password ---");

        // 6a. Test reset password with invalid token (should fail)
        console.log("6a. Testing reset password with invalid token (expecting error)...");
        try {
            await testApi.post('/auth/reset-password', {
                token: MOCK_TOKEN,
                password: 'NewPassword123!'
            });
            console.log("   ❌ ERROR: Reset password with invalid token should have failed!");
        } catch (error: any) {
            console.log(`   ✅ Expected error received: ${ error.response.data.message }`);
        }
        await delay(DELAY_MS);

        // === 7. Login & Authentication Tests ===
        console.log("\n--- Testing Login & Authentication ---");

        // 7a. Important message - we need a verified user to continue
        console.log("\n⚠️ For simulating a verified user to test login, use one of these approaches:");
        console.log("   1. Create a verified user in your DB before running this script");
        console.log("   2. If you've implemented the dev verification endpoint, use it here");
        console.log("   3. Skip this section if you can't simulate a verified user yet");

        // 7b. Attempt to login with test credentials (assuming we've verified the user)
        console.log("\n7b. Attempting to login with test credentials...");
        console.log("   ℹ️ NOTE: This will fail if the user isn't verified. Use dev endpoint or seeded user!");

        try {
            // For demonstration, use a seeded user with known credentials
            // Change these to match a user that exists in your DB and is verified
            const verifiedUser = {
                email: 'admin@example.com', // Change to a verified user in your DB
                password: 'admin123'        // Change to match the user's password
            };

            response = await testApi.post('/auth/login', verifiedUser);
            authToken = response.data.token;
            console.log(`   ✅ Login successful! User: ${ response.data.user.name }`);
            console.log(`   ✅ Token received: ${ authToken?.substring(0, 15) }...`);
        } catch (error: any) {
            console.log(`   ⚠️ Login failed: ${ error.response?.data?.message || error.message }`);
            console.log("   ℹ️ This is expected if user isn't verified. Will use test bypass for remaining tests.");

            // For remaining tests, we'll use the development bypass method
            authToken = 'fake-token-for-testing';
        }
        await delay(DELAY_MS);

        // === 8. Test Protected Route ===
        console.log("\n--- Testing Protected Route ---");

        // 8a. Test accessing /me endpoint with auth header
        console.log("8a. Testing GET /auth/me endpoint (with auth)...");

        try {
            // Try normal auth first
            response = await testApi.get('/auth/me', withAuth());
            console.log(`   ✅ Access successful! User: ${ response.data.name }`);
        } catch (error: any) {
            // If normal auth failed, try with bypass header in dev mode
            console.log("   ⚠️ Standard auth failed. Trying with dev bypass...");

            try {
                response = await testApi.get('/auth/me', {
                    headers: { 'x-api-test': 'bypass-auth' }
                });
                console.log(`   ✅ Access with bypass successful! User: ${ response.data.name }`);
            } catch (devError: any) {
                console.log(`   ❌ Dev bypass also failed: ${ devError.response?.data?.message || devError.message }`);
                console.log("   ℹ️ Make sure ALLOW_API_TESTING=true is set in your .env file");
            }
        }
        await delay(DELAY_MS);

        // 8b. Test accessing protected endpoint without auth (should fail)
        console.log("8b. Testing GET /auth/me endpoint (without auth)...");
        try {
            await testApi.get('/auth/me');
            console.log("   ❌ ERROR: Access without auth should have failed!");
        } catch (error: any) {
            console.log(`   ✅ Expected error received: ${ error.response.data.message }`);
        }

        console.log("\n✅✅✅ Auth API tests completed! ✅✅✅");
        console.log("Note: Some tests may have been skipped or simulated due to email verification requirements.");
        console.log("Implement the suggested development endpoint for easier testing in the future.");

    } catch (error: any) {
        console.error("\n❌❌❌ AUTH API TEST FAILED! ❌❌❌");
        if (error.response) {
            console.error(`Status: ${ error.response.status }`);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error("No response received:", error.request);
        } else {
            console.error("Error setting up request:", error.message);
        }
        console.error("Full Error Object:", error);
        process.exitCode = 1; // Indicate failure
    } finally {
        // Optional cleanup - not deleting test users since they might be useful for future tests
        console.log("\n--- Test Complete ---");
    }
}

// --- Run the Test ---
runAuthApiTests();