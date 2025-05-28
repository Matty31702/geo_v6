import { useEffect, useState } from "react";
import usePersonnel from "../../dashboard/hooks/usePersonnel";
import { RefreshCw } from "lucide-react";
import CustomHelmet from "../../../shared/components/CustomHelmet";
import HeaderSection from "../../../shared/components/HeaderSection";
import showToast from "../../../shared/utilities/toast";

import EditUserModal from "../components/EditUserModal";
import useAuth from "../../dashboard/hooks/useAuth";
import AddUserModal from "../components/AddUserModal";
import { getFilteredPersonnel } from "../utils/filter";
import PaginationControl from "../../../shared/components/PaginationControl";
import usePagination from "../../../shared/hooks/usePagination";
import StatCard from "../components/StatCard/StatCard";
import SearchFilterSection from "../components/SearchFilterSection";
import Table from "../components/Table";
import DeleteUserModal from "../components/DeleteUserModal";

const Personnel = () => {
  const {
    loading,
    errorResponse,
    personnels,
    selectedPersonnel,
    handleSelectPersonnel,
    getAllPersonnels,
    setSelectedPersonnel,
    deletePersonnel,
  } = usePersonnel();

  // Use pagination
  const { searchTerm, currentPage, handlePageChange, handleSearchChange } =
    usePagination();

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const itemsPerPage = 10;

  const { isSuperAdmin } = useAuth();

  useEffect(() => {
    getAllPersonnels();
  }, []);

  // Get filtered personnel based on search and filters
  const filteredPersonnel = getFilteredPersonnel(searchTerm, personnels);

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
  const totalItems = filteredPersonnel.length;
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

  // Handle delete confirmation
  const handleDeleteConfirmed = async () => {
    if (selectedPersonnel?.id) {
      const success = await deletePersonnel(selectedPersonnel.id);
      if (success) {
        showToast.success("Successfully deleted a personnel!");
        window.location.reload();
        setIsDeleteModalOpen(false);
        setSelectedPersonnel(null);
      } else {
        showToast.error("Failed to delete the personnel.");
      }
    }
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

        {/* Stat Card */}
        <StatCard title="Total Personnels" totalCount={totalPersonnel} />

        {/* Search and Filter Section */}
        <SearchFilterSection
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
        />

        {/* Table Section */}
        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading personnel data...</p>
            </div>
          </div>
        ) : errorResponse ? (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
            <p className="font-medium">Error loading personnel data</p>
            <p className="text-red-600">{errorResponse.other}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-1 bg-red-100 text-red-700 rounded-md flex items-center hover:bg-red-200"
            >
              <RefreshCw size={16} className="mr-2" /> Try Again
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <Table>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  {isSuperAdmin && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {person.email || "No Email"}
                        </div>
                      </td>

                      {isSuperAdmin && (
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
                          <button
                            onClick={() => {
                              handleSelectPersonnel(person);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-500 hover:text-red-700 ml-4"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            {/* Refactored Pagination Control */}
            <PaginationControl
              totalItems={totalItems}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
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
            setIsEditModalOpen(false);
          }}
          onUserEdited={handleUserEdited}
        />
      )}

      {selectedPersonnel && (
        <DeleteUserModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirmDelete={handleDeleteConfirmed}
          personnelName={selectedPersonnel.name}
        />
      )}
    </>
  );
};

export default Personnel;
