import { databases } from "./appwrite.config";
import { ID, Query } from "appwrite";

const dbId = '67aec0480023fa0ca163'
const iterinaryCollectionId = '67af110b003e142f732f'
const messageCollectionId = '67af17bd002ffe97bdd5'

export async function saveTripData(tripData, userData, iterinary) {
    try {

        const formattedViaCities =
            tripData.viaCities && tripData.viaCities.length > 0
                ? tripData.viaCities.map((item) => item.city).join(", ")
                : "Nil";


        const response = await databases.createDocument(
            dbId,    // Replace with your Appwrite Database ID
            iterinaryCollectionId,  // Replace with your Appwrite Collection ID for trip data
            ID.unique(),      // Generate a unique document ID
            {
                userId: userData.$id,
                departureState: tripData.departureState,
                departureCity: tripData.departureCity,
                destinationState: tripData.destinationState,
                destinationCity: tripData.destinationCity,
                startDate: tripData.startDate,
                endDate: tripData.endDate,
                numberOfPeople: tripData.numberOfPeople,
                groupType: tripData.groupType,
                interests: tripData.interests,
                additionalInfo: tripData.additionalInfo,
                language: tripData.language,
                viaCities: formattedViaCities,
                iterinary: iterinary
            }
        );
        return response.$id;
    } catch (error) {
        console.error("Error saving trip data:", error);
        throw error;
    }
}


export async function saveMessage(newMessage) {
    try {
        console.log(newMessage)
        const response = await databases.createDocument(
            dbId,          // Replace with your Appwrite Database ID
            messageCollectionId, // Replace with your Messages Collection ID
            ID.unique(),            // Generates a unique document ID
            newMessage              // The document data to save
        );
        console.log(response)
        return response;
    } catch (error) {
        console.error("Error saving message:", error);
        throw error;
    }
}

export async function fetchUserTrips(userId) {
    try {
        const response = await databases.listDocuments(
            dbId,         // Replace with your Appwrite Database ID
            iterinaryCollectionId, // Replace with your Trips Collection ID
            [Query.equal("userId", userId)]
        );
        return response.documents;
    } catch (error) {
        console.error("Error fetching trips:", error);
        throw error;
    }
}

export async function getMessagesForItinerary(iterinaryId) {
    try {
        const response = await databases.listDocuments(
            dbId,
            messageCollectionId,
            [Query.equal("iterinaryId", iterinaryId)]
        );
        return response.documents;
    } catch (error) {
        console.error("Error fetching messages for itinerary:", error);
        throw error;
    }
}

export async function deleteIterinary(iterinaryId) {
    try {
        // First, fetch all messages for the given iterinaryId.
        const response = await databases.listDocuments(
            dbId,
            messageCollectionId,
            [Query.equal("iterinaryId", iterinaryId)]
        );
        const messages = response.documents;
        // Delete each message individually.
        for (const message of messages) {
            await databases.deleteDocument(dbId, messageCollectionId, message.$id);
        }

        const itResponse = await databases.deleteDocument(dbId, iterinaryCollectionId, iterinaryId);
        console.log("Deleted trip:", itResponse);
        return true
    } catch (error) {
        console.error("Error deleting messages:", error);
        throw error;
    }
}