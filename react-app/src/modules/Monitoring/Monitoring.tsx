import React, { useState, useEffect } from "react";
import { MapPin, Users, Layers, Shield, RefreshCw } from "lucide-react";
import usePersonnel from "../../components/hooks/usePersonnel";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  Polygon,
} from "react-leaflet";
import L, { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";

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

const Monitoring = () => {
  // Use custom hook to get personnel data
  const { personnels, loading, error, getAllPersonnels } = usePersonnel();
  const [selectedSector, setSelectedSector] = useState("all");
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

  // Police HQ coordinates
  const policeHQ = {
    name: "Police Regional Office 10",
    address: "Camp 1Lt Vicente G. Alagar, Claro M. Recto Ave, Cagayan de Oro",
    lat: 8.4859,
    lng: 124.6574,
  };

  // Define the polygon points (replace with actual coordinates of your shape)
  // GeoJSON LineString converted to polygon (as [lat, lng] pairs)
  const geofencePolygon: {
    name: string;
    coordinates: LatLngTuple[];
  } = {
    name: "Custom Geofence",
    coordinates: [
      [8.480073626313512, 124.6592024185556],
      [8.480771448610795, 124.659781966325],
      [8.481003199181472, 124.65989139888063],
      [8.481336693599516, 124.6597687873508],
      [8.481749013571928, 124.6601243607887],
      [8.481810618726058, 124.66008558272824],
      [8.481958083098945, 124.66018000961981],
      [8.481997406921607, 124.66033904438592],
      [8.482213687877376, 124.6604831696423],
      [8.482375898513538, 124.6604781998065],
      [8.482508616256084, 124.66082111851995],
      [8.481975510968397, 124.66114277826864],
      [8.481782415418323, 124.66200779579509],
      [8.481531681331873, 124.66223523744821],
      [8.480877816406121, 124.66193511834342],
      [8.480499538569816, 124.66190869724471],
      [8.480697035643217, 124.66061779102608],
      [8.480093422147974, 124.6604375566402],
      [8.479679624772032, 124.660560881599],
      [8.479371902416062, 124.6594855946534],
      [8.479867192145548, 124.65904421835654],
      [8.480077545798508, 124.65920321515875],
    ],
  };

  // Get valid personnel with coordinates
  const validPersonnel =
    personnels?.filter(
      (p) => p && p.lat && p.lng && typeof p.lat === 'number' && typeof p.lng === 'number'
    ) || [];

  // Filter based on selected sector
  const filteredPersonnel =
    selectedSector === "all"
      ? validPersonnel
      : validPersonnel.filter((p) => p.sector === selectedSector);

  // Count personnel by sector
  const sectorCounts = validPersonnel.reduce((acc: any, p: any) => {
    acc[p.sector] = (acc[p.sector] || 0) + 1;
    return acc;
  }, {});

  // Get unique sectors
  const sectors = [...new Set(validPersonnel.map((p) => p.sector))].sort();

  // Define sector colors
  const sectorColors: any = {
    "1": "#3b82f6", // blue
    "2": "#ef4444", // red
    "3": "#10b981", // green
    "4": "#f59e0b", // amber
    "5": "#8b5cf6", // purple
    qwerqwer: "#6b7280", // gray
  };

  // Get color for sector
  const getSectorColor = (sector: any) => {
    return sectorColors[sector] || "#6b7280";
  };

  // Prepare markers for map bounds calculation
  // Convert geofencePolygon to a format similar to other markers for bounds calculation
  const geofenceCenter = {
    lat: geofencePolygon.coordinates.reduce((sum, point) => sum + point[0], 0) / geofencePolygon.coordinates.length,
    lng: geofencePolygon.coordinates.reduce((sum, point) => sum + point[1], 0) / geofencePolygon.coordinates.length
  };
  
  // Only include valid markers
  const allMarkers = [
    policeHQ,
    { ...geofenceCenter, name: geofencePolygon.name },
    ...validPersonnel
  ].filter(marker => marker && typeof marker.lat === 'number' && typeof marker.lng === 'number');

  return (
    <div className="flex flex-col bg-gray-100 p-4 rounded-lg shadow-lg w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Shield className="text-blue-800 mr-2" size={24} />
          <h1 className="text-2xl font-bold text-blue-800">
            Police Regional Office 10 - Personnel Location Map
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-3 py-1 rounded flex items-center hover:bg-blue-700 transition-colors"
            disabled={loading || refreshing}
          >
            <RefreshCw
              className={`mr-1 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>{loading || refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <div className="flex items-center">
            <span className="mr-2 text-gray-700">Filter by Sector:</span>
            <select
              className="bg-white border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
            >
              <option value="all">All Sectors</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  Sector {sector} ({sectorCounts[sector] || 0})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Map Container */}
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

        {/* Personnel List */}
        <div className="w-64 ml-4 bg-white p-4 rounded-lg shadow overflow-auto h-96">
          <div className="flex items-center mb-3">
            <Users className="text-blue-800 mr-2" size={16} />
            <h2 className="text-lg font-bold text-blue-800">Personnel</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm">
              Error loading personnel data
            </div>
          ) : filteredPersonnel.length === 0 ? (
            <div className="text-gray-500 text-sm py-4">
              No personnel found with valid coordinates
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredPersonnel.map((person) => (
                <li key={person.id} className="py-2">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: getSectorColor(person.sector) }}
                    />
                    <span className="text-sm font-medium">{person.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-5">
                    Sector {person.sector}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4 flex bg-white p-4 rounded-lg shadow">
        {/* Map Legend */}
        <div className="grid grid-cols-3 gap-4 text-sm w-full">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-800 mr-2"></div>
            <span>Police HQ</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded border-2 border-dashed border-blue-500 bg-blue-100 mr-2"></div>
            <span>Geofence Area</span>
          </div>
          {sectors.map((sector) => (
            <div key={sector} className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: getSectorColor(sector) }}
              ></div>
              <span>
                Sector {sector} ({sectorCounts[sector] || 0})
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 bg-white p-4 rounded-lg shadow text-xs text-gray-500">
        <p>
          Map displays {filteredPersonnel.length} out of {validPersonnel.length}{" "}
          personnel with valid coordinates.
        </p>
        <p>
          Custom geofence area defined with {geofencePolygon.coordinates.length} points.
        </p>
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default Monitoring;