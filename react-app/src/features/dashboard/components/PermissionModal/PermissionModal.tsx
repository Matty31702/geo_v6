import { ShieldAlert } from "lucide-react";
import FormContainer from "../../../../shared/components/FormContainer/FormContainer";
import FormHeader from "../FormHeader";
import React from "react";

interface PermissionModalProps {
  error: string;
  onClose: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  error,
  onClose,
}) => {
  return (
    <FormContainer>
      <FormHeader title="Access Denied" error={error} onClose={onClose} />
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
