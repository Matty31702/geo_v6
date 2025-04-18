import { useState } from "react";
import { FirestoreResponse, Personnel } from "../../types/firestore";
import personnelService, {
  FormDataProps,
} from "../../services/personnelService";

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
        // console.log(personnels.data);
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

  // Add email and password
  const addPersonnel = async (formData: FormDataProps) => {
    // Set loading
    setLoading(true);
    setError("");

    try {
      // Create user in Firebase Authentication
      const userCredential = await personnelService.addUserWithEmailAndPassword(
        formData.email,
        formData.password
      );

      // Return userCredential
      if (userCredential.data?.user) {
        await personnelService.addPersonnel(formData, userCredential.data.user);
      }
    } catch (error: any) {
      console.error(error);
      return error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    personnels,
    error,
    addPersonnel,
    setError,
    getAllPersonnels,
  };
};

export default usePersonnel;
