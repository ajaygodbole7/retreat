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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card"
import {
    useRecipeSteps,
    useCreateRecipeStep,
    useUpdateRecipeStep,
    useDeleteRecipeStep,
} from "../../hooks/useRecipeSteps"
import { Loader2, Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react"

// Define the form schema using zod
const stepFormSchema = z.object({
    instruction: z.string().min(1, "Instruction is required"),
    estimatedTimeMinutes: z.number().int().positive().optional().nullable(),
    isOptional: z.boolean().default(false),
})

type StepFormValues = z.infer<typeof stepFormSchema>

interface RecipeStepsEditorProps {
    recipeId: number
    onErrorsChange?: (hasErrors: boolean) => void
}

export function RecipeStepsEditor({ recipeId, onErrorsChange }: RecipeStepsEditorProps) {
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
                ...values,
                recipeId,
                stepNumber: steps.length + 1,
            }

            createStepMutation.mutate(newStep, {
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
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Recipe Steps</CardTitle>
                    <CardDescription>Add and manage preparation steps for this recipe</CardDescription>
                </CardHeader>
                <CardContent>
                    {steps.length === 0 && !isAddingStep ? (
                        <div className="text-center py-4 text-muted-foreground">
                            No steps added yet. Click "Add Step" to get started.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* List of existing steps */}
                            {steps
                                .sort((a, b) => a.stepNumber - b.stepNumber)
                                .map((step) => (
                                    <Card key={step.id} className={editingStepId === step.id ? "border-primary" : ""}>
                                        {editingStepId === step.id ? (
                                            <Form {...form}>
                                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="instruction"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    <span className="flex items-center space-x-1">
                                                                        <span>Instruction</span>
                                                                        <span className="text-destructive">*</span>
                                                                    </span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Textarea {...field} className="h-20 resize-none" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name="estimatedTimeMinutes"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Estimated Time (mins)</FormLabel>
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
                                                                        <FormLabel>Optional Step</FormLabel>
                                                                    </div>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="flex justify-end space-x-2">
                                                        <Button type="button" variant="outline" onClick={() => setEditingStepId(null)}>
                                                            Cancel
                                                        </Button>
                                                        <Button type="submit" disabled={updateStepMutation.isPending}>
                                                            {updateStepMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            Save Step
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        ) : (
                                            <div className="p-4">
                                                <div className="flex items-start">
                                                    <div className="flex items-center mr-2 text-muted-foreground">
                                                        <GripVertical className="h-5 w-5" />
                                                        <span className="font-bold">{step.stepNumber}.</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p>{step.instruction}</p>
                                                        {step.estimatedTimeMinutes && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                Estimated time: {step.estimatedTimeMinutes} minutes
                                                            </p>
                                                        )}
                                                        {step.isOptional && <p className="text-sm text-muted-foreground mt-1">Optional step</p>}
                                                    </div>
                                                    <div className="flex space-x-1 ml-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleMoveStep(step.id, "up")}
                                                            disabled={step.stepNumber === 1}
                                                        >
                                                            <ArrowUp className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleMoveStep(step.id, "down")}
                                                            disabled={step.stepNumber === steps.length}
                                                        >
                                                            <ArrowDown className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="icon" onClick={() => setEditingStepId(step.id)}>
                                                            <span className="sr-only">Edit</span>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                className="h-4 w-4"
                                                            >
                                                                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                                <path d="m15 5 4 4" />
                                                            </svg>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                            onClick={() => handleDelete(step.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                ))}

                            {/* Add new step form */}
                            {isAddingStep && (
                                <Card className="border-dashed border-primary">
                                    <CardHeader>
                                        <CardTitle>Add New Step</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name="instruction"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                <span className="flex items-center space-x-1">
                                                                    <span>Instruction</span>
                                                                    <span className="text-destructive">*</span>
                                                                </span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Textarea {...field} className="h-20 resize-none" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="estimatedTimeMinutes"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Estimated Time (mins)</FormLabel>
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
                                                                    <FormLabel>Optional Step</FormLabel>
                                                                </div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="flex justify-end space-x-2">
                                                    <Button type="button" variant="outline" onClick={() => setIsAddingStep(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" disabled={createStepMutation.isPending}>
                                                        {createStepMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Add Step
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    {!isAddingStep && (
                        <Button onClick={() => setIsAddingStep(true)} disabled={editingStepId !== null}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Step
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}