import React from "react";
import FormContainer from "../../../../shared/components/FormContainer/FormContainer";
import { Loader2 } from "lucide-react";
import FormHeader from "../FormHeader";

interface AuthLoadingProps {
  error: string;
  onClose: () => void;
}

const AuthLoading: React.FC<AuthLoadingProps> = ({ error, onClose }) => {
  return (
    <FormContainer>
      <FormHeader title="Loading" error={error} onClose={onClose} />
      <div className="p-8 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    </FormContainer>
  );
};

export default AuthLoading;
