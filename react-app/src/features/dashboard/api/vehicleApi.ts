import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { CreateVehicle, Vehicle } from "./types/vehicle";
import { database } from "../../../core/config/firebaseConfig";

// Base Collection
const BASE_COLLECTION = "Vehicles";

/**
 * API client for vehicle-related operations
 */
export const vehicleApi = {
  // Fetch all vehicles
  async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const vehicleSnapshots = await getDocs(
        collection(database, BASE_COLLECTION)
      );

      // Map and omit
      const vehicles: Vehicle[] = vehicleSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Vehicle, "id">),
      }));

      // Return vehicles
      return vehicles;
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      throw error;
    }
  },

  // Add new vehicle
  async addVehicle(data: CreateVehicle): Promise<void> {
    try {
      const vehiclesRef = doc(collection(database, "Vehicles"));
      await setDoc(vehiclesRef, data);
    } catch (error) {
      console.error("Failed to add vehicle:", error);
      throw error;
    }
  },
};
