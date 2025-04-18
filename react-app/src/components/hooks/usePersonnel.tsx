import { useState } from "react";
import { FirestoreResponse, Personnel } from "../../types/firestore";
import personnelService, {
  EditFormDataProps,
  FormDataProps,
} from "../../services/personnelService";

// Use personnel hook
const usePersonnel = () => {
  // Use Loading
  const [loading, setLoading] = useState<boolean>(false);
  const [personnels, setPersonnels] = useState<Personnel[]>([]);

  const [error, setError] = useState<string>("");

  // Select state
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);

  // Handling select personnel
  const handleSelectPersonnel = (personnel: Personnel) => {
    setSelectedPersonnel(personnel);
  }

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

  // Handle editing personnel
  const editPersonnel = async (
    id: Personnel["id"],
    updatedData: EditFormDataProps
  ): Promise<{
    success: boolean;
    error: string | null;
  }> => {
    // Set loading
    setLoading(true);

    try {
      await personnelService.editPersonnel(id, updatedData);

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

  return {
    loading,
    personnels,
    selectedPersonnel,
    error,
    addPersonnel,
    setSelectedPersonnel,
    setError,
    getAllPersonnels,
    editPersonnel,
    handleSelectPersonnel,
  };
};

export default usePersonnel;
