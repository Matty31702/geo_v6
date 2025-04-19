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
  isPointInPolygon,
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
  const [personnelInGeofence, setPersonnelInGeofence] = useState(0);
  const [personnelOutsideGeofence, setPersonnelOutsideGeofence] = useState(0);
  
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

  // Monitor Firebase users directly from the Users collection
  useEffect(() => {
    if (!personnels.length) return;
    
    // Get Firestore instance
    const db = getFirestore();
    
    // Set up monitoring for personnel
    const unsubscribes = personnels.map(person => {
      // Reference to the user's document in Firestore (in Users collection)
      const userRef = doc(db, 'Users', person.id);
      
      return onSnapshot(userRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          // This will automatically update the personnel data when it changes
          // No need to store in separate state
          // console.log(`User ${person.id} data updated from Firestore`);
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
      // console.log("Auto-refreshing personnel data");
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Police HQ coordinates
  const policeHQ = POLICE_HQ;

  // Define the polygon points
  const geofencePolygon: GeofencePolygon = GEO_FENCE_POLYGON;

  // Get valid personnel with coordinates
  const validPersonnel: Personnel[] = getValidPersonnel(personnels);
  
  // Calculate personnel inside/outside geofence
  useEffect(() => {
    if (validPersonnel.length > 0) {
      let insideCount = 0;
      let outsideCount = 0;
      
      validPersonnel.forEach(person => {
        if (person.lat && person.lng) {
          // Check if personnel is inside geofence
          const isInside = isPointInPolygon(
            [person.lat, person.lng],
            geofencePolygon.coordinates
          );
          
          if (isInside) {
            insideCount++;
          } else {
            outsideCount++;
          }
        }
      });
      
      setPersonnelInGeofence(insideCount);
      setPersonnelOutsideGeofence(outsideCount);
    }
  }, [validPersonnel, geofencePolygon]);

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
          {/* Map Container - using valid personnel directly */}
          <CustomMapContainer
            policeHQ={policeHQ}
            geofencePolygon={geofencePolygon}
            filteredPersonnel={validPersonnel}
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
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-3 border-yellow-400 rounded-full"></div>
            <span className="text-sm">Outside Geofence</span>
          </div>
        </div>

        <div className="mt-4 bg-white p-4 rounded-lg shadow text-xs text-gray-500">
          <p>
            Map displays {validPersonnel.length} out of{" "}
            {personnels.length} personnel with valid coordinates.
          </p>
          <p>
            Online personnel: {validPersonnel.filter(p => p.isLoggedIn).length}
          </p>
          <p>
            Personnel inside geofence: {personnelInGeofence} | Outside geofence: {personnelOutsideGeofence}
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