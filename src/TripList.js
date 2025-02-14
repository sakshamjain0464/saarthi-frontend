import React, { useState, useEffect } from "react";
import { fetchUserTrips, deleteIterinary } from "./dbHelpers";
import { Button } from "./components/ui/button";
import { toast } from "react-toastify";
// Import icons from lucide-react (adjust if your package name differs)
import { MapPin, Calendar, Plane, Trash } from "lucide-react";

export default function TripList({ user, onSelectTrip }) {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadTrips() {
            try {
                setLoading(true);
                // Using user.$id; adjust if needed (e.g., user.id)
                const data = await fetchUserTrips(user.$id);
                setTrips(data);
            } catch (error) {
                console.error("Error fetching trips:", error);
            } finally {
                setLoading(false);
            }
        }
        loadTrips();
    }, [user]);

    const handleDeleteTrip = async (trip) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this trip? This will also delete all associated messages."
            )
        )
            return;
        try {
            // Delete all messages associated with this trip (iterinaryId)
            const response = await deleteIterinary(trip.$id);
            if (response) {
                setTrips((prevTrips) =>
                    prevTrips.filter((t) => t.$id !== trip.$id)
                );
                toast.success("Trip deleted successfully.");
            }
        } catch (error) {
            console.error("Error deleting trip:", error);
            toast.error("Failed to delete trip.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40 text-white">
                Loading trips...
            </div>
        );
    }

    if (!trips.length) {
        return (
            <div className="flex justify-center items-center h-40 text-white">
                No previous trips found.
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Your Trips
            </h2>
            <ul className="space-y-4">
                {trips.map((trip) => (
                    <li key={trip.$id} className="relative">
                        <Button
                            onClick={() => onSelectTrip(trip)}
                            className="w-full text-left bg-white rounded-lg shadow-md text-black hover:text-white hover:bg-primary/90 transition-colors h-fit py-5  px-10 flex items-center justify-between"
                        >
                            <div className="flex items-center">
                                <Plane className="w-6 h-6 text-primary mr-4" />
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span className="font-semibold">{trip.departureCity}</span>
                                        <span>→</span>
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span className="font-semibold">{trip.destinationCity}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                                        <span>-</span>
                                        <span>{new Date(trip.endDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Delete Icon: Stop propagation so that clicking it doesn't trigger onSelectTrip */}
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTrip(trip);
                                }}
                                className="p-2 hover:bg-red-100 rounded-full transition-colors"
                            >
                                <Trash className="w-5 h-5 text-red-500" />
                            </div>
                        </Button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
