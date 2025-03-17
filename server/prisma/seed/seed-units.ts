import { PrismaClient, UnitOfMeasure, MeasurementSystem, UnitType } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Seed units of measure for both US and Metric systems
 */
export async function seedUnits() {
    console.log("Seeding units of measure...")

    // First, create base units for each measurement system and type
    const baseUnits = [
        // Volume base units
        {
            name: "Milliliter",
            abbreviation: "ml",
            system: MeasurementSystem.METRIC,
            type: UnitType.VOLUME,
            conversionFactor: 1,
        },
        {
            name: "Teaspoon",
            abbreviation: "tsp",
            system: MeasurementSystem.US,
            type: UnitType.VOLUME,
            conversionFactor: 1,
        },

        // Weight base units
        {
            name: "Gram",
            abbreviation: "g",
            system: MeasurementSystem.METRIC,
            type: UnitType.WEIGHT,
            conversionFactor: 1,
        },
        {
            name: "Ounce",
            abbreviation: "oz",
            system: MeasurementSystem.US,
            type: UnitType.WEIGHT,
            conversionFactor: 1,
        },

        // Count base units
        {
            name: "Each",
            abbreviation: "ea",
            system: MeasurementSystem.METRIC,
            type: UnitType.COUNT,
            conversionFactor: 1,
        },
        {
            name: "Each",
            abbreviation: "ea",
            system: MeasurementSystem.US,
            type: UnitType.COUNT,
            conversionFactor: 1,
        },

        // Add units from CSV
        {
            name: "Piece",
            abbreviation: "pc",
            system: MeasurementSystem.METRIC,
            type: UnitType.COUNT,
            conversionFactor: 1,
        },
        {
            name: "Piece",
            abbreviation: "pc",
            system: MeasurementSystem.US,
            type: UnitType.COUNT,
            conversionFactor: 1,
        },
    ]

    // Create base units and store them in a map
    const baseUnitMap: Record<string, UnitOfMeasure> = {}

    for (const unitData of baseUnits) {
        try {
            // Use upsert to create or update
            const unit = await prisma.unitOfMeasure.upsert({
                where: {
                    name: unitData.name,
                },
                update: unitData,
                create: unitData,
            })

            // Use composite key for map (system:type)
            const key = `${unit.system}:${unit.type}`
            baseUnitMap[key] = unit
        } catch (error) {
            console.error(`Error upserting base unit ${unitData.name}:`, error)
        }
    }

    // Define derived units for each base unit
    const derivedUnits = [
        // Metric volume units
        {
            name: "Liter",
            abbreviation: "l",
            system: MeasurementSystem.METRIC,
            type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.METRIC}:${UnitType.VOLUME}`,
            conversionFactor: 1000, // 1 L = 1000 ml
        },
        {
            name: "Deciliter",
            abbreviation: "dl",
            system: MeasurementSystem.METRIC,
            type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.METRIC}:${UnitType.VOLUME}`,
            conversionFactor: 100, // 1 dl = 100 ml
        },
        {
            name: "Centiliter",
            abbreviation: "cl",
            system: MeasurementSystem.METRIC,
            type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.METRIC}:${UnitType.VOLUME}`,
            conversionFactor: 10, // 1 cl = 10 ml
        },

        // US volume units
        {
            name: "Tablespoon",
            abbreviation: "tbsp",
            system: MeasurementSystem.US,
            type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.US}:${UnitType.VOLUME}`,
            conversionFactor: 3, // 1 tbsp = 3 tsp
        },
        {
            name: "Fluid Ounce",
            abbreviation: "fl oz",
            system: MeasurementSystem.US,
            type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.US}:${UnitType.VOLUME}`,
            conversionFactor: 6, // 1 fl oz = 6 tsp
        },
        {
            name: "Cup",
            abbreviation: "cup",
            system: MeasurementSystem.US,
            type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.US}:${UnitType.VOLUME}`,
            conversionFactor: 48, // 1 cup = 48 tsp
        },
        {
            name: "Pint",
            abbreviation: "pt",
            system: MeasurementSystem.US,
            type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.US}:${UnitType.VOLUME}`,
            conversionFactor: 96, // 1 pint = 96 tsp
        },
        {
            name: "Quart",
            abbreviation: "qt",
            system: MeasurementSystem.US,
            type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.US}:${UnitType.VOLUME}`,
            conversionFactor: 192, // 1 quart = 192 tsp
        },
        {
            name: "Gallon",
            abbreviation: "gal",
            system: MeasurementSystem.US,
            type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.US}:${UnitType.VOLUME}`,
            conversionFactor: 768, // 1 gallon = 768 tsp
        },

        // Metric weight units
        {
            name: "Kilogram",
            abbreviation: "kg",
            system: MeasurementSystem.METRIC,
            type: UnitType.WEIGHT,
            base_key: `${MeasurementSystem.METRIC}:${UnitType.WEIGHT}`,
            conversionFactor: 1000, // 1 kg = 1000 g
        },
        {
            name: "Milligram",
            abbreviation: "mg",
            system: MeasurementSystem.METRIC,
            type: UnitType.WEIGHT,
            base_key: `${MeasurementSystem.METRIC}:${UnitType.WEIGHT}`,
            conversionFactor: 0.001, // 1 mg = 0.001 g
        },

        // US weight units
        {
            name: "Pound",
            abbreviation: "lb",
            system: MeasurementSystem.US,
            type: UnitType.WEIGHT,
            base_key: `${MeasurementSystem.US}:${UnitType.WEIGHT}`,
            conversionFactor: 16, // 1 lb = 16 oz
        },

        // Count units
        {
            name: "Dozen",
            abbreviation: "doz",
            system: MeasurementSystem.US,
            type: UnitType.COUNT,
            base_key: `${MeasurementSystem.US}:${UnitType.COUNT}`,
            conversionFactor: 12, // 1 dozen = 12 each
        },
        {
            name: "Pair",
            abbreviation: "pr",
            system: MeasurementSystem.METRIC,
            type: UnitType.COUNT,
            base_key: `${MeasurementSystem.METRIC}:${UnitType.COUNT}`,
            conversionFactor: 2, // 1 pair = 2 each
        },

        // Add units from CSV
        {
            name: "Bunch",
            abbreviation: "bunch",
            system: MeasurementSystem.US,
            type: UnitType.COUNT,
            base_key: `${MeasurementSystem.US}:${UnitType.COUNT}`,
            conversionFactor: 1, // 1 bunch
        },
        {
            name: "Head",
            abbreviation: "head",
            system: MeasurementSystem.US,
            type: UnitType.COUNT,
            base_key: `${MeasurementSystem.US}:${UnitType.COUNT}`,
            conversionFactor: 1, // 1 head
        },
        {
            name: "Clove",
            abbreviation: "clove",
            system: MeasurementSystem.US,
            type: UnitType.COUNT,
            base_key: `${MeasurementSystem.US}:${UnitType.COUNT}`,
            conversionFactor: 1, // 1 clove
        },
        {
            name: "Sprig",
            abbreviation: "sprig",
            system: MeasurementSystem.US,
            type: UnitType.COUNT,
            base_key: `${MeasurementSystem.US}:${UnitType.COUNT}`,
            conversionFactor: 1, // 1 sprig
        },
        {
            name: "Packets",
            abbreviation: "packets",
            system: MeasurementSystem.US,
            type: UnitType.COUNT,
            base_key: `${MeasurementSystem.US}:${UnitType.COUNT}`,
            conversionFactor: 1, // 1 packet
        },
        {
            name: "Pieces",
            abbreviation: "pieces",
            system: MeasurementSystem.US,
            type: UnitType.COUNT,
            base_key: `${MeasurementSystem.US}:${UnitType.COUNT}`,
            conversionFactor: 1, // 1 Piece
        },
        {
            name: "Loaves",
            abbreviation: "loaves",
            system: MeasurementSystem.US,
            type: UnitType.COUNT,
            base_key: `${MeasurementSystem.US}:${UnitType.COUNT}`,
            conversionFactor: 1, // 1 Piece
        },
        {
            name: "Biscuits",
            abbreviation: "biscuits",
            system: MeasurementSystem.US,
            type: UnitType.COUNT,
            base_key: `${MeasurementSystem.US}:${UnitType.COUNT}`,
            conversionFactor: 1, // 1 Piece
        },
    ]

    // Create derived units
    const derivedUnitMap: Record<string, UnitOfMeasure> = {}

    for (const unitData of derivedUnits) {
        const { base_key, ...data } = unitData
        const baseUnit = baseUnitMap[base_key]

        if (!baseUnit) {
            console.warn(`Base unit for ${base_key} not found, skipping derived unit ${unitData.name}.`)
            continue
        }

        try {
            // Use upsert to create or update
            const unit = await prisma.unitOfMeasure.upsert({
                where: {
                    name: data.name,
                },
                update: {
                    ...data,
                    baseUnitId: baseUnit.id,
                },
                create: {
                    ...data,
                    baseUnitId: baseUnit.id,
                },
            })

            derivedUnitMap[unit.name] = unit
        } catch (error) {
            console.error(`Error upserting derived unit ${data.name}:`, error)
        }
    }

    // Define cross-system equivalents
    const equivalents = [
        // Volume equivalents
        {
            from_name: "Milliliter",
            to_name: "Teaspoon",
            factor: 0.202884, // 1 ml = 0.202884 tsp
        },
        {
            from_name: "Liter",
            to_name: "Quart",
            factor: 1.05669, // 1 L = 1.05669 qt
        },
        {
            from_name: "Cup",
            to_name: "Milliliter",
            factor: 236.588, // 1 cup = 236.588 ml
        },

        // Weight equivalents
        {
            from_name: "Gram",
            to_name: "Ounce",
            factor: 0.035274, // 1 g = 0.035274 oz
        },
        {
            from_name: "Kilogram",
            to_name: "Pound",
            factor: 2.20462, // 1 kg = 2.20462 lb
        },
    ]

    // Create equivalents
    for (const { from_name, to_name, factor } of equivalents) {
        const fromUnit =
            derivedUnitMap[from_name] ||
            baseUnitMap[`${MeasurementSystem.METRIC}:${UnitType.VOLUME}`] ||
            baseUnitMap[`${MeasurementSystem.METRIC}:${UnitType.WEIGHT}`]
        const toUnit =
            derivedUnitMap[to_name] ||
            baseUnitMap[`${MeasurementSystem.US}:${UnitType.VOLUME}`] ||
            baseUnitMap[`${MeasurementSystem.US}:${UnitType.WEIGHT}`]

        if (!fromUnit || !toUnit) {
            console.warn(`Units for equivalent ${from_name} -> ${to_name} not found, skipping.`)
            continue
        }

        try {
            // Update the from unit with its equivalent
            await prisma.unitOfMeasure.update({
                where: { id: fromUnit.id },
                data: {
                    equivalentUnitId: toUnit.id,
                    equivalentFactor: factor,
                },
            })
        } catch (error) {
            console.error(`Error updating equivalent for ${from_name} -> ${to_name}:`, error)
        }
    }

    console.log(`Seeded ${Object.keys(baseUnitMap).length} base units of measure`)
    console.log(`Seeded ${Object.keys(derivedUnitMap).length} derived units of measure`)
    console.log(`Created ${equivalents.length} cross-system equivalents`)

    return {
        baseUnits: baseUnitMap,
        derivedUnits: derivedUnitMap,
    }
}

// Execute the seed function if this script is run directly
if (require.main === module) {
    seedUnits()
        .catch((e) => {
            console.error(e)
            process.exit(1)
        })
        .finally(async () => {
            await prisma.$disconnect()
        })
}