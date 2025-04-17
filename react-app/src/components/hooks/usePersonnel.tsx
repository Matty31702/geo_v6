import { useState } from "react";
import { FirestoreResponse, Personnel } from "../../types/firestore";
import personnelService from "../../services/personnelService";

const usePersonnel = () => {
  // Use Loading
  const [loading, setLoading] = useState<boolean>(false);
  const [personnels, setPersonnels] = useState<Personnel[]>([]);

  const [error, setError] = useState<string>("");

  // Async functions
  const getAllPersonnels = async () => {
    // Set loading
    setLoading(false);

    try {
      const personnels: FirestoreResponse<Personnel[]> =
        await personnelService.getAllPersonnels();
      
      // Set state
      if (personnels.data) {
        console.log(personnels.data);
        setPersonnels(personnels.data);
      } else {
        setError("An error occured while fetching personnels");
      }
    } catch (error: any) {
      setError("An error occured while fetching personnels");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    personnels,
    error,
    getAllPersonnels,
  };
};

export default usePersonnel;
