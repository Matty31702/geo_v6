import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { FirestoreResponse, Personnel } from "../types/firestore";
import { auth, database } from "./firebase/config";
import {
  createUserWithEmailAndPassword,
  User,
  UserCredential,
} from "firebase/auth";

export interface FormDataProps {
  id?: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  datetime: string;
  is_verified?: boolean;
  latitude?: number;
  longitude?: number;
  profile?: string;
  sector: string;
  type?: string;
  gender: string;
  birthday: string;
  username: string;
  password: string;
  guardian_name: string;
  guardian_phone_number: string;
}

interface CustomUserCredential {
  data: UserCredential | null;
  error: string | null;
}

// Personnel service
const personnelService = {
  // Handle fetching all personnels
  async getAllPersonnels(): Promise<FirestoreResponse<Personnel[]>> {
    try {
      const querySnapshot = await getDocs(collection(database, "Users"));

      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Personnel, "id">),
      }));

      // Filter to include only Personnel type
      const personnels = users.filter((user) => user.type === "Personnel");

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
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Return value
      return { data: userCredential, error: null };
    } catch (error: any) {
      console.error(error);
      return { data: null, error: error.message };
    }
  },

  // Handle adding new personnel
  async addPersonnel(formData: FormDataProps, user: User): Promise<void> {
    try {
      // Add user to Firestore
      await setDoc(doc(database, "Users", user.uid), {
        ...formData,
        type: "Personnel"
      });
    } catch (error: any) {
      console.error(error);
    }
  },
};

export default personnelService;
