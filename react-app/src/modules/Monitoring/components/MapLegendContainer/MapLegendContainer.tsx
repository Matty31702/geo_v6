
interface MapLegendContainerProps {
  vehicleCount: number;
}

const MapLegendContainer: React.FC<MapLegendContainerProps> = ({ vehicleCount }) => {
  return (
    <div className="mt-4 flex bg-white p-4 rounded-lg shadow">
      {/* Map Legend */}
      <div className="grid grid-cols-4 gap-4 text-sm w-full">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-blue-800 mr-2"></div>
          <span>Police HQ</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded border-2 border-dashed border-blue-500 bg-blue-100 mr-2"></div>
          <span>Geofence Area</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 mr-2"></div>
          <span>Vehicles ({vehicleCount})</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
          <span>Active Personnel</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegendContainer;