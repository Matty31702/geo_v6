import { RefreshCw } from "lucide-react";
import React from "react";

interface HeaderSectionProps {
  title: string;
  description: string;
  handleRefresh: () => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  title,
  description,
  handleRefresh,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md flex items-center hover:bg-blue-200"
        >
          <RefreshCw size={18} className="mr-2" /> Refresh
        </button>
        {/* <button 
        onClick={exportToCSV}
        className="px-4 py-2 bg-green-100 text-green-600 rounded-md flex items-center hover:bg-green-200"
      >
        <Download size={18} className="mr-2" /> Export
      </button> */}
        {/* <button 
        onClick={printData}
        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md flex items-center hover:bg-gray-200"
      >
        <Printer size={18} className="mr-2" /> Print
      </button> */}
      </div>
    </div>
  );
};

export default HeaderSection;
