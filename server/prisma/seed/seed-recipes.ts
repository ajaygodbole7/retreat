import { PrismaClient, Ingredient, UnitOfMeasure } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// --- Configuration ---
const CSV_FILE_NAME = '../../data/bg2-3-pranam-recipes.csv';
const DEFAULT_CATEGORY_NAME = 'Uncategorized';

// --- Helper Types ---
interface ParsedIngredientData {
    name: string;
    quantity: number | null; // null for "to taste" 
    unitAbbr: string | null; // null when no unit specified
    rowNum: number;
}

interface ParsedStepData {
    number: number;
    instruction: string;
    rowNum: number;
}

interface ParsedRecipe {
    name: string;
    ingredients: ParsedIngredientData[];
    steps: ParsedStepData[];
    startRowNum: number;
    notes?: string; // Added for Reference field
}

interface UpsertResult {
    skipped: boolean;
    created: boolean;
    error: boolean;
}

// --- Helper: Function to Upsert a Single Recipe ---
async function upsertRecipeInTransaction(
    tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
    recipeData: ParsedRecipe,
    unitsMap: Map<string, UnitOfMeasure>,
    ingredientsMap: Map<string, Ingredient>,
    defaultUnit: UnitOfMeasure
): Promise<UpsertResult> {
    console.log(`   -> Preparing DB data for "${ recipeData.name }"...`);

    try {
        // --- Prepare Nested Data ---
        const ingredientsToCreate = recipeData.ingredients.map((ingData, index) => {
            const ingredient = ingredientsMap.get(ingData.name.toLowerCase());
            if (!ingredient) {
                throw new Error(`❌ Internal Error: Pre-lookup failed for ingredient ${ ingData.name } in recipe "${ recipeData.name }"`);
            }

            // Handle "to taste" ingredients or those without units
            if (ingData.quantity === null || ingData.unitAbbr === null) {
                return {
                    ingredientId: ingredient.id,
                    quantity: ingData.quantity ?? 0, // Default to 0 if null
                    unitId: ingredient.defaultUnitId, // Use ingredient's default unit
                    displayOrder: index + 1,
                    notes: ingData.quantity === null ? "to taste" : undefined
                };
            }

            // Normal ingredients with quantity and unit
            const unit = unitsMap.get(ingData.unitAbbr.toLowerCase());
            if (!unit) {
                console.log(`   -> Using default unit for "${ ingData.name }" (unit "${ ingData.unitAbbr }" not found)`);
                return {
                    ingredientId: ingredient.id,
                    quantity: ingData.quantity,
                    unitId: defaultUnit.id,
                    displayOrder: index + 1
                };
            }

            return {
                ingredientId: ingredient.id,
                quantity: ingData.quantity,
                unitId: unit.id,
                displayOrder: index + 1
            };
        });

        const stepsToCreate = recipeData.steps
            .sort((a, b) => a.number - b.number)
            .map(s => ({ stepNumber: s.number, instruction: s.instruction }));

        // --- Perform Upsert ---
        const description = `NA`;
        const upserted = await tx.recipe.upsert({
            where: { name: recipeData.name }, // Assumes name is unique
            update: {
                description: description,
                notes: recipeData.notes, // Add notes to update
                // Only update minimal fields
            },
            create: {
                name: recipeData.name,
                description: description,
                servingSize: 8,
                hasOnionGarlic: false,
                createdBy: 'csv',
                lastUpdatedBy: 'csv',
                notes: recipeData.notes, // Add notes to create
                //courseType: 'MAIN_COURSE', // Default to MAIN_COURSE for all recipes

                recipeIngredients: { create: ingredientsToCreate },
                steps: { create: stepsToCreate },
            }
        });

        const wasCreated = upserted.createdAt.toISOString() === upserted.updatedAt.toISOString();
        console.log(`     -> ${ wasCreated ? '✅ Created' : '☑️ Updated' } Recipe ID: ${ upserted.id }`);

        return { skipped: false, created: wasCreated, error: false };
    } catch (error) {
        console.error(`   -> ❌ Error upserting recipe "${ recipeData.name }":`, error);
        return { skipped: true, created: false, error: true };
    }
}

// --- Main Seeding Function ---
async function main() {
    console.log(`🚀 Starting recipe seeding from ${ CSV_FILE_NAME }...`);
    const csvFilePath = path.resolve(__dirname, CSV_FILE_NAME);
    const parsedRecipes: ParsedRecipe[] = [];

    // --- 1. Read and Parse CSV ---
    try {
        console.log(`📄 Reading CSV file: ${ csvFilePath }`);
        if (!fs.existsSync(csvFilePath)) throw new Error(`CSV file not found: ${ csvFilePath }`);
        const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
        const records: string[][] = parse(fileContent, { bom: true, skip_empty_lines: true, relax_column_count: true });
        console.log(`📊 Parsed ${ records.length } non-empty rows.`);

        // Debug: Print first few rows to understand structure
        console.log("📋 CSV Structure Sample (first 10 rows):");
        for (let i = 0; i < Math.min(10, records.length); i++) {
            console.log(`Row ${ i + 1 }: ${ JSON.stringify(records[i]) }`);
        }

        let currentRecipe: ParsedRecipe | null = null;
        let currentSection: 'none' | 'ingredients' | 'steps' = 'none';
        let stepCounter = 1;

        // Parse the CSV according to the specified format
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const rowNum = i + 1;

            // Skip empty rows
            if (!record || record.length === 0 || record.every(cell => !cell || cell.trim() === '')) {
                continue;
            }

            const cells = record.map(c => c?.trim() ?? '');
            const firstCell = cells[0] || '';

            // Check for recipe reference - based on the sample CSV format
            if (firstCell.toLowerCase().includes('recipe') && firstCell.toLowerCase().includes('reference')) {
                if (currentRecipe) {
                    const reference = cells[1] || '';
                    currentRecipe.notes = reference;
                    console.log(`Found reference for "${ currentRecipe.name }": ${ reference }`);
                }
                continue;
            }

            // Check for new recipe - using substring matching
            else if (firstCell.toLowerCase().includes('recipe')) {
                // Save previous recipe if it exists
                if (currentRecipe && (currentRecipe.ingredients.length > 0 || currentRecipe.steps.length > 0)) {
                    console.log(`Saving completed recipe: "${ currentRecipe.name }" with ${ currentRecipe.ingredients.length } ingredients and ${ currentRecipe.steps.length } steps`);
                    parsedRecipes.push(currentRecipe);
                }

                // Extract recipe name from second column
                const recipeName = cells[1] || 'Unnamed Recipe';
                currentRecipe = {
                    name: recipeName,
                    ingredients: [],
                    steps: [],
                    startRowNum: rowNum
                };
                currentSection = 'none';
                stepCounter = 1;
                console.log(`>> Found new recipe: "${ recipeName }" (Row ${ rowNum })`);
                continue;
            }

            // Check for reference - alternative format
            else if (firstCell.toLowerCase().includes('reference')) {
                if (currentRecipe) {
                    const reference = cells[1] || '';
                    currentRecipe.notes = reference;
                    console.log(`Found reference for "${ currentRecipe.name }": ${ reference }`);
                }
                continue;
            }

            // Check for ingredients section - using substring matching
            else if (firstCell.toLowerCase().includes('ingredient')) {
                if (currentRecipe) {
                    currentSection = 'ingredients';
                    console.log(`Found ingredients section for "${ currentRecipe.name }" at row ${ rowNum }`);
                }
                continue;
            }

            // Check for steps section - using substring matching
            else if (firstCell.toLowerCase().includes('steps')) {
                if (currentRecipe) {
                    currentSection = 'steps';
                    console.log(`Found steps section for "${ currentRecipe.name }" at row ${ rowNum }`);
                }
                continue;
            }

            // Process current row based on section
            if (currentRecipe) {
                if (currentSection === 'ingredients') {
                    // Parse ingredient based on the actual CSV structure
                    let quantity: number | null = null;
                    let name: string | undefined;
                    let unit: string | null = null;

                    // Check if first cell is empty and second cell has the ingredient name
                    if (firstCell === '' && cells[1]) {
                        // First column is empty, ingredient name is in second column
                        name = cells[1];

                        // Check for "to taste" in any column
                        const toTasteIndex = cells.findIndex(cell =>
                            cell.toLowerCase().includes('to taste') ||
                            cell.toLowerCase() === 'as needed'
                        );

                        if (toTasteIndex !== -1) {
                            // This is a "to taste" ingredient
                            quantity = null;
                            console.log(`  Adding ingredient: ${ name } (to taste)`);
                        } else {
                            // Try to find quantity in other columns
                            for (let j = 0; j < cells.length; j++) {
                                if (j !== 1) { // Skip the name column
                                    const parsed = parseFloat(cells[j]);
                                    if (!isNaN(parsed)) {
                                        quantity = parsed;
                                        // If we found quantity, check next column for unit
                                        if (j + 1 < cells.length && cells[j + 1] && isNaN(parseFloat(cells[j + 1]))) {
                                            unit = cells[j + 1];
                                        }
                                        break;
                                    }
                                }
                            }

                            // If no quantity found, default to 1
                            if (quantity === null) {
                                quantity = 1;
                                console.log(`  Warning: No quantity found for "${ name }", defaulting to 1`);
                            }
                        }
                    } else {
                        // Try standard format: [quantity, name, unit]
                        const parsedQuantity = parseFloat(firstCell);
                        name = cells[1];

                        if (firstCell.toLowerCase().includes('to taste') ||
                            cells.some(c => c.toLowerCase().includes('to taste'))) {
                            // This is a "to taste" ingredient
                            quantity = null;
                            console.log(`  Adding ingredient: ${ name } (to taste)`);
                        } else if (!isNaN(parsedQuantity)) {
                            // Normal quantity
                            quantity = parsedQuantity;
                            unit = cells[2] || null;
                        } else {
                            // Try to find quantity elsewhere
                            for (let j = 0; j < cells.length; j++) {
                                if (j !== 1) { // Skip what we think is the name
                                    const parsed = parseFloat(cells[j]);
                                    if (!isNaN(parsed)) {
                                        quantity = parsed;
                                        // Check next column for unit
                                        if (j + 1 < cells.length && cells[j + 1] && isNaN(parseFloat(cells[j + 1]))) {
                                            unit = cells[j + 1];
                                        }
                                        break;
                                    }
                                }
                            }

                            // If still no quantity, default to 1
                            if (quantity === null) {
                                quantity = 1;
                                console.log(`  Warning: No quantity found for "${ name }", defaulting to 1`);
                            }
                        }
                    }

                    // Add ingredient if we have a name
                    if (name) {
                        console.log(`  Adding ingredient: ${ name } (${ quantity === null ? 'to taste' : quantity } ${ unit || 'no unit' })`);
                        currentRecipe.ingredients.push({
                            name,
                            quantity,
                            unitAbbr: unit,
                            rowNum
                        });
                    } else {
                        console.warn(`Warn: Row ${ rowNum } - Invalid ingredient data: ${ JSON.stringify(cells) }`);
                    }
                } else if (currentSection === 'steps') {
                    // Parse step: number, instruction
                    let stepNumber = stepCounter;
                    let instruction = '';

                    if (/^\d+$/.test(firstCell)) {
                        // If first cell is a number, use it as step number
                        stepNumber = parseInt(firstCell, 10);
                        instruction = cells.slice(1).filter(Boolean).join(' ');
                    } else {
                        // Otherwise use the whole row as instruction
                        instruction = cells.filter(Boolean).join(' ');
                    }

                    if (instruction) {
                        console.log(`  Adding step ${ stepNumber }: ${ instruction.substring(0, 30) }...`);
                        currentRecipe.steps.push({
                            number: stepNumber,
                            instruction,
                            rowNum
                        });
                        stepCounter = stepNumber + 1;
                    }
                }
            }
        }

        // Don't forget the last recipe
        if (currentRecipe && (currentRecipe.ingredients.length > 0 || currentRecipe.steps.length > 0)) {
            console.log(`Saving final recipe: "${ currentRecipe.name }" with ${ currentRecipe.ingredients.length } ingredients and ${ currentRecipe.steps.length } steps`);
            parsedRecipes.push(currentRecipe);
        }

        if (parsedRecipes.length === 0) throw new Error("❌ No valid recipes extracted from CSV.");
        console.log(`✅ CSV Parsed: Extracted data for ${ parsedRecipes.length } recipes.`);

    } catch (error) {
        console.error('❌ Error reading/parsing CSV:', error);
        await prisma.$disconnect();
        throw error;
    }

    // --- 2. Database Operations ---
    console.log(`⚙️ Starting database transaction for ${ parsedRecipes.length } recipes...`);
    let totalRecipesUpserted = 0;
    let totalRecipesCreated = 0;
    let totalRecipesSkippedOrError = 0;
    let totalNewIngredientsCreated = 0;

    try {
        // First, find a default unit to use when no unit is specified
        console.log(`🔍 Looking for a default unit to use...`);
        const defaultUnit = await prisma.unitOfMeasure.findFirst();

        if (!defaultUnit) {
            throw new Error(`❌ No units found in the database. Please create at least one unit before running this script.`);
        }

        console.log(`✅ Using "${ defaultUnit.name }" (${ defaultUnit.abbreviation }) as default unit when none is specified.`);

        // Process recipes in smaller batches to avoid transaction timeout
        const BATCH_SIZE = 10;
        const recipeBatches = [];

        for (let i = 0; i < parsedRecipes.length; i += BATCH_SIZE) {
            recipeBatches.push(parsedRecipes.slice(i, i + BATCH_SIZE));
        }

        console.log(`🔄 Processing ${ recipeBatches.length } batches of recipes (max ${ BATCH_SIZE } per batch)`);

        for (let batchIndex = 0; batchIndex < recipeBatches.length; batchIndex++) {
            const batch = recipeBatches[batchIndex];
            console.log(`\n🔄 Processing batch ${ batchIndex + 1 }/${ recipeBatches.length } with ${ batch.length } recipes...`);

            await prisma.$transaction(async (tx) => {
                // Get/Create Default Category Once
                let defaultCategory = await tx.ingredientCategory.findUnique({ where: { name: DEFAULT_CATEGORY_NAME } });
                if (!defaultCategory) {
                    defaultCategory = await tx.ingredientCategory.create({
                        data: { name: DEFAULT_CATEGORY_NAME, displayOrder: 999 }
                    });
                    console.log(`❕ Created default category`);
                }

                // Gather ALL unique Units and Ingredients needed for this batch
                const allNeededUnitAbbrs = new Set<string>();
                const allNeededIngredientNames = new Set<string>();

                batch.forEach(r => r.ingredients.forEach(i => {
                    if (i.unitAbbr) {
                        allNeededUnitAbbrs.add(i.unitAbbr.toLowerCase());
                    }
                    allNeededIngredientNames.add(i.name.toLowerCase());
                }));

                // Look up ALL Units Once
                const unitsMap = new Map<string, UnitOfMeasure>();
                console.log(`🔍 Looking up ${ allNeededUnitAbbrs.size } unique Units...`);

                // Add default unit to the map
                unitsMap.set(defaultUnit.abbreviation.toLowerCase(), defaultUnit);

                for (const abbr of allNeededUnitAbbrs) {
                    // Skip if it's the default unit we already added
                    if (abbr.toLowerCase() === defaultUnit.abbreviation.toLowerCase()) continue;

                    let u = await tx.unitOfMeasure.findFirst({
                        where: { abbreviation: { equals: abbr, mode: 'insensitive' } }
                    });

                    if (!u) {
                        // Try common unit abbreviation mappings
                        if (abbr === 'tbs')
                            u = await tx.unitOfMeasure.findFirst({
                                where: { abbreviation: { equals: 'tbsp', mode: 'insensitive' } }
                            });
                        else if (abbr === 'tsp')
                            u = await tx.unitOfMeasure.findFirst({
                                where: { abbreviation: { equals: 'tsp', mode: 'insensitive' } }
                            });
                        else if (abbr === 'g')
                            u = await tx.unitOfMeasure.findFirst({
                                where: {
                                    OR: [
                                        { abbreviation: { equals: 'g', mode: 'insensitive' } },
                                        { name: { equals: 'gram', mode: 'insensitive' } }
                                    ]
                                }
                            });
                        else if (abbr === 'pieces' || abbr === 'piece')
                            u = await tx.unitOfMeasure.findFirst({
                                where: {
                                    OR: [
                                        { abbreviation: { equals: 'piece', mode: 'insensitive' } },
                                        { name: { equals: 'Count', mode: 'insensitive' } }
                                    ]
                                }
                            });
                    }

                    if (u) {
                        unitsMap.set(abbr.toLowerCase(), u);
                    } else {
                        console.log(`⚠️ Unit "${ abbr }" not found, will use default unit instead.`);
                    }
                }
                console.log(`✅ All required Units found.`);

                // Look up or Create ALL Ingredients Once
                const ingredientsMap = new Map<string, Ingredient>();
                console.log(`🔍 Looking up/Creating ${ allNeededIngredientNames.size } unique Ingredients...`);
                let batchCreatedIngredientCount = 0;

                for (const name of allNeededIngredientNames) {
                    const lowerCaseName = name.toLowerCase();
                    let ingredient = await tx.ingredient.findFirst({
                        where: { name: { mode: 'insensitive', equals: name } }
                    });

                    if (!ingredient) {
                        // Find a default unit for this ingredient
                        let ingredientUnit: UnitOfMeasure | null = null;

                        for (const r of batch) {
                            const occ = r.ingredients.find(i => i.name.toLowerCase() === lowerCaseName);
                            if (occ && occ.unitAbbr) {
                                ingredientUnit = unitsMap.get(occ.unitAbbr.toLowerCase()) ?? null;
                                if (ingredientUnit) break;
                            }
                        }

                        // Use the default unit if no specific unit found
                        if (!ingredientUnit) {
                            ingredientUnit = defaultUnit;
                        }

                        ingredient = await tx.ingredient.create({
                            data: {
                                name: name,
                                categoryId: defaultCategory!.id,
                                defaultUnitId: ingredientUnit.id,
                                // Only include mandatory fields
                                storageType: 'ROOM_TEMPERATURE',
                                description: `Auto-created from CSV import`
                            }
                        });
                        batchCreatedIngredientCount++;
                    }
                    ingredientsMap.set(lowerCaseName, ingredient);
                }

                totalNewIngredientsCreated += batchCreatedIngredientCount;
                console.log(`✅ All required Ingredients found or created (${ batchCreatedIngredientCount } new).`);

                // Upsert each recipe in this batch
                console.log(`💾 Upserting ${ batch.length } Recipe records...`);

                for (let i = 0; i < batch.length; i++) {
                    const recipeData = batch[i];

                    if (!recipeData || (!recipeData.ingredients.length && !recipeData.steps.length)) {
                        console.warn(`⚠️ Skipping "${ recipeData?.name }" (empty).`);
                        totalRecipesSkippedOrError++;
                        continue;
                    }

                    console.log(` -> Processing "${ recipeData.name }"...`);
                    try {
                        const result = await upsertRecipeInTransaction(
                            tx,
                            recipeData,
                            unitsMap,
                            ingredientsMap,
                            defaultUnit
                        );

                        totalRecipesUpserted++;
                        if (result.created) totalRecipesCreated++;
                        if (result.error) totalRecipesSkippedOrError++;
                    } catch (recipeError) {
                        console.error(`❌ Error processing recipe "${ recipeData.name }" within transaction:`, recipeError);
                        totalRecipesSkippedOrError++;
                    }
                }
            }, { timeout: 60000 }); // 60 second timeout per batch
        }

        console.log(`\n✅ Database operations complete.`);
        console.log(`   Total Recipes Upserted Attempted: ${ totalRecipesUpserted }`);
        console.log(`   Recipes Newly Created:            ${ totalRecipesCreated }`);
        console.log(`   Recipes Skipped/Errored:          ${ totalRecipesSkippedOrError }`);
        console.log(`   Total New Ingredients Created:    ${ totalNewIngredientsCreated }`);

    } catch (error) {
        console.error('❌ Top-level error during seeding:', error);
        process.exit(1);
    } finally {
        console.log('🔌 Disconnecting Prisma Client...');
        await prisma.$disconnect();
    }
}

// --- Run ---
main()
    .then(() => console.log(`🏁 Seeding script finished.`))
    .catch((e) => { console.error('💥 Unhandled error:', e); process.exit(1); })
    .finally(async () => await prisma.$disconnect());