"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Checkbox } from "../../components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import { Plus, Trash2, ArrowUp, ArrowDown, Clock } from "lucide-react"

// Define the form schema using zod
const stepFormSchema = z.object({
    instruction: z.string().min(1, "Instruction is required"),
    estimatedTimeMinutes: z.number().int().positive().optional().nullable(),
    isOptional: z.boolean().default(false),
})

type StepFormValues = z.infer<typeof stepFormSchema>

interface StepsSectionProps {
    steps: any[]
    setSteps: (steps: any[]) => void
}

export function StepsSection({ steps, setSteps }: StepsSectionProps) {
    const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null)
    const [isAddingStep, setIsAddingStep] = useState(false)

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

    // Reset form when editing a different step
    const resetForm = (step?: any) => {
        if (step) {
            form.reset({
                instruction: step.instruction,
                estimatedTimeMinutes: step.estimatedTimeMinutes,
                isOptional: step.isOptional,
            })
        } else {
            form.reset({
                instruction: "",
                estimatedTimeMinutes: null,
                isOptional: false,
            })
        }
    }

    const onSubmit = (values: StepFormValues) => {
        if (editingStepIndex !== null) {
            // Update existing step
            const updatedSteps = [...steps]
            updatedSteps[editingStepIndex] = {
                ...updatedSteps[editingStepIndex],
                ...values,
            }
            setSteps(updatedSteps)
            setEditingStepIndex(null)
        } else {
            // Create new step
            const newStep = {
                ...values,
                stepNumber: steps.length + 1,
            }
            setSteps([...steps, newStep])
            setIsAddingStep(false)
        }
        resetForm()
    }

    const handleDelete = (index: number) => {
        if (editingStepIndex === index) {
            setEditingStepIndex(null)
        }
        const updatedSteps = [...steps]
        updatedSteps.splice(index, 1)

        // Update step numbers for remaining steps
        updatedSteps.forEach((step, idx) => {
            step.stepNumber = idx + 1
        })

        setSteps(updatedSteps)
    }

    const handleMoveStep = (index: number, direction: "up" | "down") => {
        if ((direction === "up" && index === 0) || (direction === "down" && index === steps.length - 1)) {
            return
        }

        const updatedSteps = [...steps]
        const currentStep = updatedSteps[index]

        if (direction === "up") {
            // Swap with previous step
            const prevStep = updatedSteps[index - 1]

            // Swap step numbers
            const tempNumber = currentStep.stepNumber
            currentStep.stepNumber = prevStep.stepNumber
            prevStep.stepNumber = tempNumber

            // Swap positions in array
            updatedSteps[index] = prevStep
            updatedSteps[index - 1] = currentStep
        } else {
            // Swap with next step
            const nextStep = updatedSteps[index + 1]

            // Swap step numbers
            const tempNumber = currentStep.stepNumber
            currentStep.stepNumber = nextStep.stepNumber
            nextStep.stepNumber = tempNumber

            // Swap positions in array
            updatedSteps[index] = nextStep
            updatedSteps[index + 1] = currentStep
        }

        setSteps(updatedSteps)
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
                                <Button type="submit" size="sm">
                                    Add
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            ) : (
                <Button
                    onClick={() => {
                        setIsAddingStep(true)
                        resetForm()
                    }}
                    disabled={editingStepIndex !== null}
                    size="sm"
                    className="w-full"
                >
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
                        .map((step, index) => (
                            <div key={index} className="border rounded-md p-2">
                                {editingStepIndex === index ? (
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
                                                <Button type="button" variant="outline" size="sm" onClick={() => setEditingStepIndex(null)}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit" size="sm">
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
                                                onClick={() => handleMoveStep(index, "up")}
                                                disabled={index === 0}
                                            >
                                                <ArrowUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleMoveStep(index, "down")}
                                                disabled={index === steps.length - 1}
                                            >
                                                <ArrowDown className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => {
                                                    setEditingStepIndex(index)
                                                    resetForm(step)
                                                }}
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
                                                onClick={() => handleDelete(index)}
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