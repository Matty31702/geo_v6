import React from "react";
import FormContainer from "../../../../shared/components/FormContainer/FormContainer";
import { Loader2, X } from "lucide-react";

interface AuthLoadingProps {
  onClose: () => void;
}

const AuthLoading: React.FC<AuthLoadingProps> = ({ onClose }) => {
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
      <div className="p-8 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    </FormContainer>
  );
};

export default AuthLoading;
