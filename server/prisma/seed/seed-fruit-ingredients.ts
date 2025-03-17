import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { StorageType } from "./types";

const prisma = new PrismaClient();

export async function seedFruitIngredients() {
    console.log("Seeding Fruits ingredients from CSV...");

    try {
        // Read CSV file
        const csvFilePath = path.resolve(__dirname, "../../data/IngredientsFruit.csv");
        if (!fs.existsSync(csvFilePath)) {
            console.error(`CSV file not found at ${csvFilePath}`);
            return [];
        }

        const csvData = fs.readFileSync(csvFilePath, "utf8");

        // Parse CSV with explicit column names - don't use header row
        const records = parse(csvData, {
            from_line: 2, // Skip the header row
            skip_empty_lines: true,
            trim: true,
        }) as string[][];

        console.log("Raw parsed records:", records.slice(0, 3));

        // Filter out rows with empty first column (Name)
        const validRecords = records.filter((row: string[]) => row[0] && row[0].trim() !== "");

        console.log(`Found ${records.length} total records in CSV file.`);
        console.log(`Found ${validRecords.length} valid records with non-empty names.`);

        if (validRecords.length > 0) {
            console.log("First valid record:", validRecords[0]);
        }

        // Find Fruits category
        const category = await prisma.ingredientCategory.findFirst({
            where: { name: "Fruits" },
        });

        if (!category) {
            console.error("Category 'Fruits' not found. Please run category seeding first.");
            return [];
        }
        console.log("Found category:", category.name, "with ID:", category.id);

        // Find all units of measure for matching
        const allUnits = await prisma.unitOfMeasure.findMany();

        if (allUnits.length === 0) {
            console.error("No units of measure found. Please run unit seeding first.");
            return [];
        }
        console.log(`Found ${allUnits.length} units for matching.`);

        // Find all subcategories for matching
        const subcategories = await prisma.ingredientSubcategory.findMany({
            where: { categoryId: category.id },
        });
        console.log(`Found ${subcategories.length} subcategories for matching.`);

        // Create ingredients
        const createdIngredients = [];
        const skippedIngredients = [];

        for (const record of validRecords) {
            // Get values from array indices
            const name = record[0];
            const metricUnit = record[1] || null;
            //const usUnit = record[2] || null;
            const notes = record[3] || null;

            try {
                // Try to match subcategory based on ingredient name in subcategory description
                let subcategoryId = null;
                for (const subcategory of subcategories) {
                    if (subcategory.description &&
                        subcategory.description.toLowerCase().includes(name.trim().toLowerCase())) {
                        subcategoryId = subcategory.id;
                        console.log(`Matched ingredient '${name}' to subcategory '${subcategory.name}'`);
                        break;
                    }
                }

                // Find the appropriate unit based on Metric Units column
                let unitToUse = null;
                if (metricUnit) {
                    // Normalize unit name for comparison (trim whitespace, make lowercase)
                    const normalizedMetricUnit = metricUnit.trim().toLowerCase();

                    // Find matching unit in the database
                    unitToUse = allUnits.find(unit =>
                        unit.name.toLowerCase() === normalizedMetricUnit ||
                        unit.abbreviation?.toLowerCase() === normalizedMetricUnit
                    );

                    if (unitToUse) {
                        console.log(`Found matching unit '${unitToUse.name}' for Metric Unit '${metricUnit}'`);
                    } else {
                        console.log(`No exact match found for Metric unit '${metricUnit}', trying partial match...`);
                        // Try partial matching if exact match not found
                        unitToUse = allUnits.find(unit =>
                            normalizedMetricUnit.includes(unit.name.toLowerCase()) ||
                            (unit.abbreviation && normalizedMetricUnit.includes(unit.abbreviation.toLowerCase()))
                        );

                        if (unitToUse) {
                            console.log(`Found partial matching unit '${unitToUse.name}' for Metric unit '${metricUnit}'`);
                        }
                    }
                }

                // Fallback to default gram unit if no match found
                if (!unitToUse) {
                    unitToUse = allUnits.find(unit => unit.name.toLowerCase() === "gram");
                    if (unitToUse) {
                        console.log(`No matching unit found for '${metricUnit}', using default 'Gram' unit`);
                    } else {
                        throw new Error("Default 'Gram' unit not found in database");
                    }
                }

                // Check if ingredient already exists
                const existingIngredient = await prisma.ingredient.findFirst({
                    where: {
                        name: name.trim(),
                        categoryId: category.id
                    }
                });

                // If ingredient exists, skip it
                if (existingIngredient) {
                    console.log(`Ingredient '${name}' already exists, skipping.`);
                    skippedIngredients.push(name);
                    continue;
                }

                // Create new ingredient
                const ingredient = await prisma.ingredient.create({
                    data: {
                        name: name.trim(),
                        description: notes,
                        categoryId: category.id,
                        subcategoryId,
                        defaultUnitId: unitToUse.id,
                        isPerishable: true,
                        storageType: StorageType.FROZEN,
                        shelfLifeDays: 30, // 
                        storageInstructions: "Store in the freezer",
                        isLocal: true,
                        isOrganic: true,
                        isSeasonalItem: false,
                        hasVariablePrice: true,
                        isCommonAllergen: false,
                        isSpecialOrder: false,
                    },
                });

                createdIngredients.push(ingredient.name);
                console.log(`Created ingredient: ${ingredient.name} with unit ${unitToUse.name}${subcategoryId ? ' and subcategory' : ''}`);
            } catch (error) {
                console.error(`Error creating ingredient '${name}':`, error);
                skippedIngredients.push(name);
            }
        }

        console.log(`Successfully seeded ${createdIngredients.length} Fruits ingredients.`);
        if (skippedIngredients.length > 0) {
            console.log(`Skipped ${skippedIngredients.length} ingredients due to errors or duplicates.`);
        }

        return createdIngredients;
    } catch (error) {
        console.error("Error seeding Fruits ingredients:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Execute the seed function if this script is run directly
if (require.main === module) {
    seedFruitIngredients()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        });
}