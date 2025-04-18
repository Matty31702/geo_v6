import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { FirestoreResponse, Vehicle } from "../types/firestore";
import { database } from "./firebase/config";
import { FormDataProps } from "../modules/Vehicle/components/forms/AddVehicleModal/AddVehicleModal";

export interface EditFormDataProps {
  id: Vehicle["id"];
  model: Vehicle["model"];
  color: Vehicle["color"];
  plate_number: Vehicle["plate_number"];
}

// Vehicle service
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

  // Handle editing vehicle
  async editVehicle(
    id: string,
    updatedData: Partial<EditFormDataProps>
  ): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      const vehicleRef = doc(database, "Vehicles", id);

      await setDoc(vehicleRef, updatedData, { merge: true });

      return {
        success: true,
        error: null,
      };
    } catch (error: any) {
      console.error("Error updating personnel:", error);
      return { success: false, error: error.message };
    }
  },
};

export default vehicleService;
