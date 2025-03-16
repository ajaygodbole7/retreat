"use client"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { ChefHat, Home, ArrowLeft, Search, Utensils, ShoppingCart } from "lucide-react"
import { motion } from "framer-motion"

export function NotFound() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-2 shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 relative">
                            <motion.div
                                initial={{ rotate: 0 }}
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 1.5, delay: 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 5 }}
                            >
                                <ChefHat className="h-16 w-16 text-primary" />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold"
                            >
                                404
                            </motion.div>
                        </div>
                        <CardTitle className="text-3xl font-bold">Page Not Found</CardTitle>
                        <CardDescription className="text-lg mt-2">We couldn't find the page you were looking for.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center pb-2">
                        <p className="text-muted-foreground">
                            The page may have been moved, deleted, or is temporarily unavailable.
                        </p>

                        <div className="mt-8 grid grid-cols-2 gap-3">
                            <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate({ to: "/" })}>
                                <Home className="h-4 w-4" />
                                Home
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={() => navigate({ to: "/ingredients" })}
                            >
                                <Utensils className="h-4 w-4" />
                                Ingredients
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={() => navigate({ to: "/coming-soon" })}
                            >
                                <ChefHat className="h-4 w-4" />
                                Recipes
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={() => navigate({ to: "/coming-soon" })}
                            >
                                <ShoppingCart className="h-4 w-4" />
                                Shopping Lists
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center pt-2">
                        <Button variant="default" className="w-full flex items-center gap-2" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </Button>
                    </CardFooter>
                </Card>

                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Looking for something specific? Try using the search function.
                    </p>
                    <Button
                        variant="link"
                        className="mt-2 flex items-center gap-2 mx-auto"
                        onClick={() => navigate({ to: "/search" })}
                    >
                        <Search className="h-4 w-4" />
                        Search
                    </Button>
                </div>
            </motion.div>

            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-muted/30 to-transparent -z-10" />
        </div>
    )
}

export default NotFound

