import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-xl text-muted-foreground mb-8">
                The page you're looking for doesn't exist.
            </p>
            <Link
                to="/"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
                Return Home
            </Link>
        </div>
    )
}