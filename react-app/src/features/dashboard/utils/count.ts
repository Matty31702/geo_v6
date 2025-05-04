import { Personnel } from "../api/types/personnel";
import { GEO_FENCE_POLYGON } from "../../../shared/constants/geofence";
import {
  isPointInPolygon,
  LatLngTuple,
} from "../../../shared/utilities/geofencing";
import { Vehicle } from "../api/types/vehicle";

// Get total personnel inside geofence
const getTotalPersonnelInsideGeofence = (personnels: Personnel[]): number => {
  // Calculate personnel inside geofence
  let personnelInsideCount = 0;

  personnels.forEach((person) => {
    if (person.lat && person.lng && person.lat !== 0 && person.lng !== 0) {
      const personCoords: LatLngTuple = [person.lat, person.lng] as LatLngTuple;
      const isInside = isPointInPolygon(
        personCoords,
        GEO_FENCE_POLYGON.coordinates as LatLngTuple[]
      );
      if (isInside) {
        personnelInsideCount++;
      }
    }
  });

  // Return count
  return personnelInsideCount;
};

// Get total personnels inside geofence that are online
const getTotalPersonnelInsideGeofenceOnline = (
  personnels: Personnel[]
): number => {
  let personnelInsideOnlineCount = 0;

  personnels.forEach((person) => {
    if (
      person.lat &&
      person.lng &&
      person.lat !== 0 &&
      person.lng !== 0 &&
      person.isLoggedIn
    ) {
      const personCoords: LatLngTuple = [person.lat, person.lng];
      const isInside = isPointInPolygon(
        personCoords,
        GEO_FENCE_POLYGON.coordinates as LatLngTuple[]
      );
      if (isInside) {
        personnelInsideOnlineCount++;
      }
    }
  });

  return personnelInsideOnlineCount;
};

// Get total vehicles inside geofence
const getTotalVehicleInsideGeofence = (vehicles: Vehicle[]) => {
  let vehiclesInsideCount = 0;

  vehicles.forEach((vehicle) => {
    // Handle both 'lng' and 'long' property names
    const longitude = vehicle.lng || vehicle.long;
    if (vehicle.lat && longitude && vehicle.lat !== 0 && longitude !== 0) {
      const vehicleCoords: LatLngTuple = [vehicle.lat, longitude];
      const isInside = isPointInPolygon(
        vehicleCoords,
        GEO_FENCE_POLYGON.coordinates as LatLngTuple[]
      );
      if (isInside) {
        vehiclesInsideCount++;
      }
    }
  });

  return vehiclesInsideCount;
};

export {
  getTotalPersonnelInsideGeofence,
  getTotalPersonnelInsideGeofenceOnline,
  getTotalVehicleInsideGeofence,
};
