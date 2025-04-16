"use client"

import * as React from "react"
import { format, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateInputProps {
    value?: Date | null
    onChange: (date: Date | undefined) => void
    placeholder?: string
    disabled?: boolean
    className?: string
    dateFormat?: string
}

export function DateInput({
    value,
    onChange,
    placeholder = "Select or enter date",
    disabled,
    className,
    dateFormat = "yyyy-MM-dd",
}: DateInputProps) {
    const [dateString, setDateString] = React.useState<string>(value ? format(value, dateFormat) : "")
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

    // Update the input field when the date value changes externally
    React.useEffect(() => {
        if (value) {
            setDateString(format(value, dateFormat))
        } else {
            setDateString("")
        }
    }, [value, dateFormat])

    // Handle manual date input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setDateString(newValue)

        try {
            // Try to parse the date string
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
            // Invalid date format, don't update the date value
        }
    }

    // Handle calendar selection
    const handleCalendarSelect = (date: Date | undefined) => {
        onChange(date)
        setIsPopoverOpen(false)
    }

    return (
        <div className={cn("relative", className)}>
            <div className="flex">
                <Input
                    type="text"
                    value={dateString}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="rounded-r-none"
                />
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
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
                            onSelect={handleCalendarSelect}
                            autoFocus
                            disabled={disabled}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

