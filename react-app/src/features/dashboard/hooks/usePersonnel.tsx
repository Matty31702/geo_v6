import { useState } from "react";
import { FirestoreResponse, Personnel } from "../../../types/firestore";
import personnelService, {
  EditFormDataProps,
  FormDataProps,
} from "../../../services/personnelService";

// Use personnel hook
const usePersonnel = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [personnels, setPersonnels] = useState<Personnel[]>([]);
  const [error, setError] = useState<string>("");
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);

  // Handling select personnel
  const handleSelectPersonnel = (personnel: Personnel) => {
    setSelectedPersonnel(personnel);
  }

  // Silent data fetch - doesn't set loading state
  const getAllPersonnels = async () => {
    try {
      const personnels: FirestoreResponse<Personnel[]> =
        await personnelService.getAllPersonnels();

      // Set state
      if (personnels.data) {
        setPersonnels(personnels.data);
      } else {
        console.error("An error occurred while fetching personnels");
      }
    } catch (error: any) {
      console.error("An error occurred while fetching personnels:", error);
    }
  };

  // Add email and password - this one does use loading state
  const addPersonnel = async (formData: FormDataProps) => {
    setLoading(true);
    setError("");

    try {
      const userCredential = await personnelService.addUserWithEmailAndPassword(
        formData.email,
        formData.password
      );

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

  // Handle editing personnel - this one does use loading state
  const editPersonnel = async (
    id: Personnel["id"],
    updatedData: EditFormDataProps
  ): Promise<{
    success: boolean;
    error: string | null;
  }> => {
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