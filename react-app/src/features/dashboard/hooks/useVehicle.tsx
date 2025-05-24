import { useState } from "react";
import { FirestoreResponse } from "../../../shared/types/firestore";
import vehicleService, {
  EditFormDataProps,
} from "../../../services/vehicleService";
import { FormDataProps } from "../../../modules/Vehicles/components/forms/AddVehicleModal/AddVehicleModal";
import { Vehicle } from "../../vehicles/shared/types/vehicle";

const useVehicle = () => {
  // Use loading
  const [loading, setLoading] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const [error, setError] = useState<string>("");

  // Select state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Handle select vehicle
  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  // Handle unselect vehicle
  const handleUnselectVehicle = () => {
    setSelectedVehicle(null);
  };

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

  // Handle editing vehicle
  const editVehicle = async (
    id: Vehicle["id"],
    updatedData: EditFormDataProps
  ) => {
    // Set loading
    setLoading(true);

    try {
      await vehicleService.editVehicle(id, updatedData);

      return {
        success: true,
        error: null,
      };
    } catch (error: any) {
      console.error(error);

      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting personnel - this one does use loading state
  const deleteVehicle = async (id: Vehicle["id"]): Promise<boolean> => {
    // Set Loading
    setLoading(true);
    // Set Response
    setError("");

    try {
      const response = await vehicleService.deleteVehicle(id);

      return response.success;
    } catch (error) {
      console.error("An error occured deleting the vehicle: ", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    vehicles,
    error,
    selectedVehicle,

    handleSelectVehicle,
    handleUnselectVehicle,
    setError,
    addVehicle,
    getAllVehicles,
    editVehicle,
    deleteVehicle,
    setSelectedVehicle,
  };
};

export default useVehicle;
