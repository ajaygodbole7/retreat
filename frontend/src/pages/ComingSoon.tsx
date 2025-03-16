"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
//import { use } from "../components/ui/toast"
import { toast } from "sonner";
import { ChefHat, ArrowLeft, Construction, CalendarClock, Bell } from "lucide-react"
import { motion } from "framer-motion"

export function ComingSoon() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
   

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        // In a real app, you'd send this to your API
        console.log("Subscribing email:", email)
        toast("Event has been created.")

        setEmail("")
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/10 px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-3xl"
            >
                <Card className="border-2 shadow-lg overflow-hidden">
                    <div className="md:flex">
                        <div className="md:w-2/3 p-6">
                            <CardHeader className="px-0">
                                <div className="flex items-center gap-3 mb-4">
                                    <motion.div
                                        initial={{ rotate: 0 }}
                                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 5 }}
                                    >
                                        <Construction className="h-8 w-8 text-primary" />
                                    </motion.div>
                                    <CardTitle className="text-3xl font-bold">Coming Soon</CardTitle>
                                </div>
                                <CardDescription className="text-lg">We're cooking up something special</CardDescription>
                            </CardHeader>

                            <CardContent className="px-0 py-4">
                                <p className="mb-6">
                                    This feature is currently under development and will be available soon. We're working hard to bring
                                    you:
                                </p>

                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-center gap-2">
                                        <ChefHat className="h-5 w-5 text-primary flex-shrink-0" />
                                        <span>Recipe creation and management</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CalendarClock className="h-5 w-5 text-primary flex-shrink-0" />
                                        <span>Meal planning for retreats</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-primary flex-shrink-0" />
                                        <span>Automated shopping list generation</span>
                                    </li>
                                </ul>

                                <form onSubmit={handleSubscribe} className="space-y-3">
                                    <p className="text-sm text-muted-foreground">Want to be notified when this feature is ready?</p>
                                    <div className="flex gap-2">
                                        <Input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button type="submit">Notify Me</Button>
                                    </div>
                                </form>
                            </CardContent>

                            <CardFooter className="px-0 pt-4">
                                <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate(-1)}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Go Back
                                </Button>
                            </CardFooter>
                        </div>

                        <div className="md:w-1/3 bg-muted flex items-center justify-center p-6">
                            <div className="text-center">
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                        rotate: [0, 5, 0, -5, 0],
                                    }}
                                    transition={{
                                        duration: 5,
                                        repeat: Number.POSITIVE_INFINITY,
                                        repeatType: "reverse",
                                    }}
                                >
                                    <ChefHat className="h-24 w-24 mx-auto text-primary mb-4" />
                                </motion.div>
                                <p className="font-medium">Feature In Progress</p>
                                <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        In the meantime, you can explore our ingredient management system.
                    </p>
                    <Button variant="link" className="mt-2" onClick={() => navigate({ to: "/ingredients" })}>
                        Go to Ingredients
                    </Button>
                </div>
            </motion.div>

            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-muted/30 to-transparent -z-10" />
        </div>
    )
}

export default ComingSoon

