import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { CreatePersonnel, Personnel } from "./types/personnel";
import { database } from "../../../core/config/firebaseConfig";
import { UserCredential } from "firebase/auth";
import { authApi } from "../../auth/api/authApi";

// Base Collection
const BASE_COLLECTION = "Users";

/**
 * API client for personnel-related operations
 */
export const personnelApi = {
  // Fetch all personnels
  async getAllPersonnels(): Promise<Personnel[]> {
    try {
      const userSnapshot = await getDocs(collection(database, BASE_COLLECTION));

      // Map personnel
      const users = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Personnel, "id">),
      }));

      // Returns users
      return users;
    } catch (error) {
      console.error("Failed to fetch personnels:", error);
      throw error;
    }
  },

  // Add new personnel
  async addPersonnel(data: CreatePersonnel): Promise<void> {
    try {
      console.log(data);

      // Create email and password
      const userCredential: UserCredential =
        await authApi.createEmailAndPassword(data.email, data.password);

      // Get doc id
      const uid = userCredential.user.uid;

      // Create new personnel
      await setDoc(doc(database, BASE_COLLECTION, uid), data);
    } catch (error) {
      console.error("Failed to create personnel:", error);
      throw error;
    }
  },
};
