import React from "react";

interface StatCardProps {
  title: string;
  totalCount: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, totalCount }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
    </div>
  );
};

export default StatCard;
