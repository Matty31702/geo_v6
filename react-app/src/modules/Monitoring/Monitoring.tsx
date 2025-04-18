import { useState, useEffect } from "react";
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
  const { personnels, loading, getAllPersonnels } = usePersonnel();
  const [refreshing, setRefreshing] = useState(false);

  // Refresh personnel data
  const handleRefresh = () => {
    setRefreshing(true);
    getAllPersonnels().then(() => {
      setTimeout(() => setRefreshing(false), 600);
    });
  };

  // Load personnel on component mount
  useEffect(() => {
    getAllPersonnels();
  }, []);

  // Print Hello World every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    console.log("Hello World");
  }, 5000);

  return () => clearInterval(interval);
}, []);

  // Police HQ coordinates
  const policeHQ = POLICE_HQ;

  // Define the polygon points (replace with actual coordinates of your shape)
  // GeoJSON LineString converted to polygon (as [lat, lng] pairs)
  const geofencePolygon: GeofencePolygon = GEO_FENCE_POLYGON;

  // Get valid personnel with coordinates
  const validPersonnel: Personnel[] = getValidPersonnel(personnels);

  // Filter based on selected sector
  const filteredPersonnel = validPersonnel;

  // Prepare markers for map bounds calculation
  // Convert geofencePolygon to a format similar to other markers for bounds calculation
  const geofenceCenter: GeofenceCenter = getGeofenceCenter(geofencePolygon);

  // Only include valid markers
  /* let allMarkers = [
    policeHQ,
    { ...geofenceCenter, name: geofencePolygon.name },
    ...validPersonnel
  ].filter(marker => marker && typeof marker.lat === 'number' && typeof marker.lng === 'number'); */

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
          loading={loading}
          refreshing={refreshing}
          handleRefresh={handleRefresh}
        />

        <div className="flex">
          {/* Map Container */}
          <CustomMapContainer
            loading={loading}
            policeHQ={policeHQ}
            geofencePolygon={geofencePolygon}
            filteredPersonnel={filteredPersonnel}
            allMarkers={allMarkers}
          />
        </div>

        <MapLegendContainer />

        <div className="mt-4 bg-white p-4 rounded-lg shadow text-xs text-gray-500">
          <p>
            Map displays {filteredPersonnel.length} out of{" "}
            {validPersonnel.length} personnel with valid coordinates.
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
