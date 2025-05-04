import { ReactNode } from "react";

interface StatCardProps {
  children: ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ children }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">{children}</div>
    </div>
  );
};

export default StatCard;
