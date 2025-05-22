import { Dispatch, SetStateAction } from "react";

interface TabNavigationProps {
  activeTab: "Personnel" | "Vehicle";
  setActiveTab: Dispatch<SetStateAction<"Personnel" | "Vehicle">>;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="flex border-b">
      <button
        type="button"
        className={`flex-1 py-3 px-4 text-center font-medium ${
          activeTab === "Personnel"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
        onClick={() => setActiveTab("Personnel")}
      >
        Personnel
      </button>
      <button
        type="button"
        className={`flex-1 py-3 px-4 text-center font-medium ${
          activeTab === "Vehicle"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
        onClick={() => setActiveTab("Vehicle")}
      >
        Vehicle
      </button>
    </div>
  );
};

export default TabNavigation;
