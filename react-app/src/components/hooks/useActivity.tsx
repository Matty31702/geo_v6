import { useState } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { database } from "../../core/config/firebaseConfig";
import { Activity, FirestoreResponse } from "../../shared/types/firestore";
import activityService from "../../services/activityService";

const useActivity = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<any>([]);

  // Function to get all activities
  const getAllActivities = async () => {
    setLoading(true);
    setError(null);

    try {
      const activities: FirestoreResponse<Activity[]> =
        await activityService.getAllActivities();

      // Set state
      if (activities.data) {
        setActivities(activities.data);
      } else {
        setError("An error occured while fetching activities");
      }
    } catch (err) {
      console.error("Error fetching activities: ", err);
      setError("Failed to fetch activities. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to get activities by personnel ID
  const getActivitiesByPersonnelId = async (personnelId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Query activities collection filtered by the personnel ID
      const activitiesQuery = query(
        collection(database, "Records"),
        where("user_id", "==", personnelId),
        orderBy("date_time", "desc")
      );

      const activitiesSnapshot = await getDocs(activitiesQuery);
      const activitiesList = activitiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setActivities(activitiesList);
    } catch (err) {
      console.error("Error fetching activities for personnel: ", err);
      setError("Failed to fetch personnel activities. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    activities,
    getAllActivities,
    getActivitiesByPersonnelId,
  };
};

export default useActivity;
