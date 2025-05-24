import { RefreshCw, Users } from "lucide-react";
import React from "react";
import { Personnel } from "../../../../features/dashboard/shared/types/personnel";

interface PersonnelListProps {
  loading: boolean;
  error: string;
  filteredPersonnel: Personnel[];
}

const PersonnelList: React.FC<PersonnelListProps> = ({
  loading,
  error,
  filteredPersonnel,
}) => {
  return (
    <div className="w-64 ml-4 bg-white p-4 rounded-lg shadow overflow-auto h-96">
      <div className="flex items-center mb-3">
        <Users className="text-blue-800 mr-2" size={16} />
        <h2 className="text-lg font-bold text-blue-800">Personnel</h2>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-sm">Error loading personnel data</div>
      ) : filteredPersonnel.length === 0 ? (
        <div className="text-gray-500 text-sm py-4">
          No personnel found with valid coordinates
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {filteredPersonnel.map((person) => (
            <li key={person.id} className="py-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" />
                <span className="text-sm font-medium">{person.name}</span>
              </div>
              <div className="text-xs text-gray-500 ml-5">
                Sector {person.sector}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PersonnelList;
