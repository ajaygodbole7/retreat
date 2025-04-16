// src/features/events/ScheduledMealForm.tsx
"use client"

import { useEffect } from "react"
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
import { MealType } from "@server/types/event-types"
import type { ScheduledMeal, CreateScheduledMealInput, UpdateScheduledMealInput } from "@server/types/event-types"
import { formatEnum } from "../../utils/format-utils"
import { formatTimeForForm } from "../../utils/date-utils"

// Zod Schema for basic meal details
const scheduledMealSchema = z.object({
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Use HH:MM or HH:MM:SS"),
    mealType: z.nativeEnum(MealType),
    attendeeHeadcount: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
        z.number().int().nonnegative().optional().default(0),
    ),
    volunteerHeadcount: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
        z.number().int().nonnegative().optional().default(0),
    ),
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
    initialData?: ScheduledMeal | null // For editing existing meal basics
    defaultHeadcounts?: { attendees: number; volunteers: number } // For 'Add Meal' dialog
    onClose: () => void
    onSuccess?: (data: ScheduledMeal) => void // Callback on successful save
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

    const createMealMutation = useCreateScheduledMeal(eventId)
    const updateMealMutation = useUpdateScheduledMeal(eventId)
    const { data: menus = [], isLoading: menusLoading } = useMenuListSimple()

    const form = useForm<ScheduledMealFormValues>({
        resolver: zodResolver(scheduledMealSchema),
        defaultValues: {
            time: formatTimeForForm(initialData?.time, "12:00"),
            mealType: initialData?.mealType ?? MealType.LUNCH,
            attendeeHeadcount: initialData?.attendeeHeadcount ?? defaultHeadcounts?.attendees ?? 0,
            volunteerHeadcount: initialData?.volunteerHeadcount ?? defaultHeadcounts?.volunteers ?? 0,
            menuId: initialData?.menuId ?? null,
            notes: initialData?.notes ?? "",
        },
    })

    // Effect to reset form (remains the same)
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

    // onSubmit logic (remains the same)
    const onSubmit = async (values: ScheduledMealFormValues) => {
        console.log("Submitting meal basic details:", values)
        try {
            const mutationData = {
                ...values,
                time: values.time,
                menuId: values.menuId === 0 ? null : values.menuId,
                attendeeHeadcount: values.attendeeHeadcount ?? 0,
                volunteerHeadcount: values.volunteerHeadcount ?? 0,
            }

            if (isEditing && initialData) {
                await updateMealMutation.mutateAsync(
                    { mealId: initialData.id, data: mutationData as UpdateScheduledMealInput },
                    { onSuccess: (data) => { onSuccess?.(data); onClose(); } }
                )
            } else {
                await createMealMutation.mutateAsync(
                    { dayId, data: mutationData as CreateScheduledMealInput },
                    { onSuccess: (data) => { onSuccess?.(data); onClose(); } }
                )
            }
        } catch (error) {
            console.error("Error in meal form submission:", error)
            // Error toast handled by hook
        }
    }

    const isMutating = createMealMutation.isPending || updateMealMutation.isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                {/* Time Input */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time *</FormLabel>
                                <FormControl>
                                    {/* Input directly inside FormControl is fine */}
                                    <Input type="time" step="1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Meal Type Select - RESTRUCTURED */}
                    <FormField
                        control={form.control}
                        name="mealType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Meal Type *</FormLabel>
                                {/* FormControl now wraps the entire Select component */}
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value} // Use defaultValue too for safety
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(MealType).map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {formatEnum(type)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
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
                {/* Menu Selection - RESTRUCTURED */}
                <FormField
                    control={form.control}
                    name="menuId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Menu Template (Optional)</FormLabel>
                            {/* FormControl now wraps the entire Select component */}
                            <FormControl>
                                <Select
                                    onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                                    value={field.value?.toString() ?? "none"}
                                    disabled={menusLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={menusLoading ? "Loading..." : "Optional: Select a menu template"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- No Menu Template --</SelectItem>
                                        {menus.map((menu) => (
                                            <SelectItem key={menu.id} value={menu.id.toString()}>
                                                {menu.name} {menu.mealType ? `(${ formatEnum(menu.mealType) })` : ""}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormDescription className="text-xs">Link a template or add specific recipes later.</FormDescription>
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
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                                {/* Textarea directly inside FormControl is fine */}
                                <Textarea placeholder="Any specific notes for this meal..." {...field} value={field.value ?? ""} rows={2} />
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
                        {isEditing ? "Update Details" : "Add Meal Slot"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}