import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { Activity, FirestoreResponse, Personnel } from "../types/firestore";
import { database } from "./firebase/config";

const activityService = {
  // Get all activities
  async getAllActivities(): Promise<FirestoreResponse<Activity[]>> {
    try {
      const querySnapshot = await getDocs(
        query(collection(database, "Records"), orderBy("date_time", "desc"))
      );

      const activities: Activity[] = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const activityData = docSnap.data() as Omit<Activity, "id">;
          const activity: Activity = {
            id: docSnap.id,
            ...activityData,
          };

          // If user_id exists, fetch user details
          if (activity.user_id) {
            const userRef = doc(database, "Users", activity.user_id);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data() as Partial<Personnel>;
              activity.user = {
                ...userData,
                id: userSnap.id, // Put `id` last to avoid overwriting
              } as Personnel;
            }
          }

          return activity;
        })
      );

      return { data: activities, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};

export default activityService;
