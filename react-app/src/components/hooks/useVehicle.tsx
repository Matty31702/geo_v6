import { useState } from "react";
import { FirestoreResponse, Vehicle } from "../../types/firestore";
import vehicleService from "../../services/vehicleService";
import { FormDataProps } from "../../modules/Vehicle/components/AddVehicleModal/AddVehicleModal";

const useVehicle = () => {
  // Use loading
  const [loading, setLoading] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const [error, setError] = useState<string>("");

  /**
   * Async functions
   */

  // Get all vehicles
  const getAllVehicles = async () => {
    // Set loading
    setLoading(false);

    try {
      const vehicles: FirestoreResponse<Vehicle[]> =
        await vehicleService.getAllVehicles();

      // Set state
      if (vehicles.data) {
        setVehicles(vehicles.data);
      } else {
        setError("An error occured while fetching vehicles");
      }
    } catch (error: any) {
      setError("An error occured while fetching vehicles");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Add vehicle
  const addVehicle = async (data: FormDataProps) => {
    // Set loading
    setLoading(true);

    try {
      await vehicleService.addVehicle(data);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    vehicles,
    error,
    setError,
    addVehicle,
    getAllVehicles,
  };
};

export default useVehicle;
