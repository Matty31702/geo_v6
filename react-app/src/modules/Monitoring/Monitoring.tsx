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
import { Personnel, Vehicle } from "../../types/firestore";
import MapHeader from "./components/MapHeader";
import CustomMapContainer from "./components/CustomMapContainer";
import MapLegendContainer from "./components/MapLegendContainer";
import CustomHelmet from "../../components/CustomHelmet";
import useVehicle from "../../components/hooks/useVehicle";

const Monitoring = () => {
  // Use custom hook to get personnel data
  const { personnels, getAllPersonnels } = usePersonnel();
  const {vehicles, getAllVehicles} = useVehicle();
  const [refreshing, setRefreshing] = useState(false);
  const [personnelInGeofence, setPersonnelInGeofence] = useState(0);
  const [personnelOutsideGeofence, setPersonnelOutsideGeofence] = useState(0);
  const [vehiclesWithCoordinates, setVehiclesWithCoordinates] = useState<Vehicle[]>([]);
  
  // Refresh personnel and vehicle data without showing loading indicator
  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([getAllPersonnels(), getAllVehicles()]).then(() => {
      setTimeout(() => setRefreshing(false), 600);
    });
  };

  // Load personnel and vehicles on component mount (silently)
  useEffect(() => {
    getAllPersonnels();
    getAllVehicles();
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

  // Process vehicles to include coordinates
  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      // Filter vehicles that have coordinates
      const vehiclesWithValidCoords = vehicles.map(vehicle => {
        // Extract coordinates from different possible formats
        const latitude = vehicle.lat || 
                         (vehicle.latitude) || 
                         (vehicle.long ? null : null);
        
        const longitude = vehicle.lng || 
                          vehicle.long || 
                          (vehicle.longitude);
        
        // Return vehicle with normalized coordinates
        return {
          ...vehicle,
          lat: parseFloat(latitude) || null,
          lng: parseFloat(longitude) || null
        };
      }).filter(v => v.lat && v.lng);
      
      setVehiclesWithCoordinates(vehiclesWithValidCoords);
    }
  }, [vehicles]);

  // Refresh data every 30 seconds silently (no loading state)
  useEffect(() => {
    const interval = setInterval(() => {
      getAllPersonnels();
      getAllVehicles();
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

  // Include vehicles in all markers for proper map bounds
  const allMarkers = [
    ...getAllMarkers(policeHQ, geofenceCenter, geofencePolygon.name, validPersonnel),
    ...vehiclesWithCoordinates.map(v => ({ lat: v.lat, lng: v.lng }))
  ];

  if(vehicles) {
    console.log(vehicles)
  }

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
            vehicles={vehiclesWithCoordinates}
            allMarkers={allMarkers}
          />
        </div>

        <MapLegendContainer vehicleCount={vehiclesWithCoordinates.length} />

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
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500"></div>
            <span className="text-sm">Vehicle</span>
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
            Vehicles displayed: {vehiclesWithCoordinates.length} out of {vehicles?.length || 0} vehicles
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