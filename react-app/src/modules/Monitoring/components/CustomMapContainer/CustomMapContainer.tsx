import { RefreshCw } from "lucide-react";
import {
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { GeofencePolygon, PoliceHQ } from "../../types";
import L from "leaflet";
import { Personnel } from "../../../../types/firestore";
import { useEffect } from "react";

// Custom icon for HQ
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color: ${color}; width: 11.5px; height: 11.5px; border-radius: 12px; border: 2px solid white;"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Component to auto-fit map to bounds
const FitBounds = ({ markers }: { markers: any[] }) => {
  const map = useMap();

  useEffect(() => {
    // Filter out any markers without valid coordinates before creating bounds
    const validMarkers = markers.filter(
      (m) => m && typeof m.lat === "number" && typeof m.lng === "number"
    );

    if (validMarkers.length > 0) {
      const bounds = L.latLngBounds(validMarkers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);

  return null;
};

interface CustomMapContainerProps {
  loading: boolean;
  policeHQ: PoliceHQ;
  geofencePolygon: GeofencePolygon;
  filteredPersonnel: Personnel[];
  allMarkers: any[];
}

const CustomMapContainer: React.FC<CustomMapContainerProps> = ({
  loading,
  policeHQ,
  geofencePolygon,
  filteredPersonnel,
  allMarkers,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex-grow">
      {loading ? (
        <div className="h-screen flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center">
            <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mb-4" />
            <p className="text-gray-600 text-lg">Loading map data...</p>
          </div>
        </div>
      ) : (
        <div className="h-[500px]">
          <MapContainer
            center={[policeHQ.lat, policeHQ.lng]}
            zoom={25}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
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

              return (
                <Marker
                  key={person.id}
                  position={[person.lat, person.lng]}
                  icon={createCustomIcon("#1e40af")}
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
                        <span className="text-green-600 font-medium">
                          Active
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Auto-fit map to bounds */}
            <FitBounds markers={allMarkers} />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default CustomMapContainer;
