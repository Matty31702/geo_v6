import { Personnel } from "../../../../types/firestore";
import { GeofencePolygon } from "../../types";

interface MapFooterProps {
  filteredPersonnel: Personnel[];
  validPersonnel: Personnel[];
  geofencePolygon: GeofencePolygon;
}

const MapFooter: React.FC<MapFooterProps> = ({
  filteredPersonnel,
  validPersonnel,
  geofencePolygon,
}) => {
  return (
    <div className="mt-4 bg-white p-4 rounded-lg shadow text-xs text-gray-500">
      <p>
        Map displays {filteredPersonnel.length} out of {validPersonnel.length}{" "}
        personnel with valid coordinates.
      </p>
      <p>
        Custom geofence area defined with {geofencePolygon.coordinates.length}{" "}
        points.
      </p>
      <p>Last updated: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default MapFooter;
