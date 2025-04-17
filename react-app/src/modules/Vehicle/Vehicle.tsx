import CustomHelmet from "../../components/CustomHelmet";
import HeaderSection from "../../components/HeaderSection";

const Vehicle = () => {
  

  // Handle refresh
  const handleRefresh = () => {
    
  };

  return (
    <>
      <CustomHelmet title="Vehicles | Geobound" />

      <div className="p-6 bg-gray-50 min-h-screen">
        <HeaderSection
          title="Vehicle Management"
          description="Manage and monitor all police vehicle records"
          handleRefresh={handleRefresh}
        />
      </div>
    </>
  );
};

export default Vehicle;
