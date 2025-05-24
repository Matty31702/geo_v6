import { Loader2, Plus } from "lucide-react";
import useFormData from "../../../../../components/hooks/useFormData";
import { validateVehicleForm } from "../../../../../shared/utilities/validation";
import useVehicle from "../../../../../features/dashboard/hooks/useVehicle";
import FormContainer from "../../../../../components/_forms/FormContainer";
import FormHeader from "../../../../../components/_forms/FormHeader";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleAdded: () => void;
}

export interface FormDataProps {
  color: string;
  model: string;
  plate_number: string;
  user_id: string;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onVehicleAdded,
}) => {
  // Use form data hook
  const { formData, reset, handleChange } = useFormData<FormDataProps>({
    initialValues: {
      color: "",
      model: "",
      plate_number: "",
      user_id: "",
    },
  });

  // Custom hook
  const { loading, error, setError, addVehicle } = useVehicle();

  // Handle submit vehicle
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const validationError = validateVehicleForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await addVehicle(formData);

      // Reset form and close modal
      reset();

      // Notify parent component of success
      if (onVehicleAdded) onVehicleAdded();

      // On close
      onClose();
    } catch (error: any) {
      console.error("Error adding vehicle: ", error);
      setError(error.message || "Failed to create user");
    }
  };

  if (!isOpen) return null;

  return (
    <FormContainer>
      <FormHeader title="Add Vehicle" error={error} onClose={onClose} />

      <form onSubmit={handleSubmit} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Model */}
          <div className="col-span-full md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter vehicle model"
              required
            />
          </div>

          {/* Color */}
          <div className="col-span-full md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color *
            </label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter color"
            />
          </div>

          {/* Plate Number */}
          <div className="col-span-full md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plate Number *
            </label>
            <input
              type="text"
              name="plate_number"
              value={formData.plate_number}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter plate number"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={18} className="mr-2" />
                Create Vehicle
              </>
            )}
          </button>
        </div>
      </form>
    </FormContainer>
  );
};

export default AddVehicleModal;
