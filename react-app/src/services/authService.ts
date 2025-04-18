import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { auth, database } from "./firebase/config";
import { FirestoreResponse } from "../types/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

const authService = {

  // Get document by username field
  async getDocumentByUsername<T>(
    collectionName: string,
    usernameValue: string
  ): Promise<FirestoreResponse<T>> {
    try {
      const q = query(
        collection(database, collectionName),
        where("username", "==", usernameValue)
      );
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        return {
          data: { id: docSnap.id, ...docSnap.data() } as T,
          error: null,
        };
      } else {
        return { data: null, error: null };
      }
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Get a document by ID
  async getDocument<T>(
    collectionName: string,
    docId: string
  ): Promise<FirestoreResponse<T>> {
    try {
      const docRef = doc(database, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          data: { id: docSnap.id, ...docSnap.data() } as unknown as T,
          error: null,
        };
      } else {
        return { data: null, error: null };
      }
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async loginWithEmail(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },
};

export default authService;
