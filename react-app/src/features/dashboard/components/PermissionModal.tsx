import { ShieldAlert, X } from "lucide-react";
import FormContainer from "../../../shared/components/FormContainer/FormContainer";
import React from "react";

interface PermissionModalProps {
  onClose: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ onClose }) => {
  return (
    <FormContainer>
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Access Denied</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <ShieldAlert size={48} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Permission Denied
        </h3>
        <p className="text-gray-600 mb-6">
          Only superadmins can add personnel and vehicles. Contact your system
          administrator for assistance.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 rounded-md text-white hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </FormContainer>
  );
};

export default PermissionModal;
