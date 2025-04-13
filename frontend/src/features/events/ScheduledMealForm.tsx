"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../components/ui/form"
import { useCreateScheduledMeal, useUpdateScheduledMeal } from "../../hooks/useScheduledMeals"
import { useMenuListSimple } from "../../hooks/useMenus"
import { Loader2 } from "lucide-react"
// Import backend types and enums
import { MealType } from "@server/types/event-types"
import type { ScheduledMeal, CreateScheduledMealInput, UpdateScheduledMealInput } from "@server/types/event-types"
import { formatEnum } from "../../utils/format-utils"
import { formatTimeForForm } from "../../utils/date-utils"

// Zod Schema
const scheduledMealSchema = z.object({
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Use HH:MM or HH:MM:SS"),
    mealType: z.nativeEnum(MealType),
    attendeeHeadcount: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
        z.number().int().nonnegative().optional().default(0),
    ), // Ensure default 0
    volunteerHeadcount: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
        z.number().int().nonnegative().optional().default(0),
    ), // Ensure default 0
    menuId: z.preprocess(
        (val) => (val === "" || val === null || val === undefined || val === "none" ? null : Number(val)),
        z.number().int().positive().optional().nullable(),
    ),
    notes: z.string().optional().nullable(),
})

type ScheduledMealFormValues = z.infer<typeof scheduledMealSchema>

interface ScheduledMealFormProps {
    eventId: number
    dayId: number
    initialData?: ScheduledMeal | null
    defaultHeadcounts?: { attendees: number; volunteers: number } // Pass event/day defaults
    onClose: () => void
    onSuccess?: (data: ScheduledMeal) => void
}

export function ScheduledMealForm({
    eventId,
    dayId,
    initialData,
    defaultHeadcounts,
    onClose,
    onSuccess,
}: ScheduledMealFormProps) {
    const isEditing = !!initialData
    //const [isSubmitting, setIsSubmitting] = useState(false)

    // --- Hooks ---
    const createMealMutation = useCreateScheduledMeal(eventId)
    const updateMealMutation = useUpdateScheduledMeal(eventId)
    const { data: menus = [], isLoading: menusLoading } = useMenuListSimple()

    console.log("Initial meal data:", initialData);
    if (initialData?.time) {
        console.log("Original time value:", initialData.time);
        console.log("Formatted time value:", formatTimeForForm(initialData.time));
    }

    const form = useForm<ScheduledMealFormValues>({
        resolver: zodResolver(scheduledMealSchema),
        // Set defaults based on edit/add mode and passed defaults
        defaultValues: {
            time: formatTimeForForm(initialData?.time, "12:00"),
            mealType: initialData?.mealType ?? MealType.LUNCH,
            attendeeHeadcount: initialData?.attendeeHeadcount ?? defaultHeadcounts?.attendees ?? 0,
            volunteerHeadcount: initialData?.volunteerHeadcount ?? defaultHeadcounts?.volunteers ?? 0,
            menuId: initialData?.menuId ?? null,
            notes: initialData?.notes ?? "",
        },
    })

    // --- Effect to reset form when initialData changes ---
    useEffect(() => {
        if (initialData) {
            form.reset({
                time: formatTimeForForm(initialData.time, "12:00"),
                mealType: initialData.mealType,
                attendeeHeadcount: initialData.attendeeHeadcount ?? 0,
                volunteerHeadcount: initialData.volunteerHeadcount ?? 0,
                menuId: initialData.menuId ?? null,
                notes: initialData.notes ?? "",
            })
        } else {
            // Use provided defaults when adding, otherwise base defaults
            form.reset({
                time: "12:00",
                mealType: MealType.LUNCH,
                attendeeHeadcount: defaultHeadcounts?.attendees ?? 0,
                volunteerHeadcount: defaultHeadcounts?.volunteers ?? 0,
                menuId: null,
                notes: "",
            })
        }
    }, [initialData, defaultHeadcounts, form])

    // --- Handlers ---
    const onSubmit = async (values: ScheduledMealFormValues) => {
        //setIsSubmitting(true)
        console.log("Submitting meal form with values:", values)

        try {
            const mutationData = {
                ...values,
                time: values.time, // Send HH:MM or HH:MM:SS as entered/validated
                menuId: values.menuId === 0 ? null : values.menuId, // Handle potential 0 value from select
            }

            if (isEditing && initialData) {
                console.log("Updating meal:", initialData.id, mutationData)
                await updateMealMutation.mutateAsync(
                    { mealId: initialData.id, data: mutationData as UpdateScheduledMealInput },
                    {
                        onSuccess: (data) => {
                            console.log("Meal updated successfully:", data)
                            onSuccess?.(data)
                            onClose()
                        },
                        onError: (error) => {
                            console.error("Error updating meal:", error)
                        },
                    },
                )
            } else {
                console.log("Creating new meal for day:", dayId, mutationData)
                await createMealMutation.mutateAsync(
                    { dayId, data: mutationData as CreateScheduledMealInput },
                    {
                        onSuccess: (data) => {
                            console.log("Meal created successfully:", data)
                            onSuccess?.(data)
                            onClose()
                        },
                        onError: (error) => {
                            console.error("Error creating meal:", error)
                        },
                    },
                )
            }
        } catch (error) {
            console.error("Error in meal form submission:", error)
        }
        //finally {setIsSubmitting(false)}
    }

    //const isMutating = createMealMutation.isPending || updateMealMutation.isPending || isSubmitting
    const isMutating = createMealMutation.isPending || updateMealMutation.isPending

    // --- TSX ---
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                {/* Time and Meal Type */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time *</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="mealType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Meal Type *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(MealType).map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {formatEnum(type)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Headcounts */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="attendeeHeadcount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Attendees</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" placeholder="0" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="volunteerHeadcount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Volunteers</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" placeholder="0" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Menu Selection */}
                <FormField
                    control={form.control}
                    name="menuId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Menu Template</FormLabel>
                            <Select
                                onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                                value={field.value?.toString() ?? "none"}
                                disabled={menusLoading}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={menusLoading ? "Loading..." : "Optional: Select a menu"} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="none">-- No Menu --</SelectItem>
                                    {menus.map((menu) => (
                                        <SelectItem key={menu.id} value={menu.id.toString()}>
                                            {menu.name} {menu.mealType ? `(${ formatEnum(menu.mealType) })` : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">Link a menu or add recipes later.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Notes */}
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Optional notes..." {...field} value={field.value ?? ""} rows={2} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Submit/Cancel Buttons */}
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isMutating}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isMutating}>
                        {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? "Update Meal" : "Add Meal"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}