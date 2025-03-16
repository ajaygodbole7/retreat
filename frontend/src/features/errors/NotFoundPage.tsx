// frontend/src/features/errors/NotFoundPage.tsx
import { Link } from '@tanstack/react-router'
import { Button } from '../../components/ui/button'
import { Home } from 'lucide-react'

export function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-xl text-muted-foreground mb-8">
                The page you're looking for doesn't exist.
            </p>
            <Link to="/">
                <Button>
                    <Home className="h-4 w-4 mr-2" />
                    Return Home
                </Button>
            </Link>
        </div>
    )
}