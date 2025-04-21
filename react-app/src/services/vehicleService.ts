import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { FirestoreResponse, Personnel, Vehicle } from "../types/firestore";
import { database } from "./firebase/config";
import { FormDataProps } from "../modules/Vehicles/components/forms/AddVehicleModal/AddVehicleModal";

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

      /* const vehicles: Vehicle[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Vehicle, "id">),
      })); */

      const vehicles: Vehicle[] = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const vehicleData = docSnap.data() as Omit<Vehicle, "id">;
          const vehicle: Vehicle = {
            id: docSnap.id,
            ...vehicleData,
          };

          // If personnelId exists, fetch personnel details
          if (vehicle.user_id) {
            const personnelRef = doc(database, "Users", vehicle.user_id);
            const personnelSnap = await getDoc(personnelRef);
            if (personnelSnap.exists()) {
              const personnelData = personnelSnap.data() as Partial<Personnel>;
              vehicle.user = {
                ...personnelData,
                id: personnelSnap.id, // Put `id` last to avoid overwriting
              } as Personnel;
          
            }
          }

          return vehicle;
        })
      );

      return { data: vehicles, error: null };

    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Add vehicle
  async addVehicle(data: FormDataProps): Promise<void> {
    try {
      // First check if this user_id is already assigned to any vehicle
      if (data.user_id) {
        // Query for vehicles with this user_id
        const vehiclesRef = collection(database, "Vehicles");
        const q = query(vehiclesRef, where("user_id", "==", data.user_id));
        const querySnapshot = await getDocs(q);
        
        // If we found a vehicle with this user_id, update it instead of creating a new one
        if (!querySnapshot.empty) {
          const existingVehicleDoc = querySnapshot.docs[0];
          // Convert FormDataProps to a plain object that Firestore can accept
          const updateData = {
            color: data.color,
            model: data.model,
            plate_number: data.plate_number,
            user_id: data.user_id
          };
          await updateDoc(doc(database, "Vehicles", existingVehicleDoc.id), updateData);
          return;
        }
      }
      
      // If no matching vehicle found or no user_id provided, create a new vehicle
      const vehicleRef = doc(collection(database, "Vehicles")); // auto-generates ID
      await setDoc(vehicleRef, data);
    } catch (error: any) {
      console.error(error);
      throw error; // Re-throw to allow caller to handle or display error
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
