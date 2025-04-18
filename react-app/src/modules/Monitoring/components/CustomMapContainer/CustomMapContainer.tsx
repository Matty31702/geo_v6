import { RefreshCw } from "lucide-react";
import { MapContainer, Marker, Polygon, Popup, TileLayer, useMap } from "react-leaflet";
import { GeofencePolygon, PoliceHQ } from "../../types";
import L from "leaflet";
import { Personnel } from "../../../../types/firestore";
import { getSectorColor } from "../../utilities/geofencing";
import { useEffect } from "react";

// Custom icon for HQ
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 12px; border: 2px solid white;"></div>`,
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
      (m) => m && typeof m.lat === 'number' && typeof m.lng === 'number'
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

const CustomMapContainer: React.FC<CustomMapContainerProps> = ({loading, policeHQ, geofencePolygon, filteredPersonnel, allMarkers}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex-grow">
      {loading ? (
        <div className="h-96 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center">
            <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mb-2" />
            <p className="text-gray-600">Loading personnel data...</p>
          </div>
        </div>
      ) : (
        <div className="h-96">
          <MapContainer
            center={[policeHQ.lat, policeHQ.lng]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Police HQ Marker */}
            <Marker
              position={[policeHQ.lat, policeHQ.lng]}
              icon={createCustomIcon("#1e40af")}
            >
              <Popup>
                <div className="font-medium">{policeHQ.name}</div>
                <div className="text-xs">{policeHQ.address}</div>
              </Popup>
            </Marker>

            <Polygon
              positions={geofencePolygon.coordinates}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.2,
              }}
            >
              <Popup>
                <div className="font-medium">{geofencePolygon.name}</div>
                <div className="text-xs">
                  Custom polygon area drawn from GeoJSON
                </div>
              </Popup>
            </Polygon>

            {/* Personnel Markers */}
            {filteredPersonnel.map((person) => (
              <Marker
                key={person.id}
                position={[person.lat, person.lng]}
                icon={createCustomIcon(getSectorColor(person.sector))}
              >
                <Popup>
                  <div className="font-medium">{person.name}</div>
                  <div className="text-xs">ID: {person.id}</div>
                  <div className="text-xs">Sector: {person.sector}</div>
                  <div className="text-xs">
                    Position: {person.lat}, {person.lng}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Auto-fit map to bounds */}
            <FitBounds markers={allMarkers} />
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default CustomMapContainer;
