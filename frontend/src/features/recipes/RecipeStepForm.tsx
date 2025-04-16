"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Checkbox } from "../../components/ui/checkbox"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Plus, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react"
import { useRecipeStepsList } from "../../hooks/useRecipeSteps"
import type { CreateRecipeStepInput, UpdateRecipeStepInput } from "@server/types/recipe-types"
import { useToast } from "../../hooks/use-toast"

interface RecipeStepFormProps {
    recipeId: number
    onComplete?: () => void
}

export function RecipeStepForm({ recipeId, onComplete }: RecipeStepFormProps) {
    const { toast } = useToast()
    const { useStepsList, useCreateStep, useUpdateStep, useDeleteStep } = useRecipeStepsList()

    const { data: steps, isLoading } = useStepsList(recipeId)
    const createStepMutation = useCreateStep(onComplete)
    const updateStepMutation = useUpdateStep(recipeId, onComplete)
    const deleteStepMutation = useDeleteStep(recipeId, onComplete)

    const [newStep, setNewStep] = useState<CreateRecipeStepInput>({
        recipeId,
        stepNumber: 1,
        instruction: "",
        estimatedTimeMinutes: null,
        isOptional: false,
    })

    // Update step number when steps change
    useEffect(() => {
        if (steps && steps.length > 0) {
            setNewStep((prev) => ({
                ...prev,
                stepNumber: steps.length + 1,
            }))
        } else {
            setNewStep((prev) => ({
                ...prev,
                stepNumber: 1,
            }))
        }
    }, [steps])

    const handleAddStep = async () => {
        if (!newStep.instruction.trim()) {
            toast({
                title: "Error",
                description: "Step instruction is required",
                variant: "destructive",
            })
            return
        }

        try {
            await createStepMutation.mutateAsync(newStep)
            setNewStep({
                recipeId,
                stepNumber: (steps?.length || 0) + 2,
                instruction: "",
                estimatedTimeMinutes: null,
                isOptional: false,
            })
        } catch (error) {
            console.error("Error adding step:", error)
        }
    }

    const handleUpdateStep = async (id: number, data: UpdateRecipeStepInput) => {
        try {
            await updateStepMutation.mutateAsync({ id, data })
        } catch (error) {
            console.error("Error updating step:", error)
        }
    }

    const handleDeleteStep = async (id: number) => {
        try {
            await deleteStepMutation.mutateAsync(id)
        } catch (error) {
            console.error("Error deleting step:", error)
        }
    }

    const handleMoveStep = async (id: number, currentIndex: number, direction: "up" | "down") => {
        if (!steps) return

        const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

        if (newIndex < 0 || newIndex >= steps.length) return

        const currentStep = steps[currentIndex]
        const targetStep = steps[newIndex]

        // Swap step numbers
        await updateStepMutation.mutateAsync({
            id: currentStep.id,
            data: { stepNumber: targetStep.stepNumber },
        })

        await updateStepMutation.mutateAsync({
            id: targetStep.id,
            data: { stepNumber: currentStep.stepNumber },
        })
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Recipe Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {steps && steps.length > 0 ? (
                        <div className="space-y-4">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-start gap-2 p-4 border rounded-md">
                                    <div className="font-bold w-8 text-center pt-2">{step.stepNumber}.</div>
                                    <div className="flex-1 space-y-2">
                                        <Textarea
                                            value={step.instruction}
                                            onChange={(e) => handleUpdateStep(step.id, { instruction: e.target.value })}
                                            placeholder="Step instruction"
                                        />
                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor={`time-${step.id}`}>Time (minutes):</Label>
                                                <Input
                                                    id={`time-${step.id}`}
                                                    type="number"
                                                    className="w-20"
                                                    value={step.estimatedTimeMinutes || ""}
                                                    onChange={(e) =>
                                                        handleUpdateStep(step.id, {
                                                            estimatedTimeMinutes: e.target.value ? Number.parseInt(e.target.value) : null,
                                                        })
                                                    }
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`optional-${step.id}`}
                                                    checked={step.isOptional}
                                                    onCheckedChange={(checked) => handleUpdateStep(step.id, { isOptional: checked === true })}
                                                />
                                                <Label htmlFor={`optional-${step.id}`}>Optional step</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleMoveStep(step.id, index, "up")}
                                            disabled={index === 0}
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleMoveStep(step.id, index, "down")}
                                            disabled={index === steps.length - 1}
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleDeleteStep(step.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground">No steps added yet. Add your first step below.</div>
                    )}

                    <div className="border-t pt-4">
                        <h3 className="font-medium mb-2">Add New Step</h3>
                        <div className="flex items-start gap-2">
                            <div className="font-bold w-8 text-center pt-2">{newStep.stepNumber}.</div>
                            <div className="flex-1 space-y-2">
                                <Textarea
                                    value={newStep.instruction}
                                    onChange={(e) => setNewStep({ ...newStep, instruction: e.target.value })}
                                    placeholder="Enter step instruction"
                                />
                                <div className="flex flex-wrap gap-4 items-center">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="new-time">Time (minutes):</Label>
                                        <Input
                                            id="new-time"
                                            type="number"
                                            className="w-20"
                                            value={newStep.estimatedTimeMinutes || ""}
                                            onChange={(e) =>
                                                setNewStep({
                                                    ...newStep,
                                                    estimatedTimeMinutes: e.target.value ? Number.parseInt(e.target.value) : null,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="new-optional"
                                            checked={newStep.isOptional}
                                            onCheckedChange={(checked) => setNewStep({ ...newStep, isOptional: checked === true })}
                                        />
                                        <Label htmlFor="new-optional">Optional step</Label>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={handleAddStep} disabled={createStepMutation.isPending || !newStep.instruction.trim()}>
                                {createStepMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Plus className="h-4 w-4 mr-2" />
                                )}
                                Add
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}