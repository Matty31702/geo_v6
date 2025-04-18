
const MapLegendContainer = ({
}) => {
  return (
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
        {/* {sectors.map((sector) => (
          <div key={sector} className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: getSectorColor(sector) }}
            ></div>
            <span>
              Sector {sector} ({sectorCounts[sector] || 0})
            </span>
          </div>
        ))} */}
      </div>
    </div>
  );
};

export default MapLegendContainer;
