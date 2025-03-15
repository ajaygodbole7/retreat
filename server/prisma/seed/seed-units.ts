import { PrismaClient } from "@prisma/client"
import { MeasurementSystem, UnitType } from "./types"

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
            uom_name: "Milliliter",
            uom_abbreviation: "ml",
            uom_system: MeasurementSystem.METRIC,
            uom_type: UnitType.VOLUME,
            uom_conversionFactor: 1,
        },
        {
            uom_name: "Teaspoon",
            uom_abbreviation: "tsp",
            uom_system: MeasurementSystem.US,
            uom_type: UnitType.VOLUME,
            uom_conversionFactor: 1,
        },

        // Weight base units
        {
            uom_name: "Gram",
            uom_abbreviation: "g",
            uom_system: MeasurementSystem.METRIC,
            uom_type: UnitType.WEIGHT,
            uom_conversionFactor: 1,
        },
        {
            uom_name: "Ounce",
            uom_abbreviation: "oz",
            uom_system: MeasurementSystem.US,
            uom_type: UnitType.WEIGHT,
            uom_conversionFactor: 1,
        },

        // Count base units
        {
            uom_name: "Each",
            uom_abbreviation: "ea",
            uom_system: MeasurementSystem.METRIC,
            uom_type: UnitType.COUNT,
            uom_conversionFactor: 1,
        },
        {
            uom_name: "Each",
            uom_abbreviation: "ea",
            uom_system: MeasurementSystem.US,
            uom_type: UnitType.COUNT,
            uom_conversionFactor: 1,
        },

        // Add units from CSV
        {
            uom_name: "Piece",
            uom_abbreviation: "pc",
            uom_system: MeasurementSystem.METRIC,
            uom_type: UnitType.COUNT,
            uom_conversionFactor: 1,
        },
        {
            uom_name: "Piece",
            uom_abbreviation: "pc",
            uom_system: MeasurementSystem.US,
            uom_type: UnitType.COUNT,
            uom_conversionFactor: 1,
        },
    ]

    // Create base units and store them in a map
    const baseUnitMap = {}

    for (const unitData of baseUnits) {
        // Check if unit already exists
        let unit = await prisma.unitOfMeasure.findFirst({
            where: {
                uom_name: unitData.uom_name,
                uom_system: unitData.uom_system,
                uom_type: unitData.uom_type,
            },
        })

        if (!unit) {
            unit = await prisma.unitOfMeasure.create({
                data: unitData,
            })
        } else {
            // Update existing unit
            unit = await prisma.unitOfMeasure.update({
                where: { uom_id: unit.uom_id },
                data: unitData,
            })
        }

        // Use composite key for map (system:type)
        const key = `${unit.uom_system}:${unit.uom_type}`
        baseUnitMap[key] = unit
    }

    // Define derived units for each base unit
    const derivedUnits = [
        // Metric volume units
        {
            uom_name: "Liter",
            uom_abbreviation: "L",
            uom_system: MeasurementSystem.METRIC,
            uom_type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.METRIC}:${UnitType.VOLUME}`,
            uom_conversionFactor: 1000, // 1 L = 1000 ml
        },
        {
            uom_name: "Deciliter",
            uom_abbreviation: "dl",
            uom_system: MeasurementSystem.METRIC,
            uom_type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.METRIC}:${UnitType.VOLUME}`,
            uom_conversionFactor: 100, // 1 dl = 100 ml
        },
        {
            uom_name: "Centiliter",
            uom_abbreviation: "cl",
            uom_system: MeasurementSystem.METRIC,
            uom_type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.METRIC}:${UnitType.VOLUME}`,
            uom_conversionFactor: 10, // 1 cl = 10 ml
        },

        // US volume units
        {
            uom_name: "Tablespoon",
            uom_abbreviation: "tbsp",
            uom_system: MeasurementSystem.US,
            uom_type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.US}:${UnitType.VOLUME}`,
            uom_conversionFactor: 3, // 1 tbsp = 3 tsp
        },
        {
            uom_name: "Fluid Ounce",
            uom_abbreviation: "fl oz",
            uom_system: MeasurementSystem.US,
            uom_type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.US}:${UnitType.VOLUME}`,
            uom_conversionFactor: 6, // 1 fl oz = 6 tsp
        },
        {
            uom_name: "Cup",
            uom_abbreviation: "cup",
            uom_system: MeasurementSystem.US,
            uom_type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.US}:${UnitType.VOLUME}`,
            uom_conversionFactor: 48, // 1 cup = 48 tsp
        },
        {
            uom_name: "Pint",
            uom_abbreviation: "pt",
            uom_system: MeasurementSystem.US,
            uom_type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.US}:${UnitType.VOLUME}`,
            uom_conversionFactor: 96, // 1 pint = 96 tsp
        },
        {
            uom_name: "Quart",
            uom_abbreviation: "qt",
            uom_system: MeasurementSystem.US,
            uom_type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.US}:${UnitType.VOLUME}`,
            uom_conversionFactor: 192, // 1 quart = 192 tsp
        },
        {
            uom_name: "Gallon",
            uom_abbreviation: "gal",
            uom_system: MeasurementSystem.US,
            uom_type: UnitType.VOLUME,
            base_key: `${MeasurementSystem.US}:${UnitType.VOLUME}`,
            uom_conversionFactor: 768, // 1 gallon = 768 tsp
        },

        // Metric weight units
        {
            uom_name: "Kilogram",
            uom_abbreviation: "kg",
            uom_system: MeasurementSystem.METRIC,
            uom_type: UnitType.WEIGHT,
            base_key: `${MeasurementSystem.METRIC}:${UnitType.WEIGHT}`,
            uom_conversionFactor: 1000, // 1 kg = 1000 g
        },
        {
            uom_name: "Milligram",
            uom_abbreviation: "mg",
            uom_system: MeasurementSystem.METRIC,
            uom_type: UnitType.WEIGHT,
            base_key: `${MeasurementSystem.METRIC}:${UnitType.WEIGHT}`,
            uom_conversionFactor: 0.001, // 1 mg = 0.001 g
        },

        // US weight units
        {
            uom_name: "Pound",
            uom_abbreviation: "lb",
            uom_system: MeasurementSystem.US,
            uom_type: UnitType.WEIGHT,
            base_key: `${MeasurementSystem.US}:${UnitType.WEIGHT}`,
            uom_conversionFactor: 16, // 1 lb = 16 oz
        },

        // Count units
        {
            uom_name: "Dozen",
            uom_abbreviation: "doz",
            uom_system: MeasurementSystem.US,
            uom_type: UnitType.COUNT,
            base_key: `${MeasurementSystem.US}:${UnitType.COUNT}`,
            uom_conversionFactor: 12, // 1 dozen = 12 each
        },
        {
            uom_name: "Pair",
            uom_abbreviation: "pr",
            uom_system: MeasurementSystem.METRIC,
            uom_type: UnitType.COUNT,
            base_key: `${MeasurementSystem.METRIC}:${UnitType.COUNT}`,
            uom_conversionFactor: 2, // 1 pair = 2 each
        },

        // Add units from CSV
        {
            uom_name: "Bunch",
            uom_abbreviation: "bunch",
            uom_system: MeasurementSystem.US,
            uom_type: UnitType.COUNT,
            base_key: `${MeasurementSystem.US}:${UnitType.COUNT}`,
            uom_conversionFactor: 1, // 1 bunch
        },
        {
            uom_name: "Head",
            uom_abbreviation: "head",
            uom_system: MeasurementSystem.US,
            uom_type: UnitType.COUNT,
            base_key: `${MeasurementSystem.US}:${UnitType.COUNT}`,
            uom_conversionFactor: 1, // 1 head
        },
        {
            uom_name: "Clove",
            uom_abbreviation: "clove",
            uom_system: MeasurementSystem.US,
            uom_type: UnitType.COUNT,
            base_key: `${MeasurementSystem.US}:${UnitType.COUNT}`,
            uom_conversionFactor: 1, // 1 clove
        },
        {
            uom_name: "Sprig",
            uom_abbreviation: "sprig",
            uom_system: MeasurementSystem.US,
            uom_type: UnitType.COUNT,
            base_key: `${MeasurementSystem.US}:${UnitType.COUNT}`,
            uom_conversionFactor: 1, // 1 sprig
        },
    ]

    // Create derived units
    const derivedUnitMap = {}

    for (const unitData of derivedUnits) {
        const { base_key, ...data } = unitData
        const baseUnit = baseUnitMap[base_key]

        if (!baseUnit) {
            console.warn(`Base unit for ${base_key} not found, skipping derived unit ${unitData.uom_name}.`)
            continue
        }

        // Check if unit already exists
        let unit = await prisma.unitOfMeasure.findFirst({
            where: {
                uom_name: data.uom_name,
                uom_system: data.uom_system,
                uom_type: data.uom_type,
            },
        })

        if (!unit) {
            unit = await prisma.unitOfMeasure.create({
                data: {
                    ...data,
                    uom_base_unit_id: baseUnit.uom_id,
                },
            })
        } else {
            // Update existing unit
            unit = await prisma.unitOfMeasure.update({
                where: { uom_id: unit.uom_id },
                data: {
                    ...data,
                    uom_base_unit_id: baseUnit.uom_id,
                },
            })
        }

        derivedUnitMap[unit.uom_name] = unit
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

        // Update the from unit with its equivalent
        await prisma.unitOfMeasure.update({
            where: { uom_id: fromUnit.uom_id },
            data: {
                uom_equivalent_id: toUnit.uom_id,
                uom_equivalentFactor: factor,
            },
        })
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