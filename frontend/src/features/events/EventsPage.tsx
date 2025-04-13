// src/features/events/EventsPage.tsx
"use client"

import { useState, useMemo } from "react"
import { Link } from "@tanstack/react-router"
import { useEventList, useDeleteEvent } from "../../hooks/useEvents"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog"
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Loader2,
    CalendarOff,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    X,
    Calendar,
    Filter,
} from "lucide-react"
import { formatDate, formatEnum } from "../../utils/format-utils"
// Import backend types and enums
import type { Event } from "@server/types/event-types"
import { EventType, EventStatus } from "@server/types/event-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"

// Define sortable fields and directions
type SortField = "eventName" | "eventType" | "eventStartDate" | "eventEndDate" | "status"
type SortDirection = "asc" | "desc"

export function EventsPage() {
    // --- State ---
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [sortField, setSortField] = useState<SortField>("eventStartDate")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null)

    // --- Data Fetching ---
    const { data: events = [], isLoading, error } = useEventList()
    const deleteMutation = useDeleteEvent()

    // --- Filtering and Sorting Logic ---
    const filteredAndSortedEvents = useMemo(() => {
        let processedEvents = [...events]

        // 1. Filter by Search Term
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase()
            processedEvents = processedEvents.filter((event) => event.eventName.toLowerCase().includes(lowerSearch))
        }
        // 2. Filter by Status
        if (statusFilter !== "all") {
            processedEvents = processedEvents.filter((event) => event.status === statusFilter)
        }
        // 3. Filter by Type
        if (typeFilter !== "all") {
            processedEvents = processedEvents.filter((event) => event.eventType === typeFilter)
        }

        // 4. Sort
        processedEvents.sort((a, b) => {
            const aValue = a[sortField]
            const bValue = b[sortField]
            let comparison = 0

            // Handle date comparison specifically
            if (sortField === "eventStartDate" || sortField === "eventEndDate") {
                const dateA = aValue ? new Date(aValue).getTime() : 0
                const dateB = bValue ? new Date(bValue).getTime() : 0
                comparison = dateA - dateB
            } else if (typeof aValue === "string" && typeof bValue === "string") {
                comparison = aValue.localeCompare(bValue)
            } else if (typeof aValue === "number" && typeof bValue === "number") {
                comparison = aValue - bValue
            }
            // Add null/undefined checks
            else if (aValue == null && bValue != null) comparison = -1
            else if (aValue != null && bValue == null) comparison = 1

            return sortDirection === "asc" ? comparison : -comparison
        })

        return processedEvents
    }, [events, searchTerm, statusFilter, typeFilter, sortField, sortDirection])

    // --- Handlers ---
    const handleSort = (field: SortField) => {
        const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc"
        setSortDirection(newDirection)
        setSortField(field)
    }

    const resetFilters = () => {
        setSearchTerm("")
        setStatusFilter("all")
        setTypeFilter("all")
    }

    const handleDelete = (event: Event) => {
        setEventToDelete(event)
    }

    const confirmDelete = () => {
        if (eventToDelete) {
            deleteMutation.mutate(eventToDelete.id, {
                onSuccess: () => setEventToDelete(null),
                onError: () => setEventToDelete(null),
            })
        }
    }

    // --- Render Functions ---
    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground/50" />
        }
        return sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
    }

    const hasActiveFilters = searchTerm || statusFilter !== "all" || typeFilter !== "all"

    // --- TSX ---
    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Events</h1>
                    <p className="text-muted-foreground mt-1">Manage your retreat and event schedule</p>
                </div>
                <Link to="/events/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Event
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between py-2">
                        <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{events.length}</div>
                        <p className="text-xs text-muted-foreground">All events</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between py-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <Badge variant="default" className="text-xs">
                            Active
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{events.filter((e) => e.status === EventStatus.ACTIVE).length}</div>
                        <p className="text-xs text-muted-foreground">Currently running</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between py-2">
                        <CardTitle className="text-sm font-medium">Planning</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                            Planning
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{events.filter((e) => e.status === EventStatus.PLANNING).length}</div>
                        <p className="text-xs text-muted-foreground">In preparation</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between py-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <Badge variant="outline" className="text-xs">
                            Completed
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{events.filter((e) => e.status === EventStatus.COMPLETED).length}</div>
                        <p className="text-xs text-muted-foreground">Past events</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search Bar */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter Events
                    </CardTitle>
                    <CardDescription>Narrow down your event list</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-grow">
                            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by name..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-[160px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {Object.values(EventType).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {formatEnum(type)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[160px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {Object.values(EventStatus).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {formatEnum(status)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasActiveFilters && (
                            <Button variant="outline" onClick={resetFilters} className="w-full md:w-auto">
                                <X className="h-4 w-4 mr-1" /> Reset Filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Area */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-destructive">
                            <p>Error loading events: {(error as Error).message}</p>
                        </div>
                    ) : filteredAndSortedEvents.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-t rounded-md">
                            <CalendarOff className="h-12 w-12 mx-auto mb-4" />
                            <p>No events found.</p>
                            {hasActiveFilters ? (
                                <p className="text-sm mt-2">Try adjusting your filters.</p>
                            ) : (
                                <Link to="/events/new" className="mt-4 inline-block">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Event
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[30%]" onClick={() => handleSort("eventName")}>
                                            <Button variant="ghost" size="sm" className="px-1 font-medium">
                                                Name {renderSortIcon("eventName")}
                                            </Button>
                                        </TableHead>
                                        <TableHead onClick={() => handleSort("eventType")}>
                                            <Button variant="ghost" size="sm" className="px-1 font-medium">
                                                Type {renderSortIcon("eventType")}
                                            </Button>
                                        </TableHead>
                                        <TableHead onClick={() => handleSort("eventStartDate")}>
                                            <Button variant="ghost" size="sm" className="px-1 font-medium">
                                                Start Date {renderSortIcon("eventStartDate")}
                                            </Button>
                                        </TableHead>
                                        <TableHead onClick={() => handleSort("eventEndDate")}>
                                            <Button variant="ghost" size="sm" className="px-1 font-medium">
                                                End Date {renderSortIcon("eventEndDate")}
                                            </Button>
                                        </TableHead>
                                        <TableHead onClick={() => handleSort("status")}>
                                            <Button variant="ghost" size="sm" className="px-1 font-medium">
                                                Status {renderSortIcon("status")}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedEvents.map((event) => (
                                        <TableRow key={event.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">
                                                <Link to={`/events/${ event.id }`} className="hover:underline text-primary">
                                                    {event.eventName}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{formatEnum(event.eventType)}</TableCell>
                                            <TableCell>{formatDate(event.eventStartDate)}</TableCell>
                                            <TableCell>{formatDate(event.eventEndDate)}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        event.status === EventStatus.ACTIVE
                                                            ? "default"
                                                            : event.status === EventStatus.COMPLETED
                                                                ? "outline"
                                                                : "secondary"
                                                    }
                                                >
                                                    {formatEnum(event.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Link to={`/events/${ event.id }`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link to={`/events/${ event.id }/edit`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        title="Delete"
                                                        onClick={() => handleDelete(event)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Delete event "{eventToDelete?.eventName}"? This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
