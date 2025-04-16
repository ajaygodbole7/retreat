"use client";

import type React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams, Link } from "@tanstack/react-router";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "../../components/ui/card"; // Assuming path is correct
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { Loader2, Plus, Trash2, Edit, Save, ArrowLeft, ChevronsUpDown, Check, X } from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger
} from "../../components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from "../../components/ui/command";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils"; // Assuming path is correct

import { ingredientService } from "../../services/ingredient-service"; // Assuming path is correct
import { unitService } from "../../services/unit-service"; // Assuming path is correct
import { formatQuantity } from "../../utils/format-utils"; // Assuming path is correct
import { ensureArray } from "../../utils/array-utils"; // Assuming path is correct
import { useRecipe, useCreateCompleteRecipe, useUpdateCompleteRecipe } from "../../hooks/useRecipes"; // Assuming path is correct
import type { RecipeIngredient, RecipeStep, CreateRecipeInput, UpdateRecipeInput } from "@server/types/recipe-types"; // Assuming path is correct
import type { Ingredient } from "@server/types/ingredient-types"; // Assuming path is correct
import type { UnitOfMeasure } from "@server/types/ingredient-types"; // Assuming path is correct

// --- Enums ---
enum CourseType {
    MAIN_COURSE = "MAIN_COURSE",
    SIDE_DISH = "SIDE_DISH",
    APPETIZER = "APPETIZER",
    DESSERT = "DESSERT",
    BREAKFAST = "BREAKFAST",
    SNACK = "SNACK",
    BEVERAGE = "BEVERAGE",
}

enum CookingMethod {
    STOVETOP = "STOVETOP",
    OVEN = "OVEN",
    PRESSURE_COOKER = "PRESSURE_COOKER",
    SLOW_COOK = "SLOW_COOK",
    STEAM = "STEAM",
    NO_COOK = "NO_COOK",
}

// --- Defaults ---
const DEFAULT_BASE_SERVING_SIZE = 8;

const defaultRecipe: Partial<CreateRecipeInput> = {
    name: "",
    description: "",
    servingSize: DEFAULT_BASE_SERVING_SIZE, // Represents the base yield, editable by user
    preparationTimeMinutes: 15,
    cookingTimeMinutes: 30,
    courseType: "MAIN_COURSE",
    cookingMethod: "STOVETOP",
    isVegan: false,
    isGlutenFree: false,
    hasOnionGarlic: false,
    tags: "",
    notes: "",
    submittedBy: "",
};

const defaultNewIngredient: Partial<RecipeIngredient> = {
    quantity: 1,
    displayOrder: 0,
    isOptional: false,
    notes: "",
    preparation: "",
    ingredientId: undefined,
    unitId: undefined,
};

const defaultNewStep: Partial<RecipeStep> = {
    stepNumber: 0,
    instruction: "",
    isOptional: false,
    estimatedTimeMinutes: undefined,
};

// --- Reusable Combobox Component ---
interface ComboboxOption {
    value: string; // Store ID as string for consistency in CommandItem
    label: string;
}

interface SimpleComboboxProps {
    options: ComboboxOption[];
    value?: string; // Current selected value (ID as string)
    onChange: (value: string | undefined) => void; // Function to call when selection changes
    placeholder: string; // Placeholder text when nothing is selected
    searchPlaceholder: string; // Placeholder for the search input inside the popover
    notFoundText: string; // Text to show when search yields no results
    disabled?: boolean; // Whether the combobox is disabled
}

function SimpleCombobox({
    options,
    value,
    onChange,
    placeholder,
    searchPlaceholder,
    notFoundText,
    disabled = false
}: SimpleComboboxProps) {
    const [open, setOpen] = useState(false); // State to control if the popover is open

    // Find the label corresponding to the currently selected value for display
    const selectedLabel = useMemo(() => {
        return options.find((option) => option.value === value)?.label;
    }, [options, value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {/* The button that triggers the popover */}
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal text-sm" // Smaller text for denser forms
                    disabled={disabled}
                >
                    {/* Show selected label or placeholder */}
                    {selectedLabel || <span className="text-muted-foreground">{placeholder}</span>}
                    {/* Up/down arrows icon */}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                {/* Content inside the popover */}
                <Command>
                    {/* Search input */}
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        {/* Message when no results found */}
                        <CommandEmpty>{notFoundText}</CommandEmpty>
                        {/* Group of selectable items */}
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label} // Value used for searching (based on label)
                                    onSelect={(currentLabel) => {
                                        // Find the option corresponding to the selected label
                                        const newValue = options.find(opt => opt.label.toLowerCase() === currentLabel.toLowerCase())?.value;
                                        // Call the onChange handler with the selected value (ID)
                                        onChange(newValue === value ? undefined : newValue); // Allow deselect? Or just select
                                        setOpen(false); // Close the popover on selection
                                    }}
                                >
                                    {/* Checkmark icon for the selected item */}
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {/* Display the item label */}
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}


// --- Main RecipeForm Component ---
export function RecipeForm() {
    // --- Router Hooks ---
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const isEditRoute = pathname.includes("/edit");
    const params = useParams({ from: isEditRoute ? "/recipes/$recipeId/edit" : "/recipes/new" });
    const navigate = useNavigate();
    const { recipeId } = params;
    const numericRecipeId = recipeId && recipeId !== "new" ? Number.parseInt(recipeId) : undefined;
    const isEditMode = !!numericRecipeId && !isNaN(numericRecipeId);

    // --- State Declarations ---
    const [recipe, setRecipe] = useState<Partial<CreateRecipeInput | UpdateRecipeInput>>(defaultRecipe);
    const [ingredients, setIngredients] = useState<Partial<RecipeIngredient>[]>([]);
    const [steps, setSteps] = useState<Partial<RecipeStep>[]>([]);

    // State for the base serving size the recipe yields (EDITABLE BY USER)
    const [baseServingSize, setBaseServingSize] = useState<number>(DEFAULT_BASE_SERVING_SIZE);
    // State for the target serving size for PREVIEW scaling (Temporary UI value)
    const [previewServingSize, setPreviewServingSize] = useState<number>(DEFAULT_BASE_SERVING_SIZE);

    // State for the inline ingredient add/edit form
    const [newIngredient, setNewIngredient] = useState<Partial<RecipeIngredient>>(defaultNewIngredient);
    const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null); // Index of ingredient being edited, or null

    // State for the inline step add/edit form
    const [newStepInstruction, setNewStepInstruction] = useState<string>("");
    const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null); // Index of step being edited, or null
    const [editingStepInstruction, setEditingStepInstruction] = useState<string>(""); // Instruction content while editing

    // State to hold the calculated scaled ingredients based on baseServingSize and previewServingSize
    const [scaledIngredients, setScaledIngredients] = useState<Partial<RecipeIngredient>[]>([]);

    // State for loading indicators and error messages
    const [isLoading, setIsLoading] = useState(false); // For loading reference data (ingredients, units)
    const [isSaving, setIsSaving] = useState(false); // For save button loading state
    const [loadError, setLoadError] = useState<Error | null>(null); // For errors loading reference data

    // State to store reference data fetched from backend
    const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
    const [allUnits, setAllUnits] = useState<UnitOfMeasure[]>([]);

    // --- API Hooks (TanStack Query or similar) ---
    // Hook to fetch recipe data in edit mode
    const { data: recipeData, isLoading: isLoadingRecipe, error: recipeError } = useRecipe(numericRecipeId || 0, { enabled: isEditMode && !!numericRecipeId });
    // Hooks to send data to the backend for creating or updating
    const createCompleteMutation = useCreateCompleteRecipe();
    const updateCompleteMutation = useUpdateCompleteRecipe();

    // --- Effects ---

    // Effect to load reference data (ingredients and units) when the component mounts
    useEffect(() => {
        const loadReferenceData = async () => {
            setIsLoading(true);
            try {
                // Fetch both ingredients and units concurrently
                const [ingredientsData, unitsData] = await Promise.all([
                    ingredientService.getAll(),
                    unitService.getAll()
                ]);
                // Sort them alphabetically for better display in comboboxes
                setAllIngredients(ingredientsData.sort((a, b) => a.name.localeCompare(b.name)));
                setAllUnits(unitsData.sort((a, b) => a.name.localeCompare(b.name)));
            } catch (error) {
                console.error("Error loading reference data:", error);
                setLoadError(error instanceof Error ? error : new Error("Failed to load reference data"));
            } finally {
                setIsLoading(false); // Stop loading indicator
            }
        };
        loadReferenceData();
    }, []); // Empty dependency array means this runs only once on mount

    // Effect to populate the form state when editing an existing recipe
    useEffect(() => {
        if (isEditMode && recipeData) {
            // Destructure data received from the backend hook
            const { recipeIngredients = [], steps: recipeSteps = [], tags, servingSize, ...recipeDetails } = recipeData;

            // Set base recipe details (name, description, times, etc.)
            setRecipe({ ...recipeDetails, tags: tags || "" }); // Ensure tags is a string

            // *** CRITICAL: Set the editable baseServingSize from the loaded recipe ***
            const loadedBaseSize = servingSize ?? DEFAULT_BASE_SERVING_SIZE;
            setBaseServingSize(loadedBaseSize);
            // Set the preview size to match the base size initially when loading
            setPreviewServingSize(loadedBaseSize);

            // Set ingredients and steps, ensuring they are arrays and sorted
            const sortedIngredients = ensureArray(recipeIngredients).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
            setIngredients(sortedIngredients);
            setSteps(ensureArray(recipeSteps).sort((a, b) => a.stepNumber - b.stepNumber));
        } else if (!isEditMode) {
            // If navigating to 'new' or data clears, reset the form to defaults
            setRecipe(defaultRecipe);
            setBaseServingSize(DEFAULT_BASE_SERVING_SIZE);
            setPreviewServingSize(DEFAULT_BASE_SERVING_SIZE);
            setIngredients([]);
            setSteps([]);
        }
    }, [isEditMode, recipeData]); // Runs when mode changes or recipeData arrives/changes

    // *** CRITICAL Effect: Calculate Scaled Ingredients for Preview ***
    // Runs whenever the original ingredients, base serving size, or preview serving size changes
    useEffect(() => {
        // Calculate the scaling factor
        const scaleFactor = baseServingSize > 0 ? previewServingSize / baseServingSize : 0; // Avoid division by zero

        // Create a new array of ingredients with scaled quantities
        const scaled = ingredients.map((ing) => ({
            ...ing, // Copy all properties (id, unitId, name, etc.)
            quantity: ing.quantity ? ing.quantity * scaleFactor : 0, // Apply scale factor to quantity
        }));
        // Update the state used for the preview display
        setScaledIngredients(scaled);
    }, [previewServingSize, baseServingSize, ingredients]); // Dependencies: recalculate if any of these change

    // --- Tag Management State & Effect ---
    const [tagList, setTagList] = useState<string[]>([]);
    const [currentTagInput, setCurrentTagInput] = useState("");

    // Effect to synchronize the `tagList` array with the `recipe.tags` comma-separated string
    useEffect(() => {
        setTagList(recipe.tags ? recipe.tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    }, [recipe.tags]);

    // --- Data Transformation for Comboboxes ---
    // Memoize options to avoid recalculating on every render unless source data changes
    const ingredientOptions = useMemo((): ComboboxOption[] =>
        allIngredients.map(ing => ({ value: ing.id.toString(), label: ing.name })),
        [allIngredients]
    );

    const unitOptions = useMemo((): ComboboxOption[] =>
        allUnits.map(unit => ({ value: unit.id.toString(), label: `${unit.name} (${unit.abbreviation || 'unit'})` })),
        [allUnits]
    );

    // --- Handlers ---

    // Handler for adding a new tag
    const handleAddTag = () => {
        const newTag = currentTagInput.trim().toLowerCase(); // Normalize tag
        if (newTag && !tagList.includes(newTag)) {
            const updatedTags = [...tagList, newTag];
            setTagList(updatedTags);
            // Update the recipe state's tag string
            setRecipe(prev => ({ ...prev, tags: updatedTags.join(', ') }));
            setCurrentTagInput(""); // Clear the input field
        } else {
            setCurrentTagInput(""); // Clear input even if tag exists or is empty
        }
    };

    // Handler for removing a tag
    const handleRemoveTag = (tagToRemove: string) => {
        const updatedTags = tagList.filter(tag => tag !== tagToRemove);
        setTagList(updatedTags);
        // Update the recipe state's tag string
        setRecipe(prev => ({ ...prev, tags: updatedTags.join(', ') }));
    };

    // Generic handler for simple text/textarea input changes in the main recipe section
    const handleRecipeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRecipe((prev) => ({ ...prev, [name]: value }));
    };

    // Handler for checkbox changes in the main recipe section
    const handleCheckboxChange = (name: string, checked: boolean) => {
        setRecipe((prev) => ({ ...prev, [name]: checked }));
    };

    // Handler for select dropdown changes in the main recipe section
    const handleSelectChange = (name: string, value: string) => {
        setRecipe((prev) => ({ ...prev, [name]: value }));
    };

    // *** UPDATED Handler for all numeric inputs in the main recipe section ***
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let numValue: number | undefined = undefined;

        // Try parsing only if the input is not empty
        if (value !== "") {
            const parsed = Number.parseFloat(value); // Use parseFloat to allow decimals if needed
            if (!isNaN(parsed)) {
                numValue = parsed; // Store the parsed number if valid
            }
        }

        // Update specific state based on the input's name attribute
        if (name === 'baseServingSize') {
            // Update the base serving size state, ensuring it's at least 1
            setBaseServingSize(numValue !== undefined && numValue >= 1 ? numValue : 1);
        } else if (name === 'previewServingSize') {
            // Update the preview serving size state, ensuring it's at least 1
            setPreviewServingSize(numValue !== undefined && numValue >= 1 ? numValue : 1);
        } else {
            // Handle other numeric recipe fields like prepTime, cookTime
            // Allow undefined if the input is cleared (for optional fields)
            setRecipe((prev) => ({ ...prev, [name]: numValue }));
        }
    };

    // --- Ingredient Inline Handlers ---

    // Handler for changes within the inline ingredient add/edit form
    const handleNewIngredientChange = (field: keyof RecipeIngredient, value: any) => {
        // Special handling for numeric fields to ensure correct type
        if (field === 'quantity' || field === 'displayOrder') {
            const numValue = value === '' ? undefined : parseFloat(value);
            setNewIngredient(prev => ({ ...prev, [field]: isNaN(numValue as number) ? undefined : numValue }));
        } else if (field === 'ingredientId' || field === 'unitId' || field === 'alternateIngredientId') {
            const numValue = value === '' || value === undefined ? undefined : parseInt(value, 10);
            setNewIngredient(prev => ({ ...prev, [field]: isNaN(numValue as number) ? undefined : numValue }));
        } else {
            // For text fields like preparation, notes
            setNewIngredient(prev => ({ ...prev, [field]: value }));
        }
    };

    // Handler for the "Add Ingredient" / "Update Ingredient" button
    const handleSaveOrUpdateIngredient = () => {
        // Basic validation for required fields in the inline form
        if (!newIngredient.ingredientId || !newIngredient.unitId || newIngredient.quantity === undefined || newIngredient.quantity <= 0) {
            alert("Please provide a valid Quantity (>0), Unit, and Ingredient name.");
            console.warn("Missing or invalid required ingredient fields:", newIngredient);
            return;
        }

        // Prepare the data to be saved, ensuring correct types
        const ingredientToSave: Partial<RecipeIngredient> = {
            ...newIngredient,
            quantity: Number(newIngredient.quantity),
            ingredientId: Number(newIngredient.ingredientId),
            unitId: Number(newIngredient.unitId),
            displayOrder: newIngredient.displayOrder ? Number(newIngredient.displayOrder) : undefined,
            alternateIngredientId: newIngredient.alternateIngredientId ? Number(newIngredient.alternateIngredientId) : undefined,
        };

        if (editingIngredientIndex !== null) {
            // --- UPDATE existing ingredient ---
            const updatedIngredients = [...ingredients];
            // Preserve the original ID (if it exists from backend) and merge changes
            updatedIngredients[editingIngredientIndex] = { ...ingredients[editingIngredientIndex], ...ingredientToSave };
            // Update the main ingredients list, keeping it sorted by displayOrder
            setIngredients(updatedIngredients.sort((a, b) => (a.displayOrder ?? Infinity) - (b.displayOrder ?? Infinity)));
            setEditingIngredientIndex(null); // Exit edit mode
        } else {
            // --- ADD new ingredient ---
            // Assign the next available display order if not explicitly set
            ingredientToSave.displayOrder = ingredientToSave.displayOrder ?? (ingredients.length > 0 ? Math.max(...ingredients.map(i => i.displayOrder ?? 0)) : 0) + 1;
            // Add the new ingredient to the list and keep sorted
            setIngredients(prev => [...prev, ingredientToSave].sort((a, b) => (a.displayOrder ?? Infinity) - (b.displayOrder ?? Infinity)));
        }
        setNewIngredient(defaultNewIngredient); // Reset the inline form fields
    };

    // Handler when the "Edit" button next to an ingredient is clicked
    const handleEditIngredientClick = (index: number) => {
        const ingredientToEdit = { ...ingredients[index] };
        // Load the data of the clicked ingredient into the inline form's state
        // Ensure IDs are strings if the SimpleCombobox expects string values
        setNewIngredient({
            ...ingredientToEdit,
            ingredientId: ingredientToEdit.ingredientId?.toString(),
            unitId: ingredientToEdit.unitId?.toString(),
            alternateIngredientId: ingredientToEdit.alternateIngredientId?.toString(),
        });
        setEditingIngredientIndex(index); // Set the index being edited
        // Scroll the inline form into view for better UX
        document.getElementById('ingredient-inline-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    // Handler for the "Cancel Edit" button in the inline ingredient form
    const handleCancelEditIngredient = () => {
        setEditingIngredientIndex(null); // Clear the editing index
        setNewIngredient(defaultNewIngredient); // Reset the form
    };

    // Handler when the "Delete" button next to an ingredient is clicked (after confirmation)
    const handleDeleteIngredient = (indexToDelete: number) => {
        // Filter out the ingredient at the specified index
        setIngredients(prev => prev.filter((_, index) => index !== indexToDelete));
        // If the deleted item was the one being edited, cancel the edit mode
        if (editingIngredientIndex === indexToDelete) {
            handleCancelEditIngredient();
        }
    };

    // --- Utility Functions to get names from IDs (memoized for performance) ---
    const getIngredientName = useCallback((id: number | undefined): string => {
        return allIngredients.find(ing => ing.id === id)?.name || "Unknown Ing.";
    }, [allIngredients]);

    const getUnitName = useCallback((id: number | undefined): string => {
        const unit = allUnits.find(u => u.id === id);
        return unit ? (unit.abbreviation || unit.name) : "";
    }, [allUnits]);


    // --- Step Inline Handlers ---

    // Handler for the "Add Step" button
    const handleAddStep = () => {
        if (!newStepInstruction.trim()) return; // Ignore if instruction is empty
        // Determine the next step number
        const nextStepNumber = (steps.length > 0 ? Math.max(...steps.map(s => s.stepNumber ?? 0)) : 0) + 1;
        // Create the new step object
        const newStep: Partial<RecipeStep> = {
            ...defaultNewStep,
            instruction: newStepInstruction.trim(),
            stepNumber: nextStepNumber,
        };
        // Add the new step to the list and keep sorted
        setSteps(prev => [...prev, newStep].sort((a, b) => (a.stepNumber ?? 0) - (b.stepNumber ?? 0)));
        setNewStepInstruction(""); // Clear the input textarea
    };

    // Handler when the "Edit" button next to a step is clicked
    const handleEditStepClick = (index: number) => {
        setEditingStepIndex(index); // Set the index being edited
        // Load the current instruction into the editing state
        setEditingStepInstruction(steps[index]?.instruction || "");
    };

    // Handler for the "Save Step" button during inline step editing
    const handleSaveStepUpdate = (index: number) => {
        // Save only if the instruction is not empty and we are editing the correct index
        if (editingStepInstruction.trim() && editingStepIndex === index) {
            const updatedSteps = [...steps];
            // Update the instruction for the step at the editing index
            updatedSteps[index] = { ...updatedSteps[index], instruction: editingStepInstruction.trim() };
            setSteps(updatedSteps); // Update the main steps list
            // Exit edit mode
            setEditingStepIndex(null);
            setEditingStepInstruction("");
        }
    };

    // Handler for the "Cancel" button during inline step editing
    const handleCancelStepUpdate = () => {
        setEditingStepIndex(null); // Clear editing index
        setEditingStepInstruction(""); // Clear editing instruction
    };

    // Handler when the "Delete" button next to a step is clicked (after confirmation)
    const handleDeleteStep = (indexToDelete: number) => {
        setSteps(prev => {
            // Filter out the deleted step
            const remainingSteps = prev.filter((_, index) => index !== indexToDelete);
            // Renumber the remaining steps sequentially
            return remainingSteps.map((step, index) => ({
                ...step,
                stepNumber: index + 1,
            })); // Sort shouldn't be needed here as filter preserves order if original was sorted
        });
        // If the deleted step was the one being edited, cancel edit mode
        if (editingStepIndex === indexToDelete) {
            handleCancelStepUpdate();
        }
    };


    // --- Save/Cancel Form ---

    // Handler for the main "Save Recipe" / "Update Recipe" button
    const saveRecipe = async () => {
        setIsSaving(true); // Show loading indicator on button

        // --- Prepare final data package for the backend ---
        const finalRecipeData = {
            recipe: {
                ...recipe,
                // *** CRITICAL: Ensure the editable baseServingSize is included in the saved data ***
                servingSize: baseServingSize,
                tags: tagList.join(', ') // Ensure tags are saved as a string
            },
            // Clean and format ingredients array
            ingredients: ingredients
                .filter(ing => ing.ingredientId && ing.unitId && ing.quantity && ing.quantity > 0) // Filter out incomplete/invalid ingredients
                .map(ing => ({
                    // Ensure all required fields are present and numbers are numbers
                    ...ing,
                    quantity: Number(ing.quantity),
                    ingredientId: Number(ing.ingredientId),
                    unitId: Number(ing.unitId),
                    displayOrder: Number(ing.displayOrder ?? 0), // Default order if missing
                    alternateIngredientId: ing.alternateIngredientId ? Number(ing.alternateIngredientId) : undefined,
                })),
            // Clean and format steps array
            steps: steps
                .filter(step => step.instruction && step.stepNumber) // Filter out incomplete steps
                .map(step => ({
                    ...step,
                    stepNumber: Number(step.stepNumber) // Ensure stepNumber is a number
                })),
        };

        // --- Basic Frontend Validation ---
        if (!finalRecipeData.recipe.name) {
            alert("Recipe Name is required."); setIsSaving(false); return; // Stop saving
        }
        if (finalRecipeData.ingredients.length === 0) {
            alert("At least one valid ingredient is required."); setIsSaving(false); return;
        }
        if (finalRecipeData.steps.length === 0) {
            alert("At least one preparation step is required."); setIsSaving(false); return;
        }
        // *** CRITICAL Validation: Ensure base serving size is valid ***
        if (!finalRecipeData.recipe.servingSize || finalRecipeData.recipe.servingSize <= 0) {
            alert("Recipe Yields (Servings) must be greater than 0."); setIsSaving(false); return;
        }


        // --- Call Backend API ---
        try {
            if (isEditMode && numericRecipeId) {
                // Call the update mutation hook
                await updateCompleteMutation.mutateAsync({ id: numericRecipeId, data: finalRecipeData as any }); // Cast might be needed
            } else {
                // Call the create mutation hook
                await createCompleteMutation.mutateAsync(finalRecipeData as any); // Cast might be needed
            }
            // Navigate back to the recipes list on success
            navigate({ to: "/recipes" });
        } catch (error) {
            // Handle API errors
            console.error("Error saving recipe:", error);
            alert(`Error saving recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // Potentially show error message in the UI instead of alert
        } finally {
            setIsSaving(false); // Stop loading indicator on button
        }
    };

    // Handler for the "Cancel" button
    const handleCancel = () => {
        // Consider adding a confirmation dialog if changes have been made ("Are you sure?")
        if (isEditMode && numericRecipeId) {
            // Navigate back to the recipe view page
            navigate({ to: `/recipes/${numericRecipeId}` });
        } else {
            // Navigate back to the main recipes list
            navigate({ to: "/recipes" });
        }
    };

    // --- Render Logic ---

    // Display loading indicator while fetching recipe data or reference data
    if (isLoadingRecipe || isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Loading...</span>
            </div>
        )
    }

    // Display error message if loading failed in edit mode
    if (isEditMode && (recipeError || loadError)) {
        return (
            <div className="container mx-auto py-6 text-center text-destructive">
                <h2 className="text-2xl font-bold mb-4">Error Loading Recipe</h2>
                <p>{(recipeError || loadError)?.message || "There was a problem loading the recipe details."}</p>
                <Button onClick={() => navigate({ to: "/recipes" })} className="mt-4" variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Recipes
                </Button>
            </div>
        );
    }

    // --- JSX Structure ---
    return (
        <div className="container mx-auto py-6">
            {/* Header Section */}
            <div className="flex items-center gap-2 mb-6">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/recipes">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Recipes</span>
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">{isEditMode ? "Edit Recipe" : "Create New Recipe"}</h1>
            </div>

            {/* Main Form Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* === Card 1: Recipe Details === */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Recipe Details</CardTitle>
                        <CardDescription>Define the core recipe information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Recipe Name */}
                        <div>
                            <Label htmlFor="name">Recipe Name *</Label>
                            <Input id="name" name="name" value={recipe.name || ""} onChange={handleRecipeChange} placeholder="Enter recipe name" required />
                        </div>
                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" value={recipe.description || ""} onChange={handleRecipeChange} placeholder="Brief description of the dish" rows={3} />
                        </div>

                        {/* --- Serving Size Section (Updated) --- */}
                        <div className="grid grid-cols-2 gap-4 items-start">
                            {/* Base Serving Size (Editable) */}
                            <div>
                                <Label htmlFor="baseServingSize">Recipe Yields (Servings) *</Label>
                                <Input
                                    id="baseServingSize"
                                    name="baseServingSize" // Matches key used in handleNumberChange
                                    type="number"
                                    min="1"
                                    step="1" // Usually whole servings
                                    value={baseServingSize} // Controlled by baseServingSize state
                                    onChange={handleNumberChange}
                                    placeholder={`${DEFAULT_BASE_SERVING_SIZE}`}
                                    required
                                    className="h-9"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Servings the entered ingredients are for.</p>
                            </div>
                            {/* Preview Serving Size (For Scaling UI) */}
                            <div>
                                <Label htmlFor="previewServingSize">Preview Scaling For</Label>
                                <Input
                                    id="previewServingSize"
                                    name="previewServingSize" // Matches key used in handleNumberChange
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={previewServingSize} // Controlled by previewServingSize state
                                    onChange={handleNumberChange}
                                    placeholder="e.g., 50"
                                    className="h-9"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Target servings for preview below.</p>
                            </div>
                        </div>
                        {/* --- End Serving Size Section --- */}

                        {/* Prep & Cook Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="preparationTimeMinutes">Prep Time (min)</Label>
                                <Input id="preparationTimeMinutes" name="preparationTimeMinutes" type="number" min="0" value={recipe.preparationTimeMinutes ?? ""} onChange={handleNumberChange} placeholder="15" className="h-9" />
                            </div>
                            <div>
                                <Label htmlFor="cookingTimeMinutes">Cook Time (min)</Label>
                                <Input id="cookingTimeMinutes" name="cookingTimeMinutes" type="number" min="0" value={recipe.cookingTimeMinutes ?? ""} onChange={handleNumberChange} placeholder="30" className="h-9" />
                            </div>
                        </div>

                        {/* Course Type & Cooking Method */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="courseType">Course</Label>
                                <Select value={recipe.courseType?.toString() || ""} onValueChange={(value) => handleSelectChange("courseType", value)}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="Select course" /></SelectTrigger>
                                    <SelectContent>
                                        {/* Populate options from Enum */}
                                        {Object.entries(CourseType).map(([key, label]) => <SelectItem key={key} value={key}>{label.replace(/_/g, ' ')}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="cookingMethod">Method</Label>
                                <Select value={recipe.cookingMethod?.toString() || ""} onValueChange={(value) => handleSelectChange("cookingMethod", value)}>
                                    <SelectTrigger className="h-9"><SelectValue placeholder="Select method" /></SelectTrigger>
                                    <SelectContent>
                                        {/* Populate options from Enum */}
                                        {Object.entries(CookingMethod).map(([key, label]) => <SelectItem key={key} value={key}>{label.replace(/_/g, ' ')}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Dietary Information */}
                        <div className="space-y-2">
                            <Label>Dietary Information</Label>
                            <div className="flex flex-col space-y-1">
                                {/* Map through dietary flags for checkboxes */}
                                {(['isVegan', 'isGlutenFree', 'hasOnionGarlic'] as const).map(key => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={key}
                                            checked={recipe[key] || false}
                                            onCheckedChange={(checked) => handleCheckboxChange(key, checked === true)}
                                        />
                                        <Label htmlFor={key} className="font-normal text-sm">
                                            {/* User-friendly labels */}
                                            {key === 'isVegan' ? 'Vegan' : key === 'isGlutenFree' ? 'Gluten Free' : 'Contains Onion/Garlic'}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tags Input Section */}
                        <div>
                            <Label htmlFor="tags-input">Tags</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="tags-input"
                                    value={currentTagInput}
                                    onChange={(e) => setCurrentTagInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} // Add tag on Enter key
                                    placeholder="Add tags (press Enter)"
                                    className="flex-grow h-9"
                                />
                                <Button type="button" size="sm" onClick={handleAddTag} variant="outline">Add</Button>
                            </div>
                            {/* Display current tags as badges */}
                            <div className="mt-2 flex flex-wrap gap-1">
                                {tagList.map(tag => (
                                    <Badge key={tag} variant="secondary">
                                        {tag}
                                        {/* Remove button within the badge */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            aria-label={`Remove ${tag} tag`}
                                        >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Submitted By */}
                        <div>
                            <Label htmlFor="submittedBy">Submitted By</Label>
                            <Input id="submittedBy" name="submittedBy" value={recipe.submittedBy || ""} onChange={handleRecipeChange} placeholder="Your name (Optional)" className="h-9" />
                        </div>
                        {/* Recipe Notes */}
                        <div>
                            <Label htmlFor="notes">Recipe Notes</Label>
                            <Textarea id="notes" name="notes" value={recipe.notes || ""} onChange={handleRecipeChange} placeholder="Storage instructions, tips, variations (Optional)" rows={3} />
                        </div>
                    </CardContent>
                </Card>

                {/* === Card 2: Ingredients === */}
                <Card className="lg:col-span-2"> {/* Takes up 2/3 width on large screens */}
                    <CardHeader>
                        <CardTitle>Ingredients</CardTitle>
                        <CardDescription>
                            Quantities entered are for <span className="font-semibold">{baseServingSize}</span> {baseServingSize === 1 ? 'serving' : 'servings'}.
                            Scaled amounts shown are a preview for <span className="font-semibold">{previewServingSize}</span> {previewServingSize === 1 ? 'serving' : 'servings'}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Ingredient List Display Section */}
                        <div className="mb-6 border rounded-md divide-y">
                            {ingredients.length === 0 ? (
                                <p className="p-4 text-center text-sm text-muted-foreground">No ingredients added yet.</p>
                            ) : (
                                <>
                                    {/* Header Row for the ingredient list */}
                                    <div className="p-3 flex items-center gap-x-3 sm:gap-x-4 bg-muted/50 text-xs font-medium text-muted-foreground sticky top-0 z-10">
                                        <div className="text-right flex-shrink-0 w-16 sm:w-20">Original Qty ({baseServingSize})</div>
                                        <div className="flex-1">Ingredient</div>
                                        <div className="text-right flex-shrink-0 w-16 sm:w-20">Scaled Qty ({previewServingSize})</div>
                                        <div className="w-16 flex-shrink-0"> {/* Spacer for action buttons */} </div>
                                    </div>

                                    {/* Iterate over ingredients and display each row */}
                                    {ingredients.map((ing, index) => {
                                        // Find the corresponding scaled ingredient data for preview
                                        const scaledIng = scaledIngredients[index];
                                        // Safety check in case arrays get out of sync
                                        if (!scaledIng) {
                                            console.error("Mismatch between ingredients and scaledIngredients arrays at index", index);
                                            return null;
                                        }

                                        return (
                                            <div key={`ing-${ing.id || index}`} className="p-3 flex items-start gap-x-3 sm:gap-x-4 hover:bg-muted/30 transition-colors">
                                                {/* Column 1: Original Quantity & Unit */}
                                                <div className="text-sm text-right flex-shrink-0 w-16 sm:w-20 pt-0.5">
                                                    <span className="font-medium">{ing.quantity ? formatQuantity(ing.quantity) : '-'}</span>
                                                    <span className="ml-1 text-muted-foreground text-xs block sm:inline">{getUnitName(ing.unitId)}</span>
                                                </div>

                                                {/* Column 2: Ingredient Name & Details */}
                                                <div className="flex-1 text-sm">
                                                    <span className="font-semibold">{getIngredientName(ing.ingredientId)}</span>
                                                    {/* Display preparation instructions if present */}
                                                    {ing.preparation && <span className="text-xs text-muted-foreground italic">, {ing.preparation}</span>}
                                                    {/* Display 'Optional' badge if applicable */}
                                                    {ing.isOptional && <Badge variant="outline" className="ml-1 text-xs align-middle">Opt.</Badge>}
                                                    {/* Display notes if present */}
                                                    {ing.notes && <p className="text-xs text-muted-foreground mt-0.5">{ing.notes}</p>}
                                                </div>

                                                {/* Column 3: Scaled Quantity & Unit (Preview) */}
                                                <div className="text-sm text-right flex-shrink-0 w-16 sm:w-20 pt-0.5">
                                                    <span className="font-medium">{scaledIng.quantity ? formatQuantity(scaledIng.quantity) : '-'}</span>
                                                    {/* Unit typically stays the same during scaling */}
                                                    <span className="ml-1 text-muted-foreground text-xs block sm:inline">{getUnitName(ing.unitId)}</span>
                                                </div>

                                                {/* Column 4: Action Buttons */}
                                                <div className="flex space-x-1 flex-shrink-0 w-16 justify-end">
                                                    {/* Edit Button */}
                                                    <Button
                                                        variant="ghost" size="icon" className="h-7 w-7"
                                                        onClick={() => handleEditIngredientClick(index)}
                                                        disabled={editingIngredientIndex !== null} // Disable if another item is being edited
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">Edit Ingredient</span>
                                                    </Button>
                                                    {/* Delete Button (with confirmation dialog) */}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={editingIngredientIndex !== null}>
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                                <span className="sr-only">Delete Ingredient</span>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Ingredient?</AlertDialogTitle>
                                                                <AlertDialogDescription>Remove "{getIngredientName(ing.ingredientId)}" from the recipe? This cannot be undone.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                {/* Action calls the delete handler */}
                                                                <AlertDialogAction onClick={() => handleDeleteIngredient(index)}>Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>

                        {/* Inline Ingredient Add/Edit Form Section */}
                        <div id="ingredient-inline-form" className="border rounded-md p-4 space-y-3 bg-muted/30">
                            <h4 className="text-md font-semibold mb-2">
                                {editingIngredientIndex !== null ? `Editing: ${getIngredientName(ingredients[editingIngredientIndex]?.ingredientId)}` : 'Add New Ingredient'}
                            </h4>
                            {/* Layout for the inline form fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-x-4 gap-y-3 items-start">
                                {/* Left Column (Quantity, Unit, Optional, Order) */}
                                <div className="space-y-3">
                                    {/* Quantity & Unit side-by-side */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label htmlFor="newIngQuantity" className="text-xs mb-1 block">Qty*</Label>
                                            <Input id="newIngQuantity" type="number" step="any" min="0" placeholder="1" value={newIngredient.quantity ?? ""} onChange={(e) => handleNewIngredientChange('quantity', e.target.value)} className="h-9 text-sm" required />
                                        </div>
                                        <div>
                                            <Label htmlFor="newIngUnit" className="text-xs mb-1 block">Unit*</Label>
                                            {/* Unit Combobox */}
                                            <SimpleCombobox
                                                options={unitOptions}
                                                value={newIngredient.unitId?.toString()} // Controlled by state
                                                onChange={(val) => handleNewIngredientChange('unitId', val)} // Update state on change
                                                placeholder="Select unit"
                                                searchPlaceholder="Search units..."
                                                notFoundText="No unit found."
                                            />
                                        </div>
                                    </div>
                                    {/* Optional Checkbox */}
                                    <div className="flex items-center space-x-2 pt-1">
                                        <Checkbox id="newIngOptional" checked={newIngredient.isOptional ?? false} onCheckedChange={(checked) => handleNewIngredientChange('isOptional', checked === true)} />
                                        <Label htmlFor="newIngOptional" className="text-xs font-normal">Optional Ingredient</Label>
                                    </div>
                                    {/* Display Order (Optional) */}
                                    <div>
                                        <Label htmlFor="newIngDisplayOrder" className="text-xs mb-1 block">Order (Opt.)</Label>
                                        <Input id="newIngDisplayOrder" type="number" min="1" placeholder="Auto" value={newIngredient.displayOrder ?? ""} onChange={(e) => handleNewIngredientChange('displayOrder', e.target.value)} className="h-9 text-sm" />
                                    </div>
                                </div>

                                {/* Right Column (Ingredient, Preparation, Notes) */}
                                <div className="space-y-3">
                                    {/* Ingredient Combobox */}
                                    <div>
                                        <Label htmlFor="newIngName" className="text-xs mb-1 block">Ingredient*</Label>
                                        <SimpleCombobox
                                            options={ingredientOptions}
                                            value={newIngredient.ingredientId?.toString()} // Controlled by state
                                            onChange={(val) => handleNewIngredientChange('ingredientId', val)} // Update state on change
                                            placeholder="Select ingredient"
                                            searchPlaceholder="Search ingredients..."
                                            notFoundText="No ingredient found."
                                        />
                                    </div>
                                    {/* Preparation Input */}
                                    <div>
                                        <Label htmlFor="newIngPrep" className="text-xs mb-1 block">Preparation</Label>
                                        <Input id="newIngPrep" placeholder="e.g., chopped, minced" value={newIngredient.preparation ?? ""} onChange={(e) => handleNewIngredientChange('preparation', e.target.value)} className="h-9 text-sm" />
                                    </div>
                                    {/* Notes Input */}
                                    <div>
                                        <Label htmlFor="newIngNotes" className="text-xs mb-1 block">Notes</Label>
                                        <Input id="newIngNotes" placeholder="e.g., divided, room temp" value={newIngredient.notes ?? ""} onChange={(e) => handleNewIngredientChange('notes', e.target.value)} className="h-9 text-sm" />
                                    </div>
                                    {/* Alternate Ingredient (Could add combobox here if needed) */}
                                </div>
                            </div>

                            {/* Action Buttons for the inline form */}
                            <div className="flex justify-end items-center pt-2 gap-2">
                                {/* Show "Cancel Edit" only when editing */}
                                {editingIngredientIndex !== null && (
                                    <Button type="button" variant="ghost" size="sm" onClick={handleCancelEditIngredient}>Cancel Edit</Button>
                                )}
                                {/* Add/Update Button */}
                                <Button
                                    type="button" size="sm"
                                    onClick={handleSaveOrUpdateIngredient}
                                    // Disable if required fields are missing
                                    disabled={!newIngredient.ingredientId || !newIngredient.unitId || !newIngredient.quantity || newIngredient.quantity <= 0}
                                >
                                    {/* Change button text based on mode */}
                                    {editingIngredientIndex !== null ? 'Update Ingredient' : 'Add Ingredient'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* === Card 3: Preparation Steps === */}
                <Card className="lg:col-span-3"> {/* Full width on large screens */}
                    <CardHeader>
                        <CardTitle>Preparation Steps</CardTitle>
                        <CardDescription>Add instructions in order. Drag & drop to reorder (future feature).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Steps List Display Section */}
                        <div className="space-y-3 mb-6">
                            {steps.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">No steps added yet.</p>
                            ) : (
                                // Iterate over steps and display each
                                steps.map((step, index) => (
                                    <div key={`step-${step.id || index}`} className="border rounded-md p-3 flex items-start gap-3 bg-background hover:bg-muted/30 transition-colors">
                                        {/* Step Number */}
                                        <div className="font-semibold text-lg text-muted-foreground pt-0.5 select-none">{step.stepNumber}.</div>
                                        {/* Step Instruction (or editing textarea) */}
                                        <div className="flex-1">
                                            {/* Conditional Rendering: Show Textarea if editing this step, otherwise show instruction text */}
                                            {editingStepIndex === index ? (
                                                <div className="space-y-2">
                                                    {/* Textarea for editing */}
                                                    <Textarea
                                                        value={editingStepInstruction}
                                                        onChange={(e) => setEditingStepInstruction(e.target.value)}
                                                        rows={3}
                                                        autoFocus
                                                        className="text-sm"
                                                    />
                                                    {/* Save/Cancel buttons for inline edit */}
                                                    <div className="flex gap-2 justify-end">
                                                        <Button type="button" size="sm" variant="ghost" onClick={handleCancelStepUpdate}>Cancel</Button>
                                                        <Button type="button" size="sm" onClick={() => handleSaveStepUpdate(index)}>Save Step</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Display mode for the step instruction
                                                <>
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{step.instruction}</p>
                                                    {/* Optionally display flags like 'Optional' */}
                                                    <div className="flex gap-2 mt-1">
                                                        {step.isOptional && <Badge variant="outline" className="text-xs">Optional</Badge>}
                                                        {/* Could add time estimate display here: {step.estimatedTimeMinutes && ...} */}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {/* Action Buttons (Edit/Delete) - Show only if NOT editing this step */}
                                        {editingStepIndex !== index && (
                                            <div className="flex flex-col space-y-1">
                                                {/* Edit Button */}
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditStepClick(index)} disabled={editingStepIndex !== null}>
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit Step</span>
                                                </Button>
                                                {/* Delete Button (with confirmation) */}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={editingStepIndex !== null}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                            <span className="sr-only">Delete Step</span>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Step {step.stepNumber}?</AlertDialogTitle>
                                                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteStep(index)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Inline Step Add Form Section */}
                        <div className="border rounded-md p-4 space-y-2 bg-muted/30">
                            <Label htmlFor="newStepInstruction" className="font-semibold text-md">Add Next Step</Label>
                            {/* Textarea for entering the new step */}
                            <Textarea
                                id="newStepInstruction"
                                placeholder="Describe the next step..."
                                value={newStepInstruction} // Controlled by state
                                onChange={(e) => setNewStepInstruction(e.target.value)} // Update state on change
                                rows={3}
                                className="text-sm"
                            />
                            {/* TODO: Add Checkbox for Optional Step / Input for Estimated Time if needed */}
                            {/* Button to add the step */}
                            <div className="flex justify-end">
                                <Button
                                    type="button" size="sm"
                                    onClick={handleAddStep}
                                    disabled={!newStepInstruction.trim()} // Disable if textarea is empty
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add Step
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div> {/* End Main Grid */}

            {/* Form Footer: Save and Cancel Buttons */}
            <div className="mt-8 pt-6 border-t flex justify-end space-x-3">
                {/* Cancel Button */}
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    Cancel
                </Button>
                {/* Save/Update Button */}
                <Button
                    onClick={saveRecipe}
                    // Disable if saving, or if required fields (name, ingredients, steps) are missing
                    disabled={isSaving || !recipe.name || ingredients.length === 0 || steps.length === 0 || baseServingSize <= 0}
                >
                    {/* Show loading indicator or save icon+text */}
                    {isSaving ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                        <><Save className="mr-2 h-4 w-4" /> {isEditMode ? "Update Recipe" : "Create Recipe"}</>
                    )}
                </Button>
            </div>
        </div> // End Container div
    );
}