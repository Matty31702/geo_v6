import { ReactNode } from "react";

interface QuickActionContainerProps {
  children: ReactNode;
}

const QuickActionContainer: React.FC<QuickActionContainerProps> = ({
  children,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default QuickActionContainer;
