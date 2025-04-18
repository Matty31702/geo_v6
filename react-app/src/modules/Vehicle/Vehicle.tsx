import { useEffect, useState } from "react";
import CustomHelmet from "../../components/CustomHelmet";
import HeaderSection from "../../components/HeaderSection";
import useVehicle from "../../components/hooks/useVehicle";
import { PenTool, Plus, RefreshCw, Search } from "lucide-react";
import type { Vehicle } from "../../types/firestore";
import PaginationControl from "../../components/paginations/PaginationControl";
import AddVehicleModal from "./components/forms/AddVehicleModal";
import showToast from "../../utilities/toast";
import EditVehicleModal from "./components/forms/EditVehicleModal";

const Vehicle = () => {
  // Use vehicle
  const {
    vehicles,
    error,
    loading,
    selectedVehicle,
    handleSelectVehicle,
    handleUnselectVehicle,
    getAllVehicles,
  } = useVehicle();

  // Other states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterColor, setFilterColor] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterType, setFilterType] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false); // State for modal visibility
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false); // State for modal visibility
  const itemsPerPage = 10;

  // Get unique personnel types and sectors for filters
  const colors = [
    ...new Set(vehicles?.map((vehicle: Vehicle) => vehicle.color) || []),
  ];

  // Handle refresh function
  const handleRefresh = () => {
    getAllVehicles();
  };

  // Handle successsful vehicle addition
  const handleVehicleAdd = () => {
    // Refresh the vehicle list
    getAllVehicles();
    // Show success message or notification if needed
    showToast.success("Successfully created a new vehicle!");
  };

  // Handle successful vehicle edit
  const handleUserEdited = () => {
    // Refresh the vehicle list
    getAllVehicles();
    // Show success message or notification if needed
    showToast.success("Successfully edited a vehicle!");
  };

  // Filter vehicle based on search and filers
  const filteredVehicle =
    vehicles?.filter((vehicle: Vehicle) => {
      const matchesSearch =
        !searchTerm ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.plate_number?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesColor = !filterColor || vehicle.color === filterColor;

      return matchesSearch && matchesColor;
    }) || [];

  // Summary statistics
  const totalVehicles = vehicles?.length || 0;

  // Pagination
  const lastPage = Math.ceil(filteredVehicle.length / itemsPerPage);
  const currentItems = filteredVehicle.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fetch data
  useEffect(() => {
    getAllVehicles();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, searchTerm]);

  return (
    <>
      <CustomHelmet title="Vehicles | Geobound" />

      <div className="p-6 bg-gray-50 min-h-screen">
        <HeaderSection
          title="Vehicle Management"
          description="Manage and monitor all police vehicle records"
          handleRefresh={handleRefresh}
        />

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm text-gray-500 mb-1">Total Vehicles</h3>
            <p className="text-2xl font-bold text-gray-800">{totalVehicles}</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-2.5 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by color, model or plate number..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-wrap gap-2 items-center">
              <div className="relative">
                <PenTool
                  size={20}
                  className="absolute left-3 top-2.5 text-gray-400"
                />
                <select
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  value={filterColor}
                  onChange={(e) => setFilterColor(e.target.value)}
                >
                  <option value="">All Colors</option>
                  {colors.map((colors) => (
                    <option key={colors} value={colors}>
                      {colors}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 border border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <Plus size={18} />
                  Add New Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading personnel data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
            <p className="font-medium">Error loading personnel data</p>
            <p className="text-red-600">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-1 bg-red-100 text-red-700 rounded-md flex items-center hover:bg-red-200"
            >
              <RefreshCw size={16} className="mr-2" /> Try Again
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Color
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plate Number
                    </th>
                    {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Personnel
                    </th> */}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No personnel records found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((vehicle: Vehicle, index) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.model || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.color || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {vehicle.plate_number}
                        </td>
                        {/* <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {vehicle.user_id}
                        </td> */}
                        <td className="px-4 py-3 space-x-3 text-sm text-center">
                          <button
                            onClick={() => {
                              setIsEditModalOpen(true);
                              handleSelectVehicle(vehicle);
                            }}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <PaginationControl
              filteredArray={filteredVehicle}
              currentPage={currentPage}
              lastPage={lastPage}
              itemsPerPage={itemsPerPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>

      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onVehicleAdded={handleVehicleAdd}
      />

      {selectedVehicle && (
        <EditVehicleModal
          selectedVehicle={selectedVehicle}
          isOpen={isEditModalOpen}
          onClose={() => {
            handleUnselectVehicle();
            setIsEditModalOpen(false);
          }}
          onVehicleEdited={handleUserEdited}
        />
      )}
    </>
  );
};

export default Vehicle;
