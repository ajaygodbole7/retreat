export function Footer() {
    return (
        <footer className="bg-muted py-6">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Blossom Foundation Retreat Meal Planner
                    </p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                            Terms of Service
                        </a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}