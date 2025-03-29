"use client"

import type { UseFormReturn } from "react-hook-form"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Checkbox } from "../../components/ui/checkbox"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Scale } from "lucide-react"
import { CourseType, CookingMethod } from "@server/types/recipe-types"
import { formatCourseType, formatCookingMethod } from "../../utils/format-utils"

interface RecipeDetailsSectionProps {
    form: UseFormReturn<any>
    scalingServings: number
    setScalingServings: (value: number) => void
}

export function RecipeDetailsSection({ form, scalingServings, setScalingServings }: RecipeDetailsSectionProps) {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Recipe Details</CardTitle>
                    <CardDescription>Basic information about your recipe</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    <span className="flex items-center space-x-1">
                                        <span>Recipe Name</span>
                                        <span className="text-destructive">*</span>
                                    </span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea {...field} value={field.value || ""} className="h-20 resize-none" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="servingSize"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <span className="flex items-center space-x-1">
                                            <span>Serving Size</span>
                                            <span className="text-destructive">*</span>
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => {
                                                const value = Number(e.target.value)
                                                field.onChange(value)
                                                setScalingServings(value)
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="courseType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <span className="flex items-center space-x-1">
                                            <span>Course Type</span>
                                            <span className="text-destructive">*</span>
                                        </span>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select course type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(CourseType).map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {formatCourseType(type)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="preparationTimeMinutes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prep Time</FormLabel>
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
                            name="cookingTimeMinutes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cook Time</FormLabel>
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
                            name="totalTimeMinutes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Time</FormLabel>
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="cookingMethod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cooking Method</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || undefined} defaultValue={undefined}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {Object.values(CookingMethod).map((method) => (
                                                <SelectItem key={method} value={method}>
                                                    {formatCookingMethod(method)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cookingEquipment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Equipment</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <FormField
                            control={form.control}
                            name="hasOnionGarlic"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div>
                                        <FormLabel>Contains Onion/Garlic</FormLabel>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isGlutenFree"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div>
                                        <FormLabel>Gluten Free</FormLabel>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isVegan"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div>
                                        <FormLabel>Vegan</FormLabel>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tags</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value || ""} placeholder="Separate tags with commas" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="submittedBy"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Submitted By</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                    <Textarea {...field} value={field.value || ""} className="h-20 resize-none" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            {/* Scaling Preview Card */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                        <Scale className="mr-2 h-5 w-5" />
                        Recipe Scaling Preview
                    </CardTitle>
                    <CardDescription>See how your recipe scales for different serving sizes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-4">
                        <div className="space-y-1">
                            <label htmlFor="previewServingSize" className="text-sm font-medium">
                                Preview Serving Size
                            </label>
                            <Input
                                id="previewServingSize"
                                type="number"
                                min="1"
                                className="w-32"
                                value={scalingServings}
                                onChange={(e) => {
                                    const value = Number.parseInt(e.target.value, 10)
                                    if (!isNaN(value) && value > 0) {
                                        setScalingServings(value)
                                    }
                                }}
                            />
                        </div>

                        <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Scaling factor:</span>{" "}
                            {form.getValues().servingSize > 0 ? (scalingServings / form.getValues().servingSize).toFixed(2) : "1.00"}x
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}