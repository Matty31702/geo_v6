import { useEffect, useRef } from "react";
import {
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { GeofencePolygon, PoliceHQ } from "../../types";
import { Personnel, Vehicle } from "../../../../shared/types/firestore";
import { isPointInPolygon } from "../../utilities/geofencing";

// Custom icon for personnel with mark numbers
const createMarkedIcon = (
  isLoggedIn: boolean,
  markNumber: string,
  isInsideGeofence: boolean,
  hasVehicle: boolean
) => {
  // Blue for logged in, Red for logged out
  const backgroundColor = isLoggedIn ? "#1e40af" : "#dc2626";
  const textColor = "#ffffff"; // White text for contrast
  // Add thicker border for personnel outside geofence
  const borderStyle = isInsideGeofence
    ? "border: 2px solid white;"
    : "border: 3px solid yellow;";

  // If person has a vehicle, use a square vehicle with a personnel circle inside
  if (hasVehicle) {
    return L.divIcon({
      className: "custom-marker-icon",
      html: `
        <div style="
          background-color: #3b82f6; 
          width: 32px; 
          height: 32px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          position: relative;
        ">
          <!-- Personnel circle inside the vehicle square -->
          <div style="
            width: 20px;
            height: 20px;
            background-color: ${backgroundColor};
            border-radius: 50%;
            ${borderStyle}
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            color: ${textColor};
          ">${markNumber}</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  } else {
    // Original circular icon for personnel without vehicle
    return L.divIcon({
      className: "custom-marker-icon",
      html: `
        <div style="
          background-color: ${backgroundColor}; 
          color: ${textColor}; 
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 12px; 
          font-weight: bold;
          ${borderStyle}
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">${markNumber}</div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
  }
};

// Custom icon for vehicles
const createVehicleIcon = (model: string) => {
  // Size based on model name length (minimum 24px, maximum 40px)
  const size = Math.min(Math.max(24, model.length * 3), 40);

  return L.divIcon({
    className: "vehicle-marker-icon",
    html: `
      <div style="
        background-color: #3b82f6; 
        color: #ffffff; 
        width: ${size}px; 
        height: ${size}px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-size: 10px; 
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      ">${model || "N/A"}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Custom icon for HQ
const createHQIcon = (color: string) => {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color: ${color}; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// This component only sets bounds once on initial load
const InitialMapBounds = ({ markers }: { markers: any[] }) => {
  const map = useMap();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && markers.length > 0) {
      const validMarkers = markers.filter(
        (m) => m && typeof m.lat === "number" && typeof m.lng === "number"
      );

      if (validMarkers.length > 0) {
        const bounds = L.latLngBounds(validMarkers.map((m) => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
        initialized.current = true;
      }
    }
  }, [markers, map]);

  return null;
};

interface CustomMapContainerProps {
  policeHQ: PoliceHQ;
  geofencePolygon: GeofencePolygon;
  filteredPersonnel: Personnel[];
  vehicles: Vehicle[];
  allMarkers: any[];
}

const CustomMapContainer: React.FC<CustomMapContainerProps> = ({
  policeHQ,
  geofencePolygon,
  filteredPersonnel,
  allMarkers,
  vehicles,
}) => {
  // Store map instance reference
  const mapRef = useRef<L.Map | null>(null);

  // Create a map of vehicle user IDs for quick lookup
  const userVehicleMap = new Map<string, Vehicle>();
  const vehiclesWithPersonnel = new Set<string>(); // Keep track of vehicles already associated with personnel

  vehicles.forEach((vehicle) => {
    if (vehicle.user_id || vehicle.userId) {
      const userId = vehicle.user_id || vehicle.userId;
      if (userId) {
        userVehicleMap.set(userId, vehicle);
        vehiclesWithPersonnel.add(vehicle.id); // Mark this vehicle as having an associated personnel
      }
    }
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow flex-grow">
      <div className="h-[500px]">
        <MapContainer
          center={[policeHQ.lat, policeHQ.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
          ref={(map) => {
            if (map) mapRef.current = map;
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Police HQ Marker */}
          <Marker
            position={[policeHQ.lat, policeHQ.lng]}
            icon={createHQIcon("#333399")}
          >
            <Popup className="custom-popup">
              <div className="font-medium text-lg">{policeHQ.name}</div>
              <div className="text-sm">{policeHQ.address}</div>
              <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
                Headquarters
              </div>
            </Popup>
          </Marker>

          <Polygon
            positions={geofencePolygon.coordinates}
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.2,
              weight: 3,
            }}
          >
            <Popup>
              <div className="font-medium text-lg">{geofencePolygon.name}</div>
              <div className="text-sm">
                Custom patrol area with {geofencePolygon.coordinates.length}{" "}
                points
              </div>
            </Popup>
          </Polygon>

          {/* Vehicle Markers */}
          {vehicles.map((vehicle) => {
            // Only render vehicles with latitude and longitude coordinates
            if (!vehicle.lat && !vehicle.lng && !vehicle.long) {
              return null;
            }

            // Use long property if lat property is not available
            const latitude = vehicle.lat || vehicle.latitude || 0;
            const longitude = vehicle.lng || vehicle.long || 0;

            // Only display if we have valid coordinates
            if (!latitude || !longitude) return null;

            return (
              <Marker
                key={vehicle.id}
                position={[latitude, longitude]}
                icon={createVehicleIcon(vehicle.model)}
              >
                <Popup className="vehicle-popup">
                  <div className="font-medium text-lg">
                    {vehicle.model || "Unknown Model"}
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-2 text-sm">
                    <div className="text-gray-500">Plate:</div>
                    <div>
                      {vehicle.plate_number || vehicle.platenumber || "N/A"}
                    </div>
                    <div className="text-gray-500">Color:</div>
                    <div>{vehicle.color || "N/A"}</div>
                    <div className="text-gray-500">Position:</div>
                    <div>
                      {latitude.toFixed(5)}, {longitude.toFixed(5)}
                    </div>
                    {vehicle.user_id && (
                      <>
                        <div className="text-gray-500">Owner ID:</div>
                        <div>{vehicle.user_id || vehicle.userId || "N/A"}</div>
                      </>
                    )}
                    {/* {vehicle.datetime && (
                      <>
                        <div className="text-gray-500">Last Updated:</div>
                        <div>{new Date(vehicle.datetime.seconds * 1000).toLocaleString()}</div>
                      </>
                    )} */}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Personnel Markers with Mark Numbers */}
          {filteredPersonnel.map((person: Personnel) => {
            if (!person.lat && !person.lng) {
              return null;
            }

            // Check if person is inside geofence
            const isInside = isPointInPolygon(
              [person.lat, person.lng],
              geofencePolygon.coordinates
            );

            // Use mark_number for the marker icon, fallback to first letter of name if not available
            const markerText = person.mark_number || person.name.charAt(0);

            // Check if person has a vehicle
            const hasVehicle = userVehicleMap.has(person.id);
            const personVehicle = hasVehicle
              ? userVehicleMap.get(person.id)
              : null;

            return (
              <Marker
                key={person.id}
                position={[person.lat, person.lng]}
                icon={createMarkedIcon(
                  person.isLoggedIn,
                  markerText,
                  isInside,
                  hasVehicle
                )}
              >
                <Popup className="personnel-popup">
                  <div className="font-medium text-lg">{person.name}</div>
                  <div className="grid grid-cols-2 gap-1 mt-2 text-sm">
                    <div className="text-gray-500">ID:</div>
                    <div>{person.id}</div>
                    <div className="text-gray-500">Mark Number:</div>
                    <div>{person.mark_number || "N/A"}</div>
                    <div className="text-gray-500">Position:</div>
                    <div>
                      {person.lat.toFixed(5)}, {person.lng.toFixed(5)}
                    </div>
                    <div className="text-gray-500">Location:</div>
                    <div>
                      {isInside ? (
                        <span className="text-green-600">Inside Geofence</span>
                      ) : (
                        <span className="text-orange-500">
                          Outside Geofence
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500">Last Updated:</div>
                    <div>
                      {person.last_location_update?.split("T")[0] || "N/A"}
                    </div>

                    {/* Show vehicle information if person has a vehicle */}
                    {personVehicle && (
                      <>
                        <div className="col-span-2 mt-2 mb-1 text-blue-600 font-medium">
                          Vehicle Information
                        </div>
                        <div className="text-gray-500">Model:</div>
                        <div>{personVehicle.model || "N/A"}</div>
                        <div className="text-gray-500">Plate:</div>
                        <div>
                          {personVehicle.plate_number ||
                            personVehicle.platenumber ||
                            "N/A"}
                        </div>
                        <div className="text-gray-500">Color:</div>
                        <div>{personVehicle.color || "N/A"}</div>
                      </>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-xs">
                      <span>Status:</span>
                      <span
                        className={`font-medium ${
                          person.isLoggedIn ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {person.isLoggedIn ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Only set bounds on first load */}
          <InitialMapBounds markers={allMarkers} />
        </MapContainer>
      </div>
    </div>
  );
};

export default CustomMapContainer;
