import React from "react";
import FormContainer from "../../../../components/FormContainer/FormContainer";
import FormHeader from "../../../../components/FormHeader";
import { GeofencePolygon } from "../../types";
import { Personnel, Vehicle } from "../../../../types/firestore";
import { isPointInPolygon } from "../../utilities/geofencing";

interface ViewTableModalProps {
  type: "Personnel" | "Vehicle";
  isOpen: boolean;
  onClose: () => void;
  personnels: Personnel[];
  vehicles: Vehicle[];
  geofencePolygon: GeofencePolygon;
}

const ViewTableModal: React.FC<ViewTableModalProps> = ({
  isOpen,
  type,
  personnels = [],
  vehicles = [],
  geofencePolygon,
  onClose,
}) => {
  // Check type
  const title: string =
    type === "Personnel" ? "Personnel Statuses" : "Vehicle Statuses";

  // Check table headers
  const tableHeaders: string[] =
    type === "Personnel"
      ? ["ID Number", "Name", "Coordinates", "Current Status"]
      : ["Personnel ID", "Model", "Plate Number", "Coordinates", "Current Status"];

  if (!isOpen) return null;

  // Helper function to determine if a point is in the geofence
  const checkIfInGeofence = (lat: number, lng: number) => {
    if (!lat || !lng || !geofencePolygon) return false;
    return isPointInPolygon([lat, lng], geofencePolygon.coordinates);
  };

  return (
    <FormContainer>
      <FormHeader title={title} onClose={onClose} />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {tableHeaders.map((head, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {type === "Personnel" && personnels
                ? personnels.map((person, index) => {
                    // Check if person has valid coordinates and is in geofence
                    const isInGeofence = checkIfInGeofence(
                      person.lat,
                      person.lng
                    );

                    return (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          {person.username || "-"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          {person.name || "-"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {`${person.lat} - ${person.lng}`}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded text-white font-medium ${
                              isInGeofence ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            {isInGeofence
                              ? "Present"
                              : "Not Present"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                : vehicles.map((vehicle, index) => {
                    // Check if vehicle has valid coordinates and is in geofence
                    const isInGeofence = checkIfInGeofence(
                      vehicle.lat || vehicle.latitude || 0,
                      vehicle.lng || vehicle.long || 0
                    );

                    return (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          {vehicle.user_id || "-"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          {vehicle.model || "-"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          {vehicle.plate_number || "-"}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          {`${vehicle.lat} - ${vehicle.lng}`}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded text-white font-medium ${
                              isInGeofence ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            {isInGeofence
                              ? "Present"
                              : "Not Present"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </FormContainer>
  );
};

export default ViewTableModal;
