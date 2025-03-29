"use client"

import { Link } from "@tanstack/react-router"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ChefHat, Utensils, Edit, Trash2, Users, Tag, Leaf, Wheat, AlertCircle } from "lucide-react"
import type { Recipe, CourseType } from "@server/types/recipe-types"
import { getCourseTypeLabel } from "../../utils/format-utils"

// Helper function to format time
const formatTime = (minutes: number | null | undefined): string => {
    if (!minutes) return "N/A"

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
        return `${hours}h ${mins > 0 ? `${mins}m` : ""}`
    }
    return `${mins}m`
}

// Remove these helper functions since they're now imported
// const getCourseTypeLabel = (courseType: CourseType): string => {
//   switch (courseType) {
//     case "MAIN_COURSE": return "Main Course";
//     case "SIDE_DISH": return "Side Dish";
//     case "APPETIZER": return "Appetizer";
//     case "DESSERT": return "Dessert";
//     case "BEVERAGE": return "Beverage";
//     case "BREAKFAST": return "Breakfast";
//     case "SNACK": return "Snack";
//     default: return courseType;
//   }
// };

// Helper function to get badge color based on course type
const getCourseBadgeColor = (courseType: CourseType): string => {
    switch (courseType) {
        case "MAIN_COURSE":
            return "bg-primary text-primary-foreground"
        case "SIDE_DISH":
            return "bg-secondary text-secondary-foreground"
        case "APPETIZER":
            return "bg-orange-500 text-white"
        case "DESSERT":
            return "bg-pink-500 text-white"
        case "BEVERAGE":
            return "bg-blue-500 text-white"
        case "BREAKFAST":
            return "bg-yellow-500 text-white"
        case "SNACK":
            return "bg-green-500 text-white"
        default:
            return "bg-gray-500 text-white"
    }
}

interface RecipeCardProps {
    recipe: Recipe
    onDelete?: (id: number) => void
    showActions?: boolean
}

export function RecipeCard({ recipe, onDelete, showActions = true }: RecipeCardProps) {
    const {
        id,
        name,
        description,
        servingSize,
        preparationTimeMinutes,
        cookingTimeMinutes,
        totalTimeMinutes,
        courseType,
        isVegan,
        isGlutenFree,
        hasOnionGarlic,
        submittedBy,
        tags,
    } = recipe

    // Calculate total time (use provided total or sum of prep + cooking)
    const displayTotalTime = totalTimeMinutes || (preparationTimeMinutes || 0) + (cookingTimeMinutes || 0) || null

    // Format tags for display
    const tagList = tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : []

    return (
        <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge className={`mb-2 ${getCourseBadgeColor(courseType)}`}>{getCourseTypeLabel(courseType)}</Badge>
                        <CardTitle className="text-xl">{name}</CardTitle>
                    </div>
                </div>
                {submittedBy && (
                    <CardDescription className="flex items-center gap-1 text-sm">
                        <ChefHat className="h-3.5 w-3.5" />
                        <span>By {submittedBy}</span>
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="flex-grow">
                {description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>}

                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{servingSize} servings</span>
                    </div>

                    {displayTotalTime && (
                        <div className="flex items-center gap-1.5 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatTime(displayTotalTime)}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                    {isVegan && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Leaf className="h-3 w-3 mr-1" />
                            Vegan
                        </Badge>
                    )}

                    {isGlutenFree && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <Wheat className="h-3 w-3 mr-1" />
                            Gluten-Free
                        </Badge>
                    )}

                    {hasOnionGarlic && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Contains Onion/Garlic
                        </Badge>
                    )}
                </div>

                {tagList.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {tagList.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                            </Badge>
                        ))}
                        {tagList.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                                +{tagList.length - 3} more
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2 flex justify-between">
                {/* Add a console.log to check the recipe ID */}
                <Link to={`/recipes/${id}`}>
                    <Button variant="secondary" size="sm">
                        <Utensils className="h-4 w-4 mr-2" />
                        View Recipe
                    </Button>
                </Link>

                {showActions && (
                    <div className="flex gap-2">
                        <Link to={`/recipes/${id}/edit`}>
                            <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                        </Link>

                        {onDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => onDelete(id)}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        )}
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}