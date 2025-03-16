"use client"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Construction, ArrowLeft, Hammer, HardHat } from "lucide-react"
import { motion } from "framer-motion"

export function UnderConstruction() {
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
                                <Construction className="h-16 w-16 text-primary" />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                                className="absolute -top-2 -right-2 bg-warning text-warning-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold"
                            >
                                <HardHat className="h-4 w-4" />
                            </motion.div>
                        </div>
                        <CardTitle className="text-3xl font-bold">Under Construction</CardTitle>
                        <CardDescription className="text-lg mt-2">This section is currently being built.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center pb-2">
                        <p className="text-muted-foreground">
                            We're working hard to bring you this feature. Please check back soon!
                        </p>

                        <div className="mt-8 flex justify-center">
                            <motion.div
                                animate={{
                                    rotate: [0, 0, 10, -10, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Number.POSITIVE_INFINITY,
                                    repeatType: "reverse",
                                }}
                            >
                                <Hammer className="h-12 w-12 text-primary" />
                            </motion.div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center pt-2">
                        <Button variant="default" className="w-full flex items-center gap-2" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-muted/30 to-transparent -z-10" />
        </div>
    )
}

export default UnderConstruction

