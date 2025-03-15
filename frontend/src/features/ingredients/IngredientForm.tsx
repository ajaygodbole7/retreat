import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { Label } from '../../components/ui/label'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form'
import { categoryApi, unitApi, ingredientApi } from '../../lib/api'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

// Define the form schema using zod
const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    category_id: z.number().int().positive('Category is required'),
    subcategory_id: z.number().int().positive('Subcategory is required').optional(),
    default_unit_id: z.number().int().positive('Default unit is required'),
    isPerishable: z.boolean().default(false),
    storageType: z.enum(['ROOM_TEMPERATURE', 'REFRIGERATED', 'FROZEN', 'DRY_STORAGE', 'COOL_DARK']).default('ROOM_TEMPERATURE'),
    shelfLifeDays: z.number().int().positive().optional().nullable(),
    storageInstructions: z.string().optional().nullable(),
    supplierInstructions: z.string().optional().nullable(),
    supplierNotes: z.string().optional().nullable(),
    preferredSupplier: z.string().optional().nullable(),
    orderLeadTimeDays: z.number().int().positive().optional().nullable(),
    costPerUnitDollars: z.number().positive().optional().nullable(),
    packageSize: z.number().positive().optional().nullable(),
    package_unit_id: z.number().int().positive().optional().nullable(),
    isLocal: z.boolean().default(false),
    isOrganic: z.boolean().default(false),
    isSeasonalItem: z.boolean().default(false),
    hasVariablePrice: z.boolean().default(false),
    isCommonAllergen: z.boolean().default(false),
    isSpecialOrder: z.boolean().default(false)
});

type FormValues = z.infer<typeof formSchema>;

interface IngredientFormProps {
    ingredientId?: number;
}

export function IngredientForm({ ingredientId }: IngredientFormProps) {
    const isEditing = !!ingredientId;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch categories
    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryApi.getAll()
    });

    // Fetch units
    const { data: units, isLoading: unitsLoading } = useQuery({
        queryKey: ['units'],
        queryFn: () => unitApi.getAll()
    });

    // Fetch ingredient data if editing
    const { data: ingredient, isLoading: ingredientLoading } = useQuery({
        queryKey: ['ingredient', ingredientId],
        queryFn: () => ingredientApi.getById(ingredientId),
        enabled: isEditing
    });

    // Fetch subcategories based on selected category
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        isEditing ? ingredient?.categoryId : null
    );

    const { data: subcategories, isLoading: subcategoriesLoading } = useQuery({
        queryKey: ['subcategories', selectedCategoryId],
        queryFn: () => categoryApi.getSubcategories(selectedCategoryId),
        enabled: !!selectedCategoryId
    });

    // Create form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: isEditing && ingredient
            ? {
                name: ingredient.name,
                description: ingredient.description || '',
                category_id: ingredient.categoryId,
                subcategory_id: ingredient.subcategoryId || undefined,
                default_unit_id: ingredient.defaultUnitId,
                isPerishable: ingredient.isPerishable,
                storageType: ingredient.storageType,
                shelfLifeDays: ingredient.shelfLifeDays || undefined,
                storageInstructions: ingredient.storageInstructions || '',
                supplierInstructions: ingredient.supplierInstructions || '',
                supplierNotes: ingredient.supplierNotes || '',
                preferredSupplier: ingredient.preferredSupplier || '',
                orderLeadTimeDays: ingredient.orderLeadTimeDays || undefined,
                costPerUnitDollars: ingredient.costPerUnitDollars || undefined,
                packageSize: ingredient.packageSize || undefined,
                package_unit_id: ingredient.packageUnitId || undefined,
                isLocal: ingredient.isLocal,
                isOrganic: ingredient.isOrganic,
                isSeasonalItem: ingredient.isSeasonalItem,
                hasVariablePrice: ingredient.hasVariablePrice,
                isCommonAllergen: ingredient.isCommonAllergen,
                isSpecialOrder: ingredient.isSpecialOrder
            }
            : {
                name: '',
                description: '',
                category_id: undefined,
                subcategory_id: undefined,
                default_unit_id: undefined,
                isPerishable: false,
                storageType: 'ROOM_TEMPERATURE',
                isLocal: false,
                isOrganic: false,
                isSeasonalItem: false,
                hasVariablePrice: false,
                isCommonAllergen: false,
                isSpecialOrder: false
            }
    });

    // Watch category_id to update subcategories
    const watchedCategoryId = form.watch('category_id');

    useEffect(() => {
        if (watchedCategoryId && watchedCategoryId !== selectedCategoryId) {
            setSelectedCategoryId(watchedCategoryId);
            form.setValue('subcategory_id', undefined);
        }
    }, [watchedCategoryId, selectedCategoryId, form]);

    // Create or update mutation
    const mutation = useMutation({
        mutationFn: (values: FormValues) => {
            if (isEditing) {
                return ingredientApi.update(ingredientId, values);
            } else {
                return ingredientApi.create(values);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ingredients'] });
            navigate({ to: '/ingredients' });
        }
    });

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values);
    };

    if (isEditing && ingredientLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{isEditing ? 'Edit Ingredient' : 'Add Ingredient'}</h1>
                <p className="text-muted-foreground">
                    {isEditing ? 'Update the ingredient details below.' : 'Fill in the ingredient details below.'}
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Basic Information</h2>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
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
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categoriesLoading ? (
                                                    <div className="flex justify-center p-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    </div>
                                                ) : (
                                                    categories?.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="subcategory_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subcategory</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            value={field.value?.toString()}
                                            disabled={!selectedCategoryId}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a subcategory" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {subcategoriesLoading ? (
                                                    <div className="flex justify-center p-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    </div>
                                                ) : (
                                                    subcategories?.map((subcategory) => (
                                                        <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                                                            {subcategory.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Select a category first to see available subcategories
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="default_unit_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Default Unit</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a unit" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {unitsLoading ? (
                                                    <div className="flex justify-center p-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    </div>
                                                ) : (
                                                    units?.map((unit) => (
                                                        <SelectItem key={unit.id} value={unit.id.toString()}>
                                                            {unit.name} ({unit.abbreviation})
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Storage Information */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Storage Information</h2>

                            <FormField
                                control={form.control}
                                name="isPerishable"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Perishable</FormLabel>
                                            <FormDescription>
                                                Check if this ingredient has a limited shelf life
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="storageType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Storage Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select storage type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ROOM_TEMPERATURE">Room Temperature</SelectItem>
                                                <SelectItem value="REFRIGERATED">Refrigerated</SelectItem>
                                                <SelectItem value="FROZEN">Frozen</SelectItem>
                                                <SelectItem value="DRY_STORAGE">Dry Storage</SelectItem>
                                                <SelectItem value="COOL_DARK">Cool & Dark</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="shelfLifeDays"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Shelf Life (Days)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value ? parseInt(e.target.value) : null;
                                                    field.onChange(value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="storageInstructions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Storage Instructions</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Supplier Information */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Supplier Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="preferredSupplier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preferred Supplier</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="orderLeadTimeDays"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Order Lead Time (Days)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value ? parseInt(e.target.value) : null;
                                                    field.onChange(value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="costPerUnitDollars"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cost Per Unit ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value ? parseFloat(e.target.value) : null;
                                                    field.onChange(value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="packageSize"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Package Size</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value ? parseFloat(e.target.value) : null;
                                                        field.onChange(value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="package_unit_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Package Unit</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a unit" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {unitsLoading ? (
                                                        <div className="flex justify-center p-2">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        </div>
                                                    ) : (
                                                        units?.map((unit) => (
                                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                                {unit.name} ({unit.abbreviation})
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="supplierInstructions"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Supplier Instructions</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="supplierNotes"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Supplier Notes</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Additional Attributes */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Additional Attributes</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="isLocal"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Local</FormLabel>
                                            <FormDescription>
                                                Sourced locally
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isOrganic"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Organic</FormLabel>
                                            <FormDescription>
                                                Certified organic
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isSeasonalItem"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Seasonal</FormLabel>
                                            <FormDescription>
                                                Only available seasonally
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="hasVariablePrice"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Variable Price</FormLabel>
                                            <FormDescription>
                                                Price fluctuates based on market
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isCommonAllergen"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Common Allergen</FormLabel>
                                            <FormDescription>
                                                Contains or is a common allergen
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isSpecialOrder"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Special Order</FormLabel>
                                            <FormDescription>
                                                Requires special ordering process
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate({ to: '/ingredients' })}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Update Ingredient' : 'Create Ingredient'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}