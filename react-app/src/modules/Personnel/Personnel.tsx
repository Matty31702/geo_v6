import { useEffect, useState } from "react";
import usePersonnel from "../../components/hooks/usePersonnel";
import { Search, RefreshCw, MapPin, Plus } from "lucide-react";
import CustomHelmet from "../../components/CustomHelmet";
import HeaderSection from "../../components/HeaderSection";
import AddUserModal from "./components/AddUserModal";
import showToast from "../../utilities/toast";

const Personnel = () => {
  const { loading, error, personnels, getAllPersonnels } = usePersonnel();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State for modal visibility
  const itemsPerPage = 10;

  useEffect(() => {
    getAllPersonnels();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterSector]);

  // Get unique personnel types and sectors for filters
  const personTypes = [
    ...new Set(personnels?.map((person) => person.type) || []),
  ];
  const sectors = [
    ...new Set(personnels?.map((person) => person.sector) || []),
  ];

  // Filter personnel based on search and filters
  const filteredPersonnel =
    personnels?.filter((person) => {
      const matchesSearch =
        !searchTerm ||
        person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.number?.includes(searchTerm);

      const matchesType = !filterType || person.type === filterType;
      const matchesSector = !filterSector || person.sector === filterSector;

      return matchesSearch && matchesType && matchesSector;
    }) || [];

  // Summary statistics
  const totalPersonnel = personnels?.length || 0;
  const verifiedCount = personnels?.filter((p) => p.isVerified).length || 0;
  const unverifiedCount = totalPersonnel - verifiedCount;

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

  /* const exportToCSV = () => {
    // Implementation for exporting to CSV would go here
    alert("Export to CSV functionality would be implemented here");
  }; */

  /* const printData = () => {
    window.print();
  }; */

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
            <h3 className="text-sm text-gray-500 mb-1">Total Personnel</h3>
            <p className="text-2xl font-bold text-gray-800">{totalPersonnel}</p>
          </div>
          {/* <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm text-gray-500 mb-1">Verified Personnel</h3>
          <div className="flex items-center">
            <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
            <span className="text-sm text-gray-500 ml-2">
              ({totalPersonnel ? Math.round((verifiedCount / totalPersonnel) * 100) : 0}%)
            </span>
          </div>
        </div> */}
          {/* <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm text-gray-500 mb-1">Pending Verification</h3>
          <p className="text-2xl font-bold text-amber-500">{unverifiedCount}</p>
        </div> */}
          {/* <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm text-gray-500 mb-1">Personnel Types</h3>
          <div className="text-sm mt-2 max-h-20 overflow-auto">
            {Object.entries(personnelByType).map(([type, count]) => (
              <div key={type} className="flex justify-between mb-1">
                <span className="text-gray-600">{type}:</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div> */}
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
            <div className="w-full md:w-auto flex flex-wrap gap-2 items-center">
              {/* <div className="relative">
              <Filter size={20} className="absolute left-3 top-2.5 text-gray-400" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                {personTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div> */}
              <div className="relative">
                <MapPin
                  size={20}
                  className="absolute left-3 top-2.5 text-gray-400"
                />
                <select
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  value={filterSector}
                  onChange={(e) => setFilterSector(e.target.value)}
                >
                  <option value="">All Sectors</option>
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
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
                  Add New Personnel
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
                      Name
                    </th>
                    {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th> */}
                    {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th> */}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sector
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coordinates
                    </th>
                    {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
                    {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th> */}
                    {/* <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
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
                        {/* <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{person.email || "-"}</div>
                        <div className="text-sm text-gray-500">{person.number || "-"}</div>
                      </td> */}
                        {/* <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {person.type}
                        </span>
                      </td> */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {person.sector}
                        </td>
                        <td className="px-4 py-3">
                          {/* <div
                            className="text-sm text-gray-900 truncate max-w-xs"
                            title={person.address}
                          >
                            {person.address}
                          </div> */}
                          <div className="text-xs text-gray-500">
                            {person.lat}, {person.lng}
                          </div>
                        </td>
                        {/* <td className="px-4 py-3 whitespace-nowrap">
                        {person.isVerified ? (
                          <span className="px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            <UserCheck size={14} className="mr-1" /> Verified
                          </span>
                        ) : (
                          <span className="px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                            <UserX size={14} className="mr-1" /> Pending
                          </span>
                        )}
                      </td> */}
                        {/* <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(person.dateTime.seconds * 1000).toLocaleDateString()}
                        <div className="text-xs text-gray-400">
                          {new Date(person.dateTime.seconds * 1000).toLocaleTimeString()}
                        </div>
                      </td> */}
                        {/* <td className="px-4 py-3 space-x-3 text-sm text-center">
                        <button className="text-blue-600 hover:text-blue-800">
                          View
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          Delete
                        </button>
                      </td> */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredPersonnel.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, lastPage))
                    }
                    disabled={currentPage === lastPage}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === lastPage
                        ? "bg-gray-100 text-gray-400"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {Math.min(
                          filteredPersonnel.length,
                          (currentPage - 1) * itemsPerPage + 1
                        )}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredPersonnel.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {filteredPersonnel.length}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        &larr;
                      </button>
                      {[...Array(lastPage).keys()].map((page) => {
                        const pageNumber = page + 1;
                        // Show limited page buttons for better UI
                        if (
                          pageNumber === 1 ||
                          pageNumber === lastPage ||
                          (pageNumber >= currentPage - 1 &&
                            pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border ${
                                currentPage === pageNumber
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              } text-sm font-medium`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          (pageNumber === currentPage - 2 && pageNumber > 1) ||
                          (pageNumber === currentPage + 2 &&
                            pageNumber < lastPage)
                        ) {
                          return (
                            <span
                              key={page}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(prev + 1, lastPage))
                        }
                        disabled={currentPage === lastPage}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage === lastPage
                            ? "bg-gray-100 text-gray-400"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        &rarr;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
    </>
  );
};

export default Personnel;
