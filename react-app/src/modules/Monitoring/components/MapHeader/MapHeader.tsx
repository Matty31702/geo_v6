import { RefreshCw, Shield } from "lucide-react";

interface MapHeaderProps {
  loading: boolean;
  refreshing: boolean;
  handleRefresh: () => void;
}

const MapHeader: React.FC<MapHeaderProps> = ({
  loading,
  refreshing,
  handleRefresh,
}) => {
  return (
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
        {/* <div className="flex items-center">
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
        </div> */}
      </div>
    </div>
  );
};

export default MapHeader;
