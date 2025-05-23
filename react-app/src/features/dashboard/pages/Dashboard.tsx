import { useState, useEffect } from "react";
import CustomHelmet from "../../../shared/components/CustomHelmet";
import {
  Users,
  Truck,
  Clock,
  Activity,
  MapPin,
  Car,
  ShieldAlert,
} from "lucide-react";
import usePersonnel from "../hooks/usePersonnel";
import useVehicle from "../hooks/useVehicle";
import Header from "../components/Header";
import StatCardContainer from "../components/StatCardContainer";
import StatCard from "../components/StatCard";
import QuickActionContainer from "../components/QuickActionContainer";
import { Link } from "react-router-dom";
import LINKS from "../../../core/constants/links";
import showToast from "../../../utilities/toast";
import useAuth from "../hooks/useAuth";
import FormModal from "../components/FormModal";
import {
  getTotalPersonnelInsideGeofence,
  getTotalPersonnelInsideGeofenceOnline,
  getTotalVehicleInsideGeofence,
} from "../utils/count";

const Dashboard = () => {
  // Modal state
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showAuthError, setShowAuthError] = useState<boolean>(false);

  // Use the hooks
  const { personnels, getAllPersonnels } = usePersonnel();
  const { vehicles, getAllVehicles } = useVehicle();
  const { isSuperAdmin } = useAuth();

  // State for calculated stats
  const [stats, setStats] = useState({
    totalPersonnel: 0,
    personnelInside: 0,
    personnelInsideOnline: 0,
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

    // Calculate personnel inside geofence
    const personnelInsideCount = getTotalPersonnelInsideGeofence(personnelData);

    // Calculate personnel inside geofence those that are online
    const personnelInsideOnlineCount =
      getTotalPersonnelInsideGeofenceOnline(personnelData);

    // Calculate vehicles inside geofence
    const vehiclesInsideCount = getTotalVehicleInsideGeofence(vehicleData);

    // Update stats
    setStats({
      totalPersonnel: personnelData.length,
      personnelInside: personnelInsideCount,
      personnelInsideOnline: personnelInsideOnlineCount,
      totalVehicles: vehicleData.length,
      vehiclesInside: vehiclesInsideCount,
    });
  }, [personnels, vehicles]);

  // Handle adding new personnel/vehicle button click
  const handleAddButtonClick = () => {
    // Check if user is a superadmin
    if (isSuperAdmin) {
      setIsOpen(true);
    } else {
      setShowAuthError(true);
      // Hide error message after 3 seconds
      setTimeout(() => {
        setShowAuthError(false);
      }, 3000);
      showToast.error(
        "Permission denied. Only superadmins can add personnel or vehicles."
      );
    }
  };

  // Handle success full object addition
  const handleObjectAdded = (activeTab: string) => {
    // Refresh object list
    if (activeTab === "Personnel") {
      getAllPersonnels();
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

        {/* Auth Error Banner */}
        {showAuthError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4 flex items-center">
            <ShieldAlert className="mr-2" size={20} />
            <span>
              Permission denied. Only superadmins can add personnel or vehicles.
            </span>
          </div>
        )}

        {/* Stats Cards */}
        <StatCardContainer>
          <StatCard>
            <div>
              <p className="text-gray-500 text-sm">
                Personnel Inside Geofence (Online)
              </p>
              <h2 className="text-3xl font-bold text-blue-700">
                {stats.personnelInsideOnline} / {stats.totalPersonnel}
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
            onClick={handleAddButtonClick}
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

      {/* Form Modal - Only opens if user is authorized */}
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
