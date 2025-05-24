// Prepare markers for map bounds calculation
import { LatLngTuple } from "leaflet";
import { Personnel } from "../../../shared/types/firestore";
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

/**
 * Check if a point is inside a polygon using ray casting algorithm
 * @param point - [lat, lng] coordinates
 * @param polygon - Array of [lat, lng] coordinates
 * @returns boolean - true if point is inside polygon
 */
export const isPointInPolygon = (
  point: [number, number],
  polygon: LatLngTuple[]
): boolean => {
  const x = point[0];
  const y = point[1];

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
};

/**
 *
 *
 *
 * TBD
 *
 *
 *
 */
