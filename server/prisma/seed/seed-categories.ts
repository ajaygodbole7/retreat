import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Seed ingredient categories and subcategories for vegetarian cooking
 */
export async function seedCategories() {
    console.log("Seeding vegetarian ingredient categories and subcategories...")

    // Define main categories (adjusted for vegetarian focus and CSV data)
    const mainCategories = [
        {
            name: "Grains & Dry Goods",
            description: "Rice, beans, flours, and other dry goods",
            storeSection: "Dry Goods Aisle",
            displayOrder: 1,
        },
        {
            name: "Oil",
            description: "Cooking oils and plant-based fats",
            storeSection: "Oil & Vinegar Aisle",
            displayOrder: 2,
        },
        {
            name: "Spices (Dry)",
            description: "Herbs, spices, and seasonings in Powdered form",
            storeSection: "Spice Aisle",
            displayOrder: 3,
        },
        {
            name: "Vegetables",
            description: "Fresh vegetables",
            storeSection: "Produce Section",
            displayOrder: 4,
        },
        {
            name: "Dairy & Alternatives",
            description: "Dairy products and plant-based alternatives",
            storeSection: "Refrigerated Section",
            displayOrder: 5,
        },
        {
            name: "Frozen Vegetables",
            description: "Frozen vegetables",
            storeSection: "Produce Section",
            displayOrder: 6,
        },
        {
            name: "Ready to Eat",
            description: "Items that require no cooking, ready for immediate consumption",
            storeSection: "Various Sections",
            displayOrder: 7,
        },
        {
            name: "Fruits",
            description: "Fresh and dried fruits",
            storeSection: "Produce Section",
            displayOrder: 8,
        }, 
        {
            name: "Condiments",
            description: "Sauces, spreads, and condiments",
            storeSection: "Condiments Aisle",
            displayOrder: 9,
        },
        {
            name: "Beverages",
            description: "Coffee, tea, drinks and beverage ingredients",
            storeSection: "Beverage Aisle",
            displayOrder: 10,
        },
        {
            name: "Snacks & Desserts",
            description: "Vegetarian snacks, sweets, and dessert ingredients",
            storeSection: "Snack Aisle",
            displayOrder: 11,
        },

        {
            name: "Herbs",
            description: "Fresh and dried herbs",
            storeSection: "Produce Section",
            displayOrder: 12,
        },
        {
            name: "Nuts & Seeds",
            description: "Various nuts and seeds",
            storeSection: "Dry Goods Aisle",
            displayOrder: 13,
        },
    ]

    // Create categories and store them in a map
    const categoryMap = {}

    for (const categoryData of mainCategories) {
        // Check if category already exists
        let category = await prisma.ingredientCategory.findFirst({
            where: { name: categoryData.name },
        })

        if (!category) {
            category = await prisma.ingredientCategory.create({
                data: categoryData,
            })
        } else {
            // Update existing category
            category = await prisma.ingredientCategory.update({
                where: { category_id: category.category_id },
                data: categoryData,
            })
        }

        categoryMap[category.name] = category
    }

    // Define subcategories for each main category (adjusted for vegetarian focus)
    const subcategoryData = {
        "Grains & Dry Goods": [
            { name: "Rice", description: "Different varieties of rice", displayOrder: 1 },
            { name: "Beans & Legumes", description: "Beans, lentils, and other legumes", displayOrder: 2 },
            { name: "Flour", description: "Different types of flour", displayOrder: 3 },
            { name: "Pasta", description: "Pasta and noodles", displayOrder: 4 },
            { name: "Breakfast Cereals", description: "Ready-to-eat cereals", displayOrder: 7 },
            { name: "Baking Ingredients", description: "Ingredients used for baking", displayOrder: 8 },
        ],
        Oil: [
            { name: "Vegetable Oils", description: "Oils from plant sources", displayOrder: 1 },
            { name: "Nut & Seed Oils", description: "Specialty oils from nuts and seeds", displayOrder: 2 },
            { name: "Plant-Based Butters", description: "Vegan butter alternatives", displayOrder: 3 },
        ],
        Spices: [
            { name: "Whole Spices", description: "Unground spices", displayOrder: 1 },
            { name: "Ground Spices", description: "Ground spice powders", displayOrder: 2 },
            { name: "Spice Blends", description: "Pre-mixed spice combinations", displayOrder: 4 },
            { name: "Salt & Pepper", description: "Various salts and peppers", displayOrder: 5 },
            { name: "Sweeteners", description: "Sugar and other sweeteners", displayOrder: 6 },
        ],
        Vegetables: [
            { name: "Leafy Greens", description: "Spinach, kale, lettuce, etc.", displayOrder: 1 },
            { name: "Root Vegetables", description: "Potatoes, carrots, beets, etc.", displayOrder: 2 },
            { name: "Cruciferous", description: "Broccoli, cauliflower, cabbage, etc.", displayOrder: 3 },
            { name: "Alliums", description: "Onions, garlic, leeks, etc.", displayOrder: 4 },
            { name: "Squash & Gourds", description: "Pumpkins, zucchini, etc.", displayOrder: 5 },
            { name: "Nightshades", description: "Tomatoes, peppers, eggplant, etc.", displayOrder: 6 },
            { name: "Canned Vegetables", description: "Preserved vegetables", displayOrder: 7 },
            { name: "Mushrooms", description: "All varieties of edible fungi", displayOrder: 8 },
        ],
        Fruits: [
            { name: "Berries", description: "Strawberries, blueberries, etc.", displayOrder: 1 },
            { name: "Citrus", description: "Oranges, lemons, limes, etc.", displayOrder: 2 },
            { name: "Tropical", description: "Bananas, mangoes, pineapples, etc.", displayOrder: 3 },
            { name: "Stone Fruits", description: "Peaches, plums, cherries, etc.", displayOrder: 4 },
            { name: "Pome Fruits", description: "Apples, pears, etc.", displayOrder: 5 },
            { name: "Melons", description: "Watermelon, cantaloupe, etc.", displayOrder: 6 },
        ],
        "Dairy & Alternatives": [
            { name: "Milk & Plant Milks", description: "Dairy milk and plant-based alternatives", displayOrder: 1 },
            { name: "Cheese & Vegan Cheese", description: "Dairy cheese and plant-based alternatives", displayOrder: 2 },
            { name: "Yogurt & Fermented", description: "Yogurt and fermented dairy/alternatives", displayOrder: 3 },
            { name: "Butter & Alternatives", description: "Butter, ghee, and plant-based alternatives", displayOrder: 4 },
            { name: "Eggs & Substitutes", description: "Eggs and egg replacers", displayOrder: 5 },
        ],
        "Plant Proteins": [
            { name: "Tofu & Tempeh", description: "Soy-based protein products", displayOrder: 1 },
            { name: "Seitan & Wheat Gluten", description: "Wheat-based protein products", displayOrder: 2 },
            { name: "Legumes", description: "Protein-rich beans and lentils", displayOrder: 3 },
            { name: "Meat Alternatives", description: "Plant-based meat substitutes", displayOrder: 4 },
            { name: "Protein Powders", description: "Plant-based protein supplements", displayOrder: 5 },
        ],
        Condiments: [
            { name: "Sauces", description: "Various cooking and table sauces", displayOrder: 1 },
            { name: "Vinegars", description: "Different types of vinegar", displayOrder: 2 },
            { name: "Spreads", description: "Nut butters, jams, etc.", displayOrder: 3 },
            { name: "Pickles & Ferments", description: "Pickled and fermented foods", displayOrder: 4 },
            { name: "Dressings", description: "Salad dressings and marinades", displayOrder: 5 },
        ],
        Beverages: [
            { name: "Coffee", description: "Coffee beans and ground coffee", displayOrder: 1 },
            { name: "Tea", description: "Different types of tea", displayOrder: 2 },
            { name: "Juices", description: "Fruit and vegetable juices", displayOrder: 3 },
            { name: "Plant Milks", description: "Shelf-stable plant-based milks", displayOrder: 4 },
            { name: "Other Beverages", description: "Other drink ingredients", displayOrder: 5 },
        ],
        "Snacks & Desserts": [
            { name: "Cookies & Crackers", description: "Sweet and savory baked snacks", displayOrder: 1 },
            { name: "Chips & Crisps", description: "Potato chips and similar snacks", displayOrder: 2 },
            { name: "Nuts & Trail Mixes", description: "Mixed nuts and trail mixes", displayOrder: 3 },
            { name: "Energy Bars", description: "Granola and protein bars", displayOrder: 4 },
            { name: "Sweets", description: "Vegetarian candies and confections", displayOrder: 5 },
            { name: "Dessert Ingredients", description: "Specialty ingredients for desserts", displayOrder: 6 },
        ],
        "Ready to Eat": [
            { name: "Fresh Fruits", description: "Whole fruits ready for consumption", displayOrder: 1 },
            { name: "Cut Vegetables", description: "Pre-cut vegetables and crudités", displayOrder: 2 },
            { name: "Dips & Spreads", description: "Ready-to-eat dips and spreads", displayOrder: 3 },
            { name: "Packaged Snacks", description: "Pre-packaged snack items", displayOrder: 4 },
            { name: "Bread & Crackers", description: "Ready-to-eat bread products", displayOrder: 5 },
            { name: "Desserts", description: "Ready-to-eat desserts and sweets", displayOrder: 6 },
            { name: "Beverages", description: "Ready-to-drink beverages", displayOrder: 7 },
        ],
        "Herbs": [
            { name: "Fresh Herbs", description: "Fresh culinary herbs", displayOrder: 1 },
            { name: "Dried Herbs", description: "Dried culinary herbs", displayOrder: 2 },
        ],
        "Nuts & Seeds": [
            { name: "Tree Nuts", description: "Various tree nuts", displayOrder: 1 },
            { name: "Seeds", description: "Edible seeds", displayOrder: 2 },
            { name: "Nut & Seed Butters", description: "Spreads made from nuts and seeds", displayOrder: 3 },
        ],
    }

    // Create subcategories
    const subcategoryMap = {}

    for (const [categoryName, subcategories] of Object.entries(subcategoryData)) {
        const category = categoryMap[categoryName]

        if (!category) {
            console.warn(`Category ${categoryName} not found, skipping subcategories.`)
            continue
        }

        for (const subcategoryInfo of subcategories) {
            // Check if subcategory already exists
            let subcategory = await prisma.ingredientSubcategory.findFirst({
                where: {
                    name: subcategoryInfo.name,
                    category_id: category.category_id,
                },
            })

            if (!subcategory) {
                subcategory = await prisma.ingredientSubcategory.create({
                    data: {
                        ...subcategoryInfo,
                        category_id: category.category_id,
                    },
                })
            } else {
                // Update existing subcategory
                subcategory = await prisma.ingredientSubcategory.update({
                    where: { subcategory_id: subcategory.subcategory_id },
                    data: {
                        ...subcategoryInfo,
                        category_id: category.category_id,
                    },
                })
            }

            // Use composite key for map (category:subcategory)
            const key = `${categoryName}:${subcategory.name}`
            subcategoryMap[key] = subcategory
        }
    }

    console.log(`Seeded ${Object.keys(categoryMap).length} vegetarian ingredient categories`)
    console.log(`Seeded ${Object.keys(subcategoryMap).length} vegetarian ingredient subcategories`)

    return {
        categories: categoryMap,
        subcategories: subcategoryMap,
    }
}

// Execute the seed function if this script is run directly
if (require.main === module) {
    seedCategories()
        .catch((e) => {
            console.error(e)
            process.exit(1)
        })
        .finally(async () => {
            await prisma.$disconnect()
        })
}