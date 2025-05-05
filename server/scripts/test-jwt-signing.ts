// scripts/test-jwt-signing.ts

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Load environment variables FIRST
dotenv.config();

// IMPORTANT: Import your function AFTER dotenv.config() ensures process.env is populated
import { generateToken } from '../src/utils/auth-utils'; // Adjust path if necessary

console.log("🚀 Starting JWT Signing Test Script...");

// Define a sample user ID for testing
const testUserId = 123;
console.log(`🧪 Using test user ID: ${ testUserId }`);

// Get the JWT_SECRET directly from environment for verification
// This ensures we test against the actual secret the app uses.
const secretForVerification = process.env.JWT_SECRET;

// CRITICAL: Check if the secret was loaded in *this* script's environment
if (!secretForVerification) {
    console.error("❌ FATAL ERROR: JWT_SECRET not found in environment variables.");
    console.error("   Ensure the .env file exists in the project root and contains JWT_SECRET.");
    console.error("   Ensure dotenv.config() was called before this check.");
    process.exit(1); // Exit with error code
}
console.log("🔑 JWT_SECRET loaded successfully for verification.");

try {
    // Generate the token using the function from auth-utils
    console.log(`⚙️ Calling generateToken for user ID ${ testUserId }...`);
    const generatedToken = generateToken(testUserId); // generateToken itself relies on process.env.JWT_SECRET internally

    if (!generatedToken || typeof generatedToken !== 'string' || generatedToken.length === 0) {
        throw new Error("generateToken did not return a valid token string.");
    }
    console.log(`✅ Token generated successfully (length: ${ generatedToken.length }), first 15 chars: ${ generatedToken.substring(0, 15) }...`);

    // Verify the generated token using the same secret loaded by this script
    console.log("🔎 Verifying the generated token using the loaded JWT_SECRET...");
    // jwt.verify will throw an error if verification fails (invalid signature, expired, etc.)
    const decodedPayload = jwt.verify(generatedToken, secretForVerification);

    console.log("✅ Token verified successfully!");

    // Check the decoded payload content
    console.log("🔬 Checking decoded payload content...");
    if (typeof decodedPayload === 'object' && decodedPayload !== null && 'id' in decodedPayload) {
        // --- FIX: Explicitly convert decodedPayload.id to Number for comparison ---
        const decodedId = Number(decodedPayload.id);

        if (isNaN(decodedId)) {
            throw new Error(`Decoded payload ID is not a number: ${ decodedPayload.id }`);
        }

        if (decodedId === testUserId) { // Compare number to number
            console.log(`✅ Decoded payload contains correct user ID: ${ decodedId } (Type: ${ typeof decodedId })`);
        } else {
            // This comparison is crucial
            throw new Error(`Decoded payload user ID (${ decodedId }) does not match expected ID (${ testUserId }).`);
        }
        // --- END FIX ---

        // Check expiry ('exp' claim is in seconds since epoch)
        if ('exp' in decodedPayload && typeof decodedPayload.exp === 'number') {
            const expiryDate = new Date(decodedPayload.exp * 1000);
            console.log(`✅ Token expires at: ${ expiryDate.toISOString() } (UTC)`);
        } else {
            console.warn("⚠️ Decoded payload does not contain 'exp' (expiration time) field.");
        }
        // Check issued at ('iat' claim is in seconds since epoch)
        if ('iat' in decodedPayload && typeof decodedPayload.iat === 'number') {
            const issuedAtDate = new Date(decodedPayload.iat * 1000);
            console.log(`✅ Token issued at: ${ issuedAtDate.toISOString() } (UTC)`);
        } else {
            console.warn("⚠️ Decoded payload does not contain 'iat' (issued at time) field.");
        }

    } else {
        throw new Error("Decoded payload is not a valid object or does not contain 'id' field.");
    }

    console.log("\n✅✅✅ JWT Signing Test Passed! ✅✅✅");
    console.log("   The generateToken function successfully created a verifiable JWT using the environment secret.");

} catch (error: any) {
    console.error("\n❌❌❌ JWT Signing Test Failed! ❌❌❌");
    if (error instanceof jwt.JsonWebTokenError) {
        // Specific JWT errors
        console.error(`   JWT Verification Error: ${ error.message }`);
        if (error instanceof jwt.TokenExpiredError) {
            console.error(`   Expired At: ${ error.expiredAt }`);
        }
    } else {
        // Other unexpected errors during the test
        console.error(`   Unexpected Error: ${ error.message }`);
        console.error(error.stack); // Print stack trace for unexpected errors
    }
    console.error("   Troubleshooting Tips:");
    console.error("     - Ensure JWT_SECRET in .env is identical to the one used when the token was generated.");
    console.error("     - Check for typos or extra characters in the JWT_SECRET.");
    console.error("     - Ensure the token wasn't accidentally modified.");
    process.exit(1); // Exit with error code
}