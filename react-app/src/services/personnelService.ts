import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { FirestoreResponse } from "../shared/types/firestore";
import { database, firebaseConfig } from "../core/config/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  getAuth,
  User,
  UserCredential,
} from "firebase/auth";
import omit from "../shared/utilities/omit";
import { initializeApp } from "firebase/app";
import showToast from "../shared/utilities/toast";
import {
  Personnel,
  PersonnelEditFormDataProps,
  PersonnelFormDataProps,
} from "../features/dashboard/shared/types/personnel";
import { Vehicle } from "../features/vehicles/shared/types/vehicle";

interface CustomUserCredential {
  data: UserCredential | null;
  error: string | null;
}

// Create secondary app for user creation
const secondaryApp = initializeApp(firebaseConfig, "secondary");
const secondaryAuth = getAuth(secondaryApp);

// Personnel service
const personnelService = {
  // Handle fetching all personnels
  async getAllPersonnels(): Promise<
    FirestoreResponse<(Personnel & { vehicle?: Vehicle })[]>
  > {
    try {
      // Get all users and vehicles
      const usersSnapshot = await getDocs(collection(database, "Users"));
      const vehiclesSnapshot = await getDocs(collection(database, "Vehicles"));

      const vehicles: Vehicle[] = vehiclesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Vehicle, "id">),
      }));

      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Personnel, "id">),
      }));

      const personnels = users
        .filter((user) => user.type === "Personnel")
        .map((personnel) => {
          const assignedVehicle = vehicles.find(
            (v) => v.user_id === personnel.id
          );
          return {
            ...personnel,
            vehicle: assignedVehicle || undefined,
          };
        })
        .sort((a, b) => {
          const aTime = a.created_at
            ? a.created_at.toDate?.()?.getTime?.() ??
              new Date(a.created_at).getTime()
            : 0;
          const bTime = b.created_at
            ? b.created_at.toDate?.()?.getTime?.() ??
              new Date(b.created_at).getTime()
            : 0;
          return bTime - aTime; // Descending: newest first, unknown last
        });

      return { data: personnels, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Handle adding new user for Firebase Authentication
  async addUserWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<CustomUserCredential> {
    try {
      // Use secondary auth instance
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );

      // Sign out from secondary app to avoid confusion
      await secondaryAuth.signOut();

      return { data: userCredential, error: null };
    } catch (error: any) {
      console.error(error);
      return { data: null, error: error.message };
    }
  },

  // Handle adding new personnel
  async addPersonnel(
    formData: PersonnelFormDataProps,
    user: User
  ): Promise<void> {
    // Omit password and confirmPassword
    const filteredFormData = omit(formData, ["password", "confirmPassword"]);

    try {
      // Add user to Firestore with a created_at timestamp
      await setDoc(doc(database, "Users", user.uid), {
        ...filteredFormData,
        type: filteredFormData.type,
        created_at: serverTimestamp(), // Add this line
      });

      if (filteredFormData.type === "Personnel") {
        // Show success message or notification if needed
        showToast.success("Successfully created a new personnel!");
      } else if (filteredFormData.type === "superadmin") {
        // Show success message or notification if needed
        showToast.success("Successfully created a new super admin!");
      } else {
        // Show success message or notification if needed
        showToast.success("Successfully created a new admin!");
      }
    } catch (error: any) {
      console.error(error);
    }
  },

  // Handle editing personnel
  async editPersonnel(
    id: string,
    updatedData: Partial<PersonnelEditFormDataProps>
  ): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      const userRef = doc(database, "Users", id);

      await setDoc(userRef, updatedData, { merge: true });

      return {
        success: true,
        error: null,
      };
    } catch (error: any) {
      console.error("Error updating personnel:", error);
      return { success: false, error: error.message };
    }
  },

  // ✅ Handle deleting a personnel
  async deletePersonnel(id: string): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      const userRef = doc(database, "Users", id);
      await deleteDoc(userRef);

      return {
        success: true,
        error: null,
      };
    } catch (error: any) {
      console.error("Error deleting personnel:", error);
      return { success: false, error: error.message };
    }
  },
};

export default personnelService;
