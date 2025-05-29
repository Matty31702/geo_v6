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
  updateEmail,
  updatePassword,
  signInWithEmailAndPassword,
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

interface UpdateUserCredentialsParams {
  userId: string;
  currentEmail: string;
  currentPassword: string;
  newEmail?: string;
  newPassword?: string;
}

// Create secondary app for user creation and management
const secondaryApp = initializeApp(firebaseConfig, "secondary");
const secondaryAuth = getAuth(secondaryApp);

// Personnel service
const personnelService = {
  // Handle fetching all personnels
  async getAllPersonnels(
    isSuperAdmin: boolean
  ): Promise<FirestoreResponse<(Personnel & { vehicle?: Vehicle })[]>> {
    try {
      // Get all users and vehicles
      const usersSnapshot = await getDocs(collection(database, "Users"));
      const vehiclesSnapshot = await getDocs(collection(database, "Vehicles"));

      const vehicles: Vehicle[] = vehiclesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Vehicle, "id">),
      }));

      const users = usersSnapshot.docs.map((doc) => {
        const userData = doc.data() as Omit<Personnel, "id">;

        // Check if super admin
        if (isSuperAdmin) {
          return {
            id: doc.id,
            ...userData,
            password: userData.password || "",
          };
        }

        // For non-superadmin, exclude sensitive fields
        const { ...safeUserData } = userData;

        return {
          id: doc.id,
          ...safeUserData,
        };
      });

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

  // NEW: Update user email and/or password in Firebase Authentication
  async updateUserCredentials({
    userId,
    currentEmail,
    currentPassword,
    newEmail,
    newPassword,
  }: UpdateUserCredentialsParams): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      // Sign in to the secondary auth with current credentials
      const userCredential = await signInWithEmailAndPassword(
        secondaryAuth,
        currentEmail,
        currentPassword
      );

      const user = userCredential.user;

      // Update email if provided
      if (newEmail && newEmail !== currentEmail) {
        await updateEmail(user, newEmail);
        console.log("Email updated successfully");
      }

      // Update password if provided
      if (newPassword && newPassword !== currentPassword) {
        await updatePassword(user, newPassword);
        console.log("Password updated successfully");
      }

      // Sign out from secondary app
      await secondaryAuth.signOut();

      // Update the password in Firestore as well (if you're storing it there)
      if (newPassword) {
        const userRef = doc(database, "Users", userId);
        await setDoc(
          userRef,
          {
            password: newPassword,
            email: newEmail || currentEmail,
          },
          { merge: true }
        );
      } else if (newEmail) {
        const userRef = doc(database, "Users", userId);
        await setDoc(
          userRef,
          {
            email: newEmail,
          },
          { merge: true }
        );
      }

      return {
        success: true,
        error: null,
      };
    } catch (error: any) {
      console.error("Error updating user credentials:", error);

      // Handle specific Firebase Auth errors
      let errorMessage = error.message;
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email is already in use by another account";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Handle adding new personnel
  async addPersonnel(
    formData: PersonnelFormDataProps,
    user: User
  ): Promise<void> {
    const filteredFormData = omit(formData, ["confirmPassword"]);

    try {
      // Add user to Firestore with a created_at timestamp
      await setDoc(doc(database, "Users", user.uid), {
        ...filteredFormData,
        type: filteredFormData.type,
        created_at: serverTimestamp(),
      });

      if (filteredFormData.type === "Personnel") {
        showToast.success("Successfully created a new personnel!");
      } else if (filteredFormData.type === "superadmin") {
        showToast.success("Successfully created a new super admin!");
      } else {
        showToast.success("Successfully created a new admin!");
      }
    } catch (error: any) {
      console.error(error);
    }
  },

  // Handle editing personnel (enhanced to support credential updates)
  async editPersonnel(
    id: string,
    updatedData: Partial<PersonnelEditFormDataProps>,
    updateCredentials?: {
      currentEmail: string;
      currentPassword: string;
      newEmail?: string;
      newPassword?: string;
    }
  ): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      // If credentials need to be updated
      if (updateCredentials) {
        const credentialResult = await this.updateUserCredentials({
          userId: id,
          ...updateCredentials,
        });

        if (!credentialResult.success) {
          return credentialResult;
        }
      }

      // Update other user data in Firestore
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

  // Handle deleting a personnel
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
