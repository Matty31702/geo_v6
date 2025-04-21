import { useState, useEffect } from "react";
import CustomHelmet from "../../components/CustomHelmet";
import { Users, Truck, Clock, Activity, MapPin, Car } from "lucide-react";
import usePersonnel from "../../components/hooks/usePersonnel";
import useVehicle from "../../components/hooks/useVehicle";
import Header from "./components/Header";
import StatCardContainer from "./components/StatCardContainer";
import StatCard from "./components/StatCard";
import QuickActionContainer from "./components/QuickActionContainer";
import { Link } from "react-router-dom";
import LINKS from "../../constants/links";
import { GEO_FENCE_POLYGON } from "../Monitoring/constants";
import FormModal from "./components/FormModal";
import showToast from "../../utilities/toast";

// Type for latitude/longitude pair
type LatLngTuple = [number, number];

// Function to check if a point is inside a polygon (ray casting algorithm)
const isPointInPolygon = (point: LatLngTuple, polygon: LatLngTuple[]) => {
  const x = point[0],
    y = point[1];
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
};

const Dashboard = () => {
  // Modal state
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Use the hooks
  const { personnels, getAllPersonnels } = usePersonnel();
  const { vehicles, getAllVehicles } = useVehicle();

  // State for calculated stats
  const [stats, setStats] = useState({
    totalPersonnel: 0,
    personnelInside: 0,
    totalVehicles: 0,
    vehiclesInside: 0,
  });

  // Fetch data only once when component mounts
  useEffect(() => {
    getAllPersonnels();
    getAllVehicles();
  }, []); // Empty dependency array ensures it only runs once

  // Process data separately when personnels or vehicles change
  useEffect(() => {
    // Skip calculations if data isn't loaded yet
    if (!personnels || !vehicles) return;
    
    // Use empty data array or actual data when available
    const personnelData = personnels?.length ? personnels : [];
    const vehicleData = vehicles?.length ? vehicles : [];

    // Get geofence coordinates properly typed
    const geofenceCoordinates = GEO_FENCE_POLYGON.coordinates as LatLngTuple[];

    // Calculate personnel inside geofence
    let personnelInsideCount = 0;
    personnelData.forEach((person) => {
      if (person.lat && person.lng && person.lat !== 0 && person.lng !== 0) {
        const personCoords: LatLngTuple = [person.lat, person.lng];
        const isInside = isPointInPolygon(personCoords, geofenceCoordinates);
        if (isInside) {
          personnelInsideCount++;
        }
      }
    });

    // Calculate vehicles inside geofence
    let vehiclesInsideCount = 0;
    vehicleData.forEach((vehicle) => {
      // Handle both 'lng' and 'long' property names
      const longitude = vehicle.lng || vehicle.long;
      if (vehicle.lat && longitude && vehicle.lat !== 0 && longitude !== 0) {
        const vehicleCoords: LatLngTuple = [vehicle.lat, longitude];
        const isInside = isPointInPolygon(vehicleCoords, geofenceCoordinates);
        if (isInside) {
          vehiclesInsideCount++;
        }
      }
    });

    // Update stats
    setStats({
      totalPersonnel: personnelData.length,
      personnelInside: personnelInsideCount,
      totalVehicles: vehicleData.length,
      vehiclesInside: vehiclesInsideCount,
    });
  }, [personnels, vehicles]);

  // Handle success full object addition
  const handleObjectAdded = (activeTab: string) => {
    // Refresh object list
    if (activeTab === "Personnel") {
      getAllPersonnels();

      // Show success message or notification if needed
      showToast.success("Successfully created a new personnel!");
    } else {
      getAllVehicles();
      showToast.success("Successfully created a new vehicle!");
    }
  };

  return (
    <>
      <CustomHelmet title="Dashboard | Geobound" />
      <div className="space-y-6">
        {/* Header */}
        <Header />

        {/* Stats Cards */}
        <StatCardContainer>
          <StatCard>
            <div>
              <p className="text-gray-500 text-sm">Personnel Inside Geofence</p>
              <h2 className="text-3xl font-bold text-indigo-700">
                {stats.personnelInside} / {stats.totalPersonnel}
              </h2>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <Users className="text-indigo-700" size={24} />
            </div>
          </StatCard>

          <StatCard>
            <div>
              <p className="text-gray-500 text-sm">Vehicles Inside Geofence</p>
              <h2 className="text-3xl font-bold text-blue-700">
                {stats.vehiclesInside} / {stats.totalVehicles}
              </h2>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Truck className="text-blue-700" size={24} />
            </div>
          </StatCard>
        </StatCardContainer>

        {/* Main Content (Quick Actions) */}
        <QuickActionContainer>
          <Link
            to={LINKS.PERSONNELS}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md flex items-center justify-center"
          >
            <Users className="mr-2" size={18} />
            Personnel
          </Link>
          <Link
            to={LINKS.VEHICLES}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md flex items-center justify-center"
          >
            <Car className="mr-2" size={18} />
            Vehicles
          </Link>
          <button
            onClick={() => setIsOpen(true)}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md flex items-center justify-center"
          >
            <Clock className="mr-2" size={18} />
            Add Personnel/Vehicles
          </button>
          <Link
            to={LINKS.ACTIVITIES}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md flex items-center justify-center"
          >
            <Activity className="mr-2" size={18} />
            Logged Entry/Exit
          </Link>
          <Link
            to={LINKS.MONITORING}
            className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md flex items-center justify-center"
          >
            <MapPin className="mr-2" size={18} />
            Monitor Realtime Status
          </Link>
        </QuickActionContainer>
      </div>

      {/* Form Modal */}
      <FormModal
        isOpen={isOpen}
        personnels={personnels}
        onClose={() => setIsOpen(false)}
        onObjectAdded={handleObjectAdded}
      />
    </>
  );
};

export default Dashboard;