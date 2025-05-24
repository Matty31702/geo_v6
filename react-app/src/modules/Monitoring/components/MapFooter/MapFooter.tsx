import React from "react";
import { GeofencePolygon } from "../../types";
import { Personnel } from "../../../../features/dashboard/shared/types/personnel";
import { Vehicle } from "../../../../features/vehicles/shared/types/vehicle";

interface MapFooterProps {
  validPersonnel: Personnel[];
  personnels: Personnel[];
  vehiclesWithCoordinates: Vehicle[];
  vehicles: Vehicle[];
  personnelInGeofence: number;
  personnelOutsideGeofence: number;
  geofencePolygon: GeofencePolygon;

  handleOpen: (value: "Personnel" | "Vehicle") => void;
}

const MapFooter: React.FC<MapFooterProps> = ({
  // validPersonnel,
  // personnels,
  // vehicles,
  // vehiclesWithCoordinates,
  // personnelInGeofence,
  // personnelOutsideGeofence,
  // geofencePolygon,
  handleOpen,
}) => {
  return (
    <>
      <div className="space-y-3">
        {/* <div className="mt-4 bg-white p-4 rounded-lg shadow text-xs text-gray-500">
          <p>
            Map displays {validPersonnel.length} out of {personnels.length}{" "}
            personnel with valid coordinates.
          </p>
          <p>
            Online personnel:{" "}
            {validPersonnel.filter((p) => p.isLoggedIn).length}
          </p>
          <p>
            Vehicles displayed: {vehiclesWithCoordinates.length} out of{" "}
            {vehicles?.length || 0} vehicles
          </p>
          <p>
            Personnel inside geofence: {personnelInGeofence} | Outside geofence:{" "}
            {personnelOutsideGeofence}
          </p>
          <p>
            Custom geofence area defined with{" "}
            {geofencePolygon.coordinates.length} points.
          </p>
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div> */}

        <div className="flex items-center gap-1 mt-3">
          <button
            onClick={() => handleOpen("Personnel")}
            className="w-full px-3 font-bold text-white py-2 bg-yellow-500 hover:bg-yellow-600 transition duration-75"
          >
            Personnels
          </button>
          <button
            onClick={() => handleOpen("Vehicle")}
            className="w-full px-3 font-bold text-white py-2 bg-yellow-500 hover:bg-yellow-600 transition duration-75"
          >
            Vehicles
          </button>
        </div>
      </div>
    </>
  );
};

export default MapFooter;
