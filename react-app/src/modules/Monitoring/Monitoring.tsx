import { useState, useEffect } from "react";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import usePersonnel from "../../components/hooks/usePersonnel";
import "leaflet/dist/leaflet.css";
import { GEO_FENCE_POLYGON, POLICE_HQ } from "./constants";
import { GeofenceCenter, GeofencePolygon } from "./types";
import {
  getAllMarkers,
  getGeofenceCenter,
  getValidPersonnel,
} from "./utilities/geofencing";
import { Personnel } from "../../types/firestore";
import MapHeader from "./components/MapHeader";
import CustomMapContainer from "./components/CustomMapContainer";
import MapLegendContainer from "./components/MapLegendContainer";
import CustomHelmet from "../../components/CustomHelmet";

const Monitoring = () => {
  // Use custom hook to get personnel data
  const { personnels, getAllPersonnels } = usePersonnel();
  const [refreshing, setRefreshing] = useState(false);
  const [authStatuses, setAuthStatuses] = useState<Record<string, boolean>>({});
  
  // Refresh personnel data without showing loading indicator
  const handleRefresh = () => {
    setRefreshing(true);
    getAllPersonnels().then(() => {
      setTimeout(() => setRefreshing(false), 600);
    });
  };

  // Load personnel on component mount (silently)
  useEffect(() => {
    getAllPersonnels();
  }, []);

  // Monitor Firebase auth state for all users
  useEffect(() => {
    if (!personnels.length) return;
    
    // Get Firestore instance
    const db = getFirestore();
    
    // Set up auth state monitoring for personnel
    const unsubscribes = personnels.map(person => {
      // Reference to the user's document in Firestore
      const userStatusRef = doc(db, 'userStatus', person.id);
      
      return onSnapshot(userStatusRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setAuthStatuses(prev => ({
            ...prev,
            [person.id]: userData?.isOnline || false
          }));
        }
      });
    });
    
    // Clean up listeners when component unmounts
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [personnels]);

  // Refresh data every 30 seconds silently (no loading state)
  useEffect(() => {
    const interval = setInterval(() => {
      getAllPersonnels();
      console.log("Auto-refreshing personnel data");
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Police HQ coordinates
  const policeHQ = POLICE_HQ;

  // Define the polygon points
  const geofencePolygon: GeofencePolygon = GEO_FENCE_POLYGON;

  // Get valid personnel with coordinates
  const validPersonnel: Personnel[] = getValidPersonnel(personnels);
  
  // Enhance personnel data with authentication status
  const enhancedPersonnel = validPersonnel.map(person => ({
    ...person,
    isLoggedIn: authStatuses[person.id] || false
  }));

  // Prepare markers for map bounds calculation
  const geofenceCenter: GeofenceCenter = getGeofenceCenter(geofencePolygon);

  const allMarkers = getAllMarkers(
    policeHQ,
    geofenceCenter,
    geofencePolygon.name,
    validPersonnel
  );

  return (
    <>
      <CustomHelmet title="Monitoring | Geobound" />

      <div className="flex flex-col bg-gray-100 p-4 rounded-lg shadow-lg w-full max-w-6xl mx-auto">
        <MapHeader
          loading={false} // Never show loading indicator
          refreshing={refreshing}
          handleRefresh={handleRefresh}
        />

        <div className="flex">
          {/* Map Container - removed loading prop */}
          <CustomMapContainer
            policeHQ={policeHQ}
            geofencePolygon={geofencePolygon}
            filteredPersonnel={enhancedPersonnel}
            allMarkers={allMarkers}
          />
        </div>

        <MapLegendContainer />

        {/* Update Legend to include login status indicators */}
        <div className="mt-4 flex items-center gap-4 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-sm">Logged In</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span className="text-sm">Logged Out</span>
          </div>
        </div>

        <div className="mt-4 bg-white p-4 rounded-lg shadow text-xs text-gray-500">
          <p>
            Map displays {enhancedPersonnel.length} out of{" "}
            {validPersonnel.length} personnel with valid coordinates.
          </p>
          <p>
            Online personnel: {enhancedPersonnel.filter(p => p.isLoggedIn).length}
          </p>
          <p>
            Custom geofence area defined with{" "}
            {geofencePolygon.coordinates.length} points.
          </p>
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </>
  );
};

export default Monitoring;