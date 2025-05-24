import { useState } from "react";
import { FirestoreResponse } from "../../../shared/types/firestore";

import {
  Personnel,
  PersonnelEditFormDataProps,
  PersonnelErrorResponse,
  PersonnelFormDataProps,
} from "../shared/types/personnel";
import personnelService from "../../../services/personnelService";

// Use personnel hook
const usePersonnel = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [personnels, setPersonnels] = useState<Personnel[]>([]);
  const [errorResponse, setErrorResponse] = useState<PersonnelErrorResponse>();
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(
    null
  );

  // Handling select personnel
  const handleSelectPersonnel = (personnel: Personnel) => {
    setSelectedPersonnel(personnel);
  };

  // Silent data fetch - doesn't set loading state
  const getAllPersonnels = async () => {
    try {
      const personnels: FirestoreResponse<Personnel[]> =
        await personnelService.getAllPersonnels();

      // Set state
      if (personnels.data) {
        // Set personnel data
        setPersonnels(personnels.data);
      } else {
        setErrorResponse({
          other: "An error occurred while fetching personnels",
        });
      }
    } catch (error: any) {
      console.error("An error occurred while fetching personnels:", error);
    }
  };

  // Add email and password - this one does use loading state
  const addPersonnel = async (formData: PersonnelFormDataProps) => {
    setLoading(true);
    setErrorResponse({});

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
    updatedData: PersonnelEditFormDataProps
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

  // Handle deleting personnel - this one does use loading state
  const deletePersonnel = async (id: Personnel["id"]): Promise<boolean> => {
    // Set Loading
    setLoading(true);
    // Set Response
    setErrorResponse({});

    try {
      const response = await personnelService.deletePersonnel(id);

      return response.success;
    } catch (error) {
      console.error("An error occured deleting the personnel: ", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    personnels,
    selectedPersonnel,
    errorResponse,
    addPersonnel,
    setSelectedPersonnel,
    getAllPersonnels,
    editPersonnel,
    handleSelectPersonnel,
    deletePersonnel,
  };
};

export default usePersonnel;
