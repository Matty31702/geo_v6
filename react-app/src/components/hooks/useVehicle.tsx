import { useState } from 'react'
import { FirestoreResponse, Vehicle } from '../../types/firestore';
import vehicleService from '../../services/vehicleService';

const useVehicle = () => {

  // Use loading
  const [loading, setLoading] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const [error, setError] = useState<string>('');

  // Async functions
  const getAllVehicles = async () => {
    // Set loading
    setLoading(false);

    try {

      const vehicles: FirestoreResponse<Vehicle[]> = await vehicleService.getAllVehicles();

      // Set state
      if(vehicles.data) {
        setVehicles(vehicles.data);
      } else {
        setError("An error occured while fetching vehicles");
      }

    } catch(error: any) {
      setError("An error occured while fetching vehicles");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    vehicles,
    error,
    getAllVehicles,
  }
}

export default useVehicle
