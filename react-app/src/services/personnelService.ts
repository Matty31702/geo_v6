import { collection, getDocs } from "firebase/firestore";
import { FirestoreResponse, Personnel } from "../types/firestore";
import { database } from "./firebase/config";

const personnelService = {
  async getAllPersonnels(): Promise<FirestoreResponse<Personnel[]>> {
    try {
      const querySnapshot = await getDocs(collection(database, "Users"));

      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Personnel, "id">),
      }));

      return { data: users, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};

export default personnelService;
