import { collection, getDocs } from "firebase/firestore";
import { FirestoreResponse, Vehicle } from "../types/firestore";
import { database } from "./firebase/config";

const vehicleService = {
  // Get all vehicles
  async getAllVehicles(): Promise<FirestoreResponse<Vehicle[]>> {
    try {
      const querySnapshot = await getDocs(collection(database, "Vehicles"));

      const vehicles: Vehicle[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Vehicle, "id">),
      }));

      // console.log(vehicles);

      return { data: vehicles, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};

export default vehicleService;
