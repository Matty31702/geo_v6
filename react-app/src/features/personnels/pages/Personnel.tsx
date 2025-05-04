import { useEffect, useState } from "react";
import usePersonnel from "../../../components/hooks/usePersonnel";
import { Search, RefreshCw } from "lucide-react";
import CustomHelmet from "../../../shared/components/CustomHelmet";
import HeaderSection from "../../../shared/components/HeaderSection";
import showToast from "../../../utilities/toast";
import PaginationControl from "../../../components/paginations/PaginationControl";
import EditUserModal from "../components/EditUserModal";
import useAuth from "../../../components/hooks/useAuth";
import AddUserModal from "../components/AddUserModal";

const Personnel = () => {
  const {
    loading,
    error,
    personnels,
    selectedPersonnel,
    handleSelectPersonnel,
    getAllPersonnels,
    setSelectedPersonnel,
  } = usePersonnel();
  const [searchTerm, setSearchTerm] = useState("");
  // const [filterType, setFilterType] = useState("");
  // const [filterSector, setFilterSector] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false); // State for modal visibility
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false); // State for modal visibility
  const itemsPerPage = 10;

  const { isSuperAdmin } = useAuth();

  useEffect(() => {
    getAllPersonnels();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter personnel based on search and filters
  const filteredPersonnel =
    personnels?.filter((person) => {
      const matchesSearch =
        !searchTerm ||
        person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.phone_number?.includes(searchTerm);

      return matchesSearch;
    }) || [];

  // Summary statistics
  const totalPersonnel = personnels?.length || 0;

  // Calculate personnel counts by type
  const personnelByType: { [key: string]: number } = {};

  personnels?.forEach((person) => {
    if (person.type) {
      personnelByType[person.type] = (personnelByType[person.type] || 0) + 1;
    }
  });

  // Pagination
  const lastPage = Math.ceil(filteredPersonnel.length / itemsPerPage);
  const currentItems = filteredPersonnel.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle refresh function
  const handleRefresh = () => {
    getAllPersonnels();
  };

  // Handle successful user addition
  const handleUserAdded = () => {
    // Refresh the personnel list
    getAllPersonnels();
    // Show success message or notification if needed
    showToast.success("Successfully created a new personnel!");
  };

  // Handle successful user edit
  const handleUserEdited = () => {
    // Refresh the personnel list
    getAllPersonnels();
    // Show success message or notification if needed
    showToast.success("Successfully edited a personnel!");
  };

  return (
    <>
      <CustomHelmet title="Personnels | Geobound" />

      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <HeaderSection
          title="Personnel Management"
          description="Manage and monitor all police personnel records"
          handleRefresh={handleRefresh}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm text-gray-500 mb-1">Total Personnels</h3>
            <p className="text-2xl font-bold text-gray-800">{totalPersonnel}</p>
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
                  placeholder="Search by name, email or number..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                      Name
                    </th>
                 
                    {isSuperAdmin && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    )}
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
                    currentItems.map((person, index) => (
                      <tr key={person.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {person.name || "-"}
                          </div>
                        </td>
                     
                        {
                          isSuperAdmin && (
                            <td className="px-4 py-3 space-x-3 text-sm text-center">
                          <button
                            onClick={() => {
                              setIsEditModalOpen(true);
                              handleSelectPersonnel(person);
                            }}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            Edit
                          </button>
                         
                        </td>
                          )
                        }
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <PaginationControl
              filteredArray={filteredPersonnel}
              currentPage={currentPage}
              lastPage={lastPage}
              itemsPerPage={itemsPerPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={handleUserAdded}
      />

      {selectedPersonnel && (
        <EditUserModal
          selectedPersonnel={selectedPersonnel}
          isOpen={isEditModalOpen}
          onClose={() => {
            setSelectedPersonnel(null);
            setIsEditModalOpen(false)
          }}
          onUserEdited={handleUserEdited}
        />
      )}
    </>
  );
};

export default Personnel;
