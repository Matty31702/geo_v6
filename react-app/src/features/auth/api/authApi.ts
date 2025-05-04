import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from "firebase/auth";
import { auth, database } from "../../../core/config/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { CustomUser } from "./models/AuthUser";

const USER_COLLECTION = "Users";

export const authApi = {
  // get document by username/userId
  getByUsername: async (userId: string): Promise<CustomUser> => {
    try {
      // Get query by username/user_id
      const response = query(
        collection(database, USER_COLLECTION),
        where("username", "==", userId)
      );

      const querySnapshot = await getDocs(response);

      if (querySnapshot.empty) {
        throw new Error("User not found");
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      const user = new CustomUser({
        id: doc.id,
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        email: data.email,
        type: data.type,
      });

      return user; // Return user
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // login email and password
  loginWithEmailAndPassword: async (
    email: string,
    password: string
  ): Promise<User> => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      return response.user; // Return the signed-in user
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // logout current user
  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  // Add new user by email and password
  async createEmailAndPassword(
    email: string,
    password: string
  ): Promise<UserCredential> {
    try {
      // Create user in firebase authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      return userCredential;
    } catch (error) {
      console.error("Failed to create new user:", error);
      throw error;
    }
  },
};
