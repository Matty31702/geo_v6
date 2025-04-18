import { useEffect, useRef } from "react";
import { MapContainer, Marker, Polygon, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { GeofencePolygon, PoliceHQ } from "../../types";
import { Personnel } from "../../../../types/firestore";

// Custom icon for HQ and personnel
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color: ${color}; width: 11.5px; height: 11.5px; border-radius: 12px; border: 2px solid white;"></div>`,
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
  allMarkers: any[];
}

const CustomMapContainer: React.FC<CustomMapContainerProps> = ({
  policeHQ,
  geofencePolygon,
  filteredPersonnel,
  allMarkers,
}) => {
  // Store map instance reference
  const mapRef = useRef<L.Map | null>(null);
  
  // Get map reference when initialized
  const whenCreated = (map: L.Map) => {
    mapRef.current = map;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow flex-grow">
      <div className="h-[500px]">
        <MapContainer
          center={[policeHQ.lat, policeHQ.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
          // whenCreated={whenCreated}
        
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Police HQ Marker */}
          <Marker
            position={[policeHQ.lat, policeHQ.lng]}
            icon={createCustomIcon("#333399")}
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
              <div className="font-medium text-lg">
                {geofencePolygon.name}
              </div>
              <div className="text-sm">
                Custom patrol area with {geofencePolygon.coordinates.length}{" "}
                points
              </div>
            </Popup>
          </Polygon>

          {/* Personnel Markers */}
          {filteredPersonnel.map((person: Personnel) => {
            if (!person.lat && !person.lng) {
              return null;
            }

            // Determine marker color based on login status
            const markerColor = person.isLoggedIn ? "#1e40af" : "#dc2626"; // Blue for logged in, Red for logged out

            return (
              <Marker
                key={person.id}
                position={[person.lat, person.lng]}
                icon={createCustomIcon(markerColor)}
              >
                <Popup className="personnel-popup">
                  <div className="font-medium text-lg">{person.name}</div>
                  <div className="grid grid-cols-2 gap-1 mt-2 text-sm">
                    <div className="text-gray-500">ID:</div>
                    <div>{person.id}</div>
                    <div className="text-gray-500">Position:</div>
                    <div>
                      {person.lat.toFixed(5)}, {person.lng.toFixed(5)}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-xs">
                      <span>Status:</span>
                      <span
                        className={`font-medium ${
                          person.isLoggedIn
                            ? "text-green-600"
                            : "text-red-600"
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