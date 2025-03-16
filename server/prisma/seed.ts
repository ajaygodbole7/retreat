import { PrismaClient } from '@prisma/client'
import { seedCategories } from './seed/seed-categories'
import { seedUnits } from './seed/seed-units'

const prisma = new PrismaClient()

async function main() {
    console.log(`Start seeding...`)

    // Seed units of measure
    await seedUnits()

    // Seed categories and subcategories
    await seedCategories()

    // Add example ingredients
    const category = await prisma.ingredientCategory.findFirst({
        where: { name: 'Vegetables' }
    })

    const subcategory = await prisma.ingredientSubcategory.findFirst({
        where: { name: 'Leafy Greens' }
    })

    const unit = await prisma.unitOfMeasure.findFirst({
        where: { name: 'Cup' }
    })

    if (category && subcategory && unit) {
        // Create a sample ingredient
        try {
            const spinach = await prisma.ingredient.upsert({
                where: { id: 1 },
                update: {},
                create: {
                    name: 'Fresh Spinach',
                    description: 'Fresh leafy green vegetable',
                    categoryId: category.id,
                    subcategoryId: subcategory.id,
                    defaultUnitId: unit.id,
                    isPerishable: true,
                    storageType: 'REFRIGERATED',
                    shelfLifeDays: 7,
                    storageInstructions: 'Keep refrigerated in high humidity drawer',
                    isLocal: true,
                    isOrganic: true,
                    isSeasonalItem: true,
                    hasVariablePrice: true,
                    isCommonAllergen: false,
                    isSpecialOrder: false
                }
            })

            console.log(`Created sample ingredient: ${spinach.name}`)
        } catch (error) {
            console.error('Error creating sample ingredient:', error)
        }
    } else {
        console.warn('Missing category, subcategory, or unit for sample ingredient')
    }

    console.log(`Seeding completed.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })