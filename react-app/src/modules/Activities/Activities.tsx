import { useEffect, useState } from "react";
import { RefreshCw, Download, Search } from "lucide-react";
import CustomHelmet from "../../shared/components/CustomHelmet";
import HeaderSection from "../../shared/components/HeaderSection";
import showToast from "../../shared/utilities/toast";
import PaginationControl from "../../components/paginations/PaginationControl";
import { format } from "date-fns";
import useActivity from "../../components/hooks/useActivity";
import { Activity } from "../../features/activity/shared/types/activity";

const Activities = () => {
  const { loading, error, activities, getAllActivities } = useActivity();

  const [searchTerm, setSearchTerm] = useState(""); // Re-enabled search
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    getAllActivities();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, statusFilter]); // Added searchTerm to dependencies

  // Filter activities based on search, date filters, and status filter
  const filteredActivities =
    activities?.filter((record: Activity) => {
      // Search filter - search by user name and user ID
      const matchesSearch =
        searchTerm === "" ||
        record.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user?.mark_number
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Date filter
      let matchesDate = true;
      if (startDate || endDate) {
        const recordDate = record.date_time ? new Date(record.date_time) : null;

        if (recordDate) {
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (recordDate < start) matchesDate = false;
          }

          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (recordDate > end) matchesDate = false;
          }
        }
      }

      // Status filter
      let matchesStatus = true;
      if (statusFilter !== "ALL") {
        matchesStatus = record.status === statusFilter;
      }

      return matchesSearch && matchesDate && matchesStatus;
    }) || [];

  // Pagination
  const lastPage = Math.ceil(filteredActivities.length / itemsPerPage);
  const currentItems = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle refresh function
  const handleRefresh = () => {
    getAllActivities();
    showToast.success("Activities refreshed successfully!");
  };

  // Export to CSV function - now exports only filtered activities
  const exportToCSV = () => {
    if (filteredActivities.length === 0) {
      showToast.error("No activities to export");
      return;
    }

    // Define CSV headers
    const headers = [
      "User ID",
      "Name",
      "Date & Time",
      "Vehicle",
      "Plate Number",
      "Entry Time",
      "Exit Time",
      "Status",
      "Hours In",
      "Latitude",
      "Longitude",
    ];

    // Create CSV content from filtered activities
    const csvContent = [
      headers.join(","),
      ...filteredActivities.map((record: Activity) =>
        [
          `"${record.user?.mark_number || ""}"`,
          `"${record.user?.name || ""}"`,
          `"${record.date_time || ""}"`,
          `"${
            record.vehicle
              ? `${record.vehicle.model} - ${record.vehicle.color}`
              : ""
          }"`,
          `"${record.vehicle?.plate_number || ""}"`,
          `"${record.entry_time || ""}"`,
          `"${record.exit_time || ""}"`,
          `"${record.status || ""}"`,
          `"${record.hours_in || ""}"`,
          `"${record.lat || ""}"`,
          `"${record.lng || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const fileName = `activities_export_${
      new Date().toISOString().split("T")[0]
    }${
      searchTerm
        ? `_${searchTerm.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}`
        : ""
    }${statusFilter !== "ALL" ? `_${statusFilter.toLowerCase()}` : ""}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast.success(
      `${filteredActivities.length} activities exported successfully!`
    );
  };

  // Format date for display
  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return "-";
    try {
      const date = new Date(dateTimeString);
      return format(date, "MMM dd, yyyy HH:mm:ss");
    } catch (error) {
      return dateTimeString;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  return (
    <>
      <CustomHelmet title="Activities | Geobound" />

      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <HeaderSection
          title="Activities Management"
          description="View and monitor all personnel location activities"
          handleRefresh={handleRefresh}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm text-gray-500 mb-1">Total Activities</h3>
            <p className="text-2xl font-bold text-gray-800">
              {activities?.length || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm text-gray-500 mb-1">Filtered Results</h3>
            <p className="text-2xl font-bold text-blue-600">
              {filteredActivities.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm text-gray-500 mb-1">Status Distribution</h3>
            <p className="text-lg font-bold text-gray-800">
              <span className="text-green-600">
                {activities?.filter((r: any) => r.status === "IN").length || 0}{" "}
                IN
              </span>{" "}
              /
              <span className="text-red-600 ml-1">
                {activities?.filter((r: any) => r.status === "OUT").length || 0}{" "}
                OUT
              </span>
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by user name or ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap justify-between items-end gap-4">
              {/* Status filter buttons */}
              <div className="flex items-center space-x-2">
                <label className="block text-sm text-gray-500">Status:</label>
                <div className="inline-flex rounded-md shadow-sm">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                      statusFilter === "ALL"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                    onClick={() => setStatusFilter("ALL")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium ${
                      statusFilter === "IN"
                        ? "bg-green-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 border-t border-b border-gray-300"
                    }`}
                    onClick={() => setStatusFilter("IN")}
                  >
                    In
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                      statusFilter === "OUT"
                        ? "bg-red-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                    onClick={() => setStatusFilter("OUT")}
                  >
                    Out
                  </button>
                </div>
              </div>

              {/* Date filters */}
              <div className="flex gap-2">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Export button */}
              <div>
                <button
                  onClick={exportToCSV}
                  disabled={filteredActivities.length === 0}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    filteredActivities.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  <Download size={16} className="mr-2" />
                  Export ({filteredActivities.length}) to CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || startDate || endDate || statusFilter !== "ALL") && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-blue-700 font-medium">
                  Active Filters:
                </span>
                {searchTerm && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Search: "{searchTerm}"
                  </span>
                )}
                {statusFilter !== "ALL" && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Status: {statusFilter}
                  </span>
                )}
                {startDate && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    From: {startDate}
                  </span>
                )}
                {endDate && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    To: {endDate}
                  </span>
                )}
              </div>
              <span className="text-sm text-blue-600">
                Showing {filteredActivities.length} of {activities?.length || 0}{" "}
                records
              </span>
            </div>
          </div>
        )}

        {/* Table Section */}
        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading activities data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
            <p className="font-medium">Error loading activities</p>
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
                      User ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plate Number
                    </th>
                    {statusFilter === "IN" && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entry Time
                      </th>
                    )}
                    {statusFilter === "OUT" && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exit Time
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours In
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        {searchTerm ||
                        startDate ||
                        endDate ||
                        statusFilter !== "ALL"
                          ? "No activities found matching your search criteria"
                          : "No activities found"}
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((record: Activity, index: number) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {record.user?.mark_number || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {record.user?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                          {record.vehicle
                            ? `${record.vehicle.model} - ${record.vehicle.color}`
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                          {record.vehicle?.plate_number || "N/A"}
                        </td>
                        {statusFilter === "IN" && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                            {record.entry_time
                              ? new Date(record.entry_time).toLocaleString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )
                              : "N/A"}
                          </td>
                        )}
                        {statusFilter === "OUT" && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                            {record.exit_time
                              ? new Date(record.exit_time).toLocaleString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )
                              : "N/A"}
                          </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(record.date_time)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === "IN"
                                ? "bg-green-100 text-green-800"
                                : record.status === "OUT"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {record.status || "UNKNOWN"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                          {record.hours_in ? `${record.hours_in} hrs` : "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <PaginationControl
              filteredArray={filteredActivities}
              currentPage={currentPage}
              lastPage={lastPage}
              itemsPerPage={itemsPerPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Activities;
