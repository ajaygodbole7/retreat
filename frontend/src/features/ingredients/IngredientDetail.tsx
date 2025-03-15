import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../../components/ui/alert-dialog'
import { ingredientApi } from '../../lib/api'
import { Edit, Trash2, ArrowLeft, Loader2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

interface IngredientDetailProps {
    ingredientId: number;
}

export function IngredientDetail({ ingredientId }: IngredientDetailProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: ingredient, isLoading, error } = useQuery({
        queryKey: ['ingredient', ingredientId],
        queryFn: () => ingredientApi.getById(ingredientId)
    });

    const deleteMutation = useMutation({
        mutationFn: () => ingredientApi.delete(ingredientId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ingredients'] });
            navigate({ to: '/ingredients' });
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-destructive">
                Error loading ingredient. Please try again.
            </div>
        );
    }

    if (!ingredient) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Ingredient not found.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link to="/ingredients">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">{ingredient.name}</h1>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to={`/ingredients/${ingredientId}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Link>
                    </Button>

                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete {ingredient.name}. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => deleteMutation.mutate()}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {deleteMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Trash2 className="h-4 w-4 mr-2" />
                                    )}
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {ingredient.isOrganic && <Badge variant="outline">Organic</Badge>}
                {ingredient.isLocal && <Badge variant="outline">Local</Badge>}
                {ingredient.isSeasonalItem && <Badge variant="outline">Seasonal</Badge>}
                {ingredient.isCommonAllergen && <Badge variant="destructive">Allergen</Badge>}
                {ingredient.isSpecialOrder && <Badge variant="secondary">Special Order</Badge>}
                {ingredient.hasVariablePrice && <Badge variant="outline">Variable Price</Badge>}
            </div>

            <Tabs defaultValue="details">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="storage">Storage</TabsTrigger>
                    <TabsTrigger value="supplier">Supplier</TabsTrigger>
                    {ingredient.substitutes?.length > 0 && (
                        <TabsTrigger value="substitutes">Substitutes</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                                <p>{ingredient.description || 'No description provided'}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                                <p>{ingredient.category.name}</p>
                                {ingredient.subcategory && (
                                    <>
                                        <h3 className="text-sm font-medium text-muted-foreground mt-2">Subcategory</h3>
                                        <p>{ingredient.subcategory.name}</p>
                                    </>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Default Unit</h3>
                                <p>{ingredient.defaultUnit.name} ({ingredient.defaultUnit.abbreviation})</p>
                            </div>

                            {ingredient.packageSize && ingredient.packageUnit && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Package Size</h3>
                                    <p>{ingredient.packageSize} {ingredient.packageUnit.abbreviation}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {ingredient.allergens?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Allergens</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {ingredient.allergens.map((allergen) => (
                                        <Badge key={allergen.id} variant="destructive">
                                            {allergen.allergenName}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {ingredient.dietaryFlags?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Dietary Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {ingredient.dietaryFlags.map((flag) => (
                                        <Badge key={flag.id} variant="secondary">
                                            {flag.flag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="storage" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Storage Information</CardTitle>
                            <CardDescription>
                                How to properly store this ingredient
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Storage Type</h3>
                                <p>{formatStorageType(ingredient.storageType)}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Perishable</h3>
                                <p>{ingredient.isPerishable ? 'Yes' : 'No'}</p>
                            </div>

                            {ingredient.shelfLifeDays && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Shelf Life</h3>
                                    <p>{ingredient.shelfLifeDays} days</p>
                                </div>
                            )}

                            {ingredient.storageInstructions && (
                                <div className="col-span-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">Storage Instructions</h3>
                                    <p>{ingredient.storageInstructions}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="supplier" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Supplier Information</CardTitle>
                            <CardDescription>
                                Details about sourcing this ingredient
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ingredient.preferredSupplier && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Preferred Supplier</h3>
                                    <p>{ingredient.preferredSupplier}</p>
                                </div>
                            )}

                            {ingredient.orderLeadTimeDays !== null && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Order Lead Time</h3>
                                    <p>{ingredient.orderLeadTimeDays} days</p>
                                </div>
                            )}

                            {ingredient.costPerUnitDollars !== null && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Cost Per Unit</h3>
                                    <p>${ingredient.costPerUnitDollars.toFixed(2)} per {ingredient.defaultUnit.abbreviation}</p>
                                </div>
                            )}

                            {ingredient.supplierInstructions && (
                                <div className="col-span-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">Supplier Instructions</h3>
                                    <p>{ingredient.supplierInstructions}</p>
                                </div>
                            )}

                            {ingredient.supplierNotes && (
                                <div className="col-span-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">Supplier Notes</h3>
                                    <p>{ingredient.supplierNotes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {ingredient.substitutes?.length > 0 && (
                    <TabsContent value="substitutes">
                        <Card>
                            <CardHeader>
                                <CardTitle>Substitutes</CardTitle>
                                <CardDescription>
                                    Alternative ingredients that can be used
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {ingredient.substitutes.map((substitute) => (
                                        <div key={substitute.id} className="border rounded-md p-4">
                                            <div className="flex justify-between items-center">
                                                <Link
                                                    to={`/ingredients/${substitute.substituteIngredient.id}`}
                                                    className="text-lg font-medium hover:underline"
                                                >
                                                    {substitute.substituteIngredient.name}
                                                </Link>
                                                <Badge variant="outline">
                                                    Conversion: {substitute.conversionRatio}
                                                </Badge>
                                            </div>
                                            {substitute.notes && (
                                                <p className="text-sm text-muted-foreground mt-2">{substitute.notes}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

function formatStorageType(type: string): string {
    switch (type) {
        case 'ROOM_TEMPERATURE':
            return 'Room Temperature';
        case 'REFRIGERATED':
            return 'Refrigerated';
        case 'FROZEN':
            return 'Frozen';
        case 'DRY_STORAGE':
            return 'Dry Storage';
        case 'COOL_DARK':
            return 'Cool & Dark';
        default:
            return type;
    }
}