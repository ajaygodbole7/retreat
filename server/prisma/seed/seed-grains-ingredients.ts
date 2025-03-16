import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { StorageType } from "./types";

const prisma = new PrismaClient();

export async function seedGrainsIngredients() {
    console.log("Seeding Grains & Dry Goods ingredients from CSV...");

    try {
        // Read CSV file
        const csvFilePath = path.resolve(__dirname, "../../data/IngredientsGrainsDryGoods.csv");
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

        // Filter out rows with empty first column (Name) - now with proper typing
        const validRecords = records.filter((row: string[]) => row[0] && row[0].trim() !== "");

        console.log(`Found ${records.length} total records in CSV file.`);
        console.log(`Found ${validRecords.length} valid records with non-empty names.`);

        if (validRecords.length > 0) {
            console.log("First valid record:", validRecords[0]);
        }

        // Find Grains & Dry Goods category
        const category = await prisma.ingredientCategory.findFirst({
            where: { name: "Grains & Dry Goods" },
        });

        if (!category) {
            console.error("Category 'Grains & Dry Goods' not found. Please run category seeding first.");
            return [];
        }
        console.log("Found category:", category.name, "with ID:", category.id);

        // Find Kilogram unit
        const defaultUnit = await prisma.unitOfMeasure.findFirst({
            where: { name: "Kilogram" },
        });

        if (!defaultUnit) {
            console.error("Default unit 'Kilogram' not found. Please run unit seeding first.");
            return [];
        }
        console.log("Found unit:", defaultUnit.name, "with ID:", defaultUnit.id);

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
                        defaultUnitId: defaultUnit.id,
                        isPerishable: false,
                        storageType: StorageType.DRY_STORAGE,
                        shelfLifeDays: 365, // Default 1 year for dry goods
                        storageInstructions: "Store in a cool, dry place in airtight containers.",
                        isLocal: false,
                        isOrganic: false,
                        isSeasonalItem: false,
                        hasVariablePrice: true,
                        isCommonAllergen: false,
                        isSpecialOrder: false,
                    },
                });

                createdIngredients.push(ingredient.name);
                console.log(`Created ingredient: ${ingredient.name}${subcategoryId ? ' with subcategory' : ''}`);
            } catch (error) {
                console.error(`Error creating ingredient '${name}':`, error);
                skippedIngredients.push(name);
            }
        }

        console.log(`Successfully seeded ${createdIngredients.length} Grains & Dry Goods ingredients.`);
        if (skippedIngredients.length > 0) {
            console.log(`Skipped ${skippedIngredients.length} ingredients due to errors or duplicates.`);
        }

        return createdIngredients;
    } catch (error) {
        console.error("Error seeding Grains & Dry Goods ingredients:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Execute the seed function if this script is run directly
if (require.main === module) {
    seedGrainsIngredients()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        });
}