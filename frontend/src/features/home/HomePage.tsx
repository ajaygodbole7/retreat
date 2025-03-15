export function HomePage() {
    return (
        <div className="space-y-6">
            <section className="text-center py-12">
                <h1 className="text-4xl font-bold mb-4">Retreat Meal Planner</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Streamline your retreat meal planning, recipe management, and shopping lists.
                </p>
            </section>

            <section className="grid md:grid-cols-3 gap-6">
                <div className="bg-card text-card-foreground rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-2">Ingredient Management</h2>
                    <p className="text-muted-foreground mb-4">
                        Organize and track all your ingredients with detailed information.
                    </p>
                    <a href="/ingredients" className="text-primary hover:underline">
                        Manage Ingredients →
                    </a>
                </div>

                <div className="bg-card text-card-foreground rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-2">Recipe Collection</h2>
                    <p className="text-muted-foreground mb-4">
                        Create, store, and scale recipes for your retreat meals.
                    </p>
                    <a href="/recipes" className="text-primary hover:underline">
                        Browse Recipes →
                    </a>
                </div>

                <div className="bg-card text-card-foreground rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-2">Meal Planning</h2>
                    <p className="text-muted-foreground mb-4">
                        Plan meals for your retreats and generate shopping lists.
                    </p>
                    <a href="/meal-plans" className="text-primary hover:underline">
                        Plan Meals →
                    </a>
                </div>
            </section>
        </div>
    )
}