"use client"

import { useState, useEffect } from "react"
import { fetchUserTrips, deleteIterinary } from "./dbHelpers"
import { Button } from "./components/ui/button"
import { toast } from "react-toastify"
import { MapPin, Calendar, Plane, Trash, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"



export default function TripList({ user, onSelectTrip }) {
    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadTrips() {
            try {
                setLoading(true)
                const data = await fetchUserTrips(user.$id)
                setTrips(data)
            } catch (error) {
                console.error("Error fetching trips:", error)
                toast.error("Failed to load trips. Please try again.")
            } finally {
                setLoading(false)
            }
        }
        loadTrips()
    }, [user])

    const handleDeleteTrip = async (trip) => {
        if (!window.confirm("Are you sure you want to delete this trip? This will also delete all associated messages."))
            return
        try {
            setLoading(true)
            const response = await deleteIterinary(trip.$id)
            if (response) {
                setTrips((prevTrips) => prevTrips.filter((t) => t.$id !== trip.$id))
                toast.success("Trip deleted successfully.")
            }
        } catch (error) {
            console.error("Error deleting trip:", error)
            toast.error("Failed to delete trip.")
        } finally {
            setLoading(false)
        }
    }

    const cardVariants = {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -50 },
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            </div>
        )
    }

    if (!trips.length) {
        return (
            <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
                No previous trips found. Start planning your first adventure!
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-3xl font-bold mb-8 text-center text-white">Your Adventures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {trips.map((trip) => (
                        <motion.div
                            key={trip.$id}
                            variants={cardVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            layout
                            className="relative"
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <Plane className="w-8 h-8 text-purple-500" />
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteTrip(trip)
                                            }}
                                            variant="ghost"
                                            size="sm"
                                            className="hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-colors"
                                        >
                                            <Trash className="w-5 h-5 text-red-500" />
                                        </Button>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                                        {trip.departureCity} to {trip.destinationCity}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>
                                            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        <span>
                                            {trip.destinationCity}, {trip.destinationState}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-purple-100 dark:bg-purple-900 p-4">
                                    <Button
                                        onClick={() => onSelectTrip(trip)}
                                        className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                                    >
                                        View Itinerary
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}