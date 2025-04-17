import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { FirestoreResponse, Vehicle } from "../types/firestore";
import { database } from "./firebase/config";
import { FormDataProps } from "../modules/Vehicle/components/AddVehicleModal/AddVehicleModal";

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

  // Add vehicle
  async addVehicle(data: FormDataProps): Promise<void> {
    try {
      const vehicleRef = doc(collection(database, "Vehicles")); // auto-generates ID
      await setDoc(vehicleRef, data);
    } catch (error: any) {
      console.error(error);
    }
  },
};

export default vehicleService;
