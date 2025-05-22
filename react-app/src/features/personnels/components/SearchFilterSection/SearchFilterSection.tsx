import { Search } from "lucide-react";

interface SearchFilterSectionProps {
  searchTerm: string;
  handleSearchChange: (e: any) => void;
}

const SearchFilterSection: React.FC<SearchFilterSectionProps> = ({
  searchTerm,
  handleSearchChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 mt-6">
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
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterSection;
