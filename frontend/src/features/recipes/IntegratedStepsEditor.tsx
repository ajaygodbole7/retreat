"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Checkbox } from "../../components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import {
    useRecipeSteps,
    useCreateRecipeStep,
    useUpdateRecipeStep,
    useDeleteRecipeStep,
} from "../../hooks/useRecipeSteps"
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Clock } from "lucide-react"
import type { CreateRecipeStepInput } from "@server/types/recipe-types"

// Define the form schema using zod
const stepFormSchema = z.object({
    instruction: z.string().min(1, "Instruction is required"),
    estimatedTimeMinutes: z.number().int().positive().optional().nullable(),
    isOptional: z.boolean().default(false),
})

type StepFormValues = z.infer<typeof stepFormSchema>

interface IntegratedStepsEditorProps {
    recipeId: number
    onErrorsChange?: (hasErrors: boolean) => void
}

export function IntegratedStepsEditor({ recipeId, onErrorsChange }: IntegratedStepsEditorProps) {
    const [editingStepId, setEditingStepId] = useState<number | null>(null)
    const [isAddingStep, setIsAddingStep] = useState(false)

    const { data: steps = [], isLoading } = useRecipeSteps(recipeId)

    const createStepMutation = useCreateRecipeStep()
    const updateStepMutation = useUpdateRecipeStep(recipeId)
    const deleteStepMutation = useDeleteRecipeStep(recipeId)

    // Create form with default values
    const form = useForm<StepFormValues>({
        resolver: zodResolver(stepFormSchema),
        defaultValues: {
            instruction: "",
            estimatedTimeMinutes: null,
            isOptional: false,
        },
        mode: "onChange",
    })

    // Update parent component about form errors
    useEffect(() => {
        if (onErrorsChange) {
            onErrorsChange(Object.keys(form.formState.errors).length > 0)
        }
    }, [form.formState.errors, onErrorsChange])

    // Reset form when editing a different step
    useEffect(() => {
        if (editingStepId !== null) {
            const step = steps.find((s) => s.id === editingStepId)
            if (step) {
                form.reset({
                    instruction: step.instruction,
                    estimatedTimeMinutes: step.estimatedTimeMinutes,
                    isOptional: step.isOptional,
                })
            }
        } else if (!isAddingStep) {
            form.reset({
                instruction: "",
                estimatedTimeMinutes: null,
                isOptional: false,
            })
        }
    }, [editingStepId, isAddingStep, steps, form])

    const onSubmit = (values: StepFormValues) => {
        if (editingStepId !== null) {
            // Update existing step
            updateStepMutation.mutate(
                {
                    id: editingStepId,
                    data: values,
                },
                {
                    onSuccess: () => {
                        setEditingStepId(null)
                        form.reset()
                    },
                },
            )
        } else {
            // Create new step
            const newStep = {
                recipeId,
                stepNumber: steps.length + 1,
                instruction: values.instruction!,  // Ensure required field
                estimatedTimeMinutes: values.estimatedTimeMinutes ?? null,
                isOptional: values.isOptional ?? false,
            }
            

            createStepMutation.mutate(newStep as CreateRecipeStepInput, {
                onSuccess: () => {
                    setIsAddingStep(false)
                    form.reset()
                },
            })
        }
    }

    const handleDelete = (stepId: number) => {
        if (editingStepId === stepId) {
            setEditingStepId(null)
        }
        deleteStepMutation.mutate(stepId)
    }

    const handleMoveStep = (stepId: number, direction: "up" | "down") => {
        const stepIndex = steps.findIndex((s) => s.id === stepId)
        if (stepIndex === -1) return

        const newSteps = [...steps]
        const step = newSteps[stepIndex]

        if (direction === "up" && stepIndex > 0) {
            // Swap with previous step
            const prevStep = newSteps[stepIndex - 1]

            updateStepMutation.mutate({
                id: step.id,
                data: { stepNumber: prevStep.stepNumber },
            })

            updateStepMutation.mutate({
                id: prevStep.id,
                data: { stepNumber: step.stepNumber },
            })
        } else if (direction === "down" && stepIndex < newSteps.length - 1) {
            // Swap with next step
            const nextStep = newSteps[stepIndex + 1]

            updateStepMutation.mutate({
                id: step.id,
                data: { stepNumber: nextStep.stepNumber },
            })

            updateStepMutation.mutate({
                id: nextStep.id,
                data: { stepNumber: step.stepNumber },
            })
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Add new step button */}
            {isAddingStep ? (
                <div className="border rounded-md p-3 space-y-3">
                    <h3 className="font-medium text-sm">Add New Step</h3>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                            <FormField
                                control={form.control}
                                name="instruction"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Instruction</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} className="h-20 resize-none" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="estimatedTimeMinutes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Time (mins)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    value={field.value || ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value ? Number(e.target.value) : null
                                                        field.onChange(value)
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isOptional"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 pt-6">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <div>
                                                <FormLabel className="text-xs">Optional Step</FormLabel>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingStep(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm" disabled={createStepMutation.isPending}>
                                    {createStepMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                    Add
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            ) : (
                <Button onClick={() => setIsAddingStep(true)} disabled={editingStepId !== null} size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                </Button>
            )}

            {/* Steps list */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {steps.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                        No steps added yet. Use the form above to add preparation steps.
                    </div>
                ) : (
                    steps
                        .sort((a, b) => a.stepNumber - b.stepNumber)
                        .map((step) => (
                            <div key={step.id} className="border rounded-md p-2">
                                {editingStepId === step.id ? (
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                                            <FormField
                                                control={form.control}
                                                name="instruction"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Instruction</FormLabel>
                                                        <FormControl>
                                                            <Textarea {...field} className="h-20 resize-none" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-2 gap-3">
                                                <FormField
                                                    control={form.control}
                                                    name="estimatedTimeMinutes"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">Time (mins)</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    value={field.value || ""}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value ? Number(e.target.value) : null
                                                                        field.onChange(value)
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="isOptional"
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center space-x-2 pt-6">
                                                            <FormControl>
                                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                            </FormControl>
                                                            <div>
                                                                <FormLabel className="text-xs">Optional Step</FormLabel>
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="flex justify-end space-x-2">
                                                <Button type="button" variant="outline" size="sm" onClick={() => setEditingStepId(null)}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit" size="sm" disabled={updateStepMutation.isPending}>
                                                    {updateStepMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                                    Save
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                ) : (
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium flex items-center">
                                                Step {step.stepNumber}
                                                {step.isOptional && <span className="text-xs text-muted-foreground ml-1">(Optional)</span>}
                                            </div>
                                            <div className="text-sm">{step.instruction}</div>
                                            {step.estimatedTimeMinutes && (
                                                <div className="text-xs text-muted-foreground flex items-center mt-1">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {step.estimatedTimeMinutes} minutes
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex space-x-1">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleMoveStep(step.id, "up")}
                                                disabled={step.stepNumber === 1}
                                            >
                                                <ArrowUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleMoveStep(step.id, "down")}
                                                disabled={step.stepNumber === steps.length}
                                            >
                                                <ArrowDown className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => setEditingStepId(step.id)}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-3 w-3"
                                                >
                                                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                    <path d="m15 5 4 4" />
                                                </svg>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                onClick={() => handleDelete(step.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                )}
            </div>
        </div>
    )
}