"use client"

import * as React from "react"
import { format, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateInputWithManualProps {
    value?: Date | null
    onChange: (date: Date | undefined) => void
    placeholder?: string
    disabled?: boolean
    className?: string
    dateFormat?: string
}

export function DateInputWithManual({
    value,
    onChange,
    placeholder = "Select or enter date",
    disabled,
    className,
    dateFormat = "yyyy-MM-dd",
}: DateInputWithManualProps) {
    const [open, setOpen] = React.useState(false)
    const [dateString, setDateString] = React.useState<string>(value ? format(value, dateFormat) : "")

    // Update input value when the date changes externally
    React.useEffect(() => {
        if (value) {
            setDateString(format(value, dateFormat))
        } else {
            setDateString("")
        }
    }, [value, dateFormat])

    // Handle manual date entry
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setDateString(newValue)

        try {
            // Try to parse the entered date
            if (newValue.trim() === "") {
                onChange(undefined)
                return
            }

            const parsedDate = parse(newValue, dateFormat, new Date())

            // Check if the date is valid
            if (!isNaN(parsedDate.getTime())) {
                onChange(parsedDate)
            }
        } catch (error) {
            // Invalid date format, don't update the date
            console.error(error)
        }
    }

    // Handle blur event to format the date properly
    const handleBlur = () => {
        if (value) {
            setDateString(format(value, dateFormat))
        } else if (dateString) {
            try {
                const parsedDate = parse(dateString, dateFormat, new Date())
                if (!isNaN(parsedDate.getTime())) {
                    onChange(parsedDate)
                    setDateString(format(parsedDate, dateFormat))
                } else {
                    setDateString("")
                }
            } catch (error) {
                setDateString("")
                console.error(error)
            }
        }
    }

    return (
        <div className={cn("relative", className)}>
            <div className="flex">
                <Input
                    type="text"
                    value={dateString}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="rounded-r-none"
                />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="rounded-l-none border-l-0"
                            disabled={disabled}
                            type="button"
                            size="icon"
                        >
                            <CalendarIcon className="h-4 w-4" />
                            <span className="sr-only">Open calendar</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={value ?? undefined}
                            onSelect={(date) => {
                                onChange(date)
                                setOpen(false)
                            }}
                            autoFocus
                            disabled={disabled}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}