import { X } from "lucide-react";
import React from "react";

interface FormHeaderProps {
  title: string;
  error: string;
  onClose: () => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({ title, error, onClose }) => {
  return (
    <>
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}
    </>
  );
};

export default FormHeader;
