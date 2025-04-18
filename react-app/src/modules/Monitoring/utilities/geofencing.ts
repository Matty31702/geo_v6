// Prepare markers for map bounds calculation
import { Personnel } from "../../../types/firestore";
import { GeofenceCenter, GeofencePolygon, PoliceHQ } from "../types";

// Get only include valid markers
export const getAllMarkers = (
  policeHQ: PoliceHQ,
  geofenceCenter: GeofenceCenter,
  geofenceName: string,
  validPersonnel: Personnel[]
): any[] => {
  const allMarkers = [
    policeHQ,
    { ...geofenceCenter, name: geofenceName },
    ...validPersonnel,
  ];

  return allMarkers.filter(
    (marker) =>
      marker && typeof marker.lat === "number" && typeof marker.lng === "number"
  );
};

// Convert geofencePolygon to a format similar to other markers for bounds calculation
export const getGeofenceCenter = (
  geofencePolygon: GeofencePolygon
): GeofenceCenter => {
  return {
    lat: getAverageLatitude(geofencePolygon),
    lng: getAverageLongitude(geofencePolygon),
  };
};

// For calculating the average latitude
const getAverageLatitude = (geofencePolygon: GeofencePolygon) => {
  return (
    geofencePolygon.coordinates.reduce((sum, point) => sum + point[0], 0) /
    geofencePolygon.coordinates.length
  );
};

// For calculating the average longitude
const getAverageLongitude = (geofencePolygon: GeofencePolygon) => {
  return (
    geofencePolygon.coordinates.reduce((sum, point) => sum + point[1], 0) /
    geofencePolygon.coordinates.length
  );
};

// Get valid personnel with coordinates
export const getValidPersonnel = (personnels: Personnel[]): Personnel[] => {
  return (
    personnels?.filter(
      (p) =>
        p &&
        p.lat &&
        p.lng &&
        typeof p.lat === "number" &&
        typeof p.lng === "number"
    ) || []
  );
};
