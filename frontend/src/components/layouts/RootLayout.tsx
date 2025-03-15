import { Outlet } from '@tanstack/react-router'
import { Navbar } from '../ui/Navbar'
import { Footer } from '../ui/Footer'

export function RootLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}