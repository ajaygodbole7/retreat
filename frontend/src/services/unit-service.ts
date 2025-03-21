import api from "../lib/api"
import type { UnitOfMeasure, SimpleUnit, UnitConversionRequest, UnitConversionResult } from "@server/types/unit-types"

/**
 * Service for handling unit of measure-related API calls
 */
export const unitService = {
    /**
     * Get all units of measure
     */
    getAll: async (): Promise<UnitOfMeasure[]> => {
        const response = await api.get("/units")
        return response.data
    },

    /**
     * Get a simplified list of units for dropdowns
     */
    getSimpleList: async (): Promise<SimpleUnit[]> => {
        const response = await api.get("/units/simple")
        return response.data
    },

    /**
     * Get units by type (volume, weight, etc.)
     */
    getByType: async (type: string): Promise<UnitOfMeasure[]> => {
        const response = await api.get(`/units/type/${type}`)
        return response.data
    },

    /**
     * Get a single unit by ID
     */
    getById: async (id: number): Promise<UnitOfMeasure> => {
        const response = await api.get(`/units/${id}`)
        return response.data
    },

    /**
     * Convert between units
     */
    convert: async (conversionData: UnitConversionRequest): Promise<UnitConversionResult> => {
        const response = await api.post("/units/convert", conversionData)
        return response.data
    },
}

export default unitService

