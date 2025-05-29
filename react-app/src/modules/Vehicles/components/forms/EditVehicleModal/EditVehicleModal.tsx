import { Edit, Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";
import FormContainer from "../../../../../components/_forms/FormContainer";
import FormHeader from "../../../../../components/_forms/FormHeader";
import useFormData from "../../../../../components/hooks/useFormData";
import useVehicle from "../../../../../features/dashboard/hooks/useVehicle";
import { validateVehicleForm } from "../../../../../shared/utilities/validation";
import { Vehicle } from "../../../../../features/vehicles/shared/types/vehicle";
import { Personnel } from "../../../../../features/dashboard/shared/types/personnel";
import personnelService from "../../../../../services/personnelService";

interface EditVehicleModalProps {
  selectedVehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onVehicleEdited: () => void;
}

interface EditFormDataProps {
  id: string;
  model: string;
  color: string;
  plate_number: string;
  user_id: string; // Add user_id for personnel assignment
}

const EditVehicleModal: React.FC<EditVehicleModalProps> = ({
  selectedVehicle,
  isOpen,
  onClose,
  onVehicleEdited,
}) => {
  // State for personnel list
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loadingPersonnel, setLoadingPersonnel] = useState<boolean>(false);

  // Use form data
  const { formData, reset, handleChange } = useFormData<EditFormDataProps>({
    initialValues: {
      id: selectedVehicle.id,
      model: selectedVehicle.model,
      color: selectedVehicle.color,
      plate_number: selectedVehicle.plate_number,
      user_id: selectedVehicle.user_id || "", // Include current assignment
    },
  });

  // Use vehicle hook
  const { loading, error, setError, editVehicle } = useVehicle();

  // Fetch personnel list when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPersonnel();
    }
  }, [isOpen]);

  // Function to fetch available personnel
  const fetchPersonnel = async () => {
    setLoadingPersonnel(true);
    try {
      // You'll need to implement this service call
      const response = await personnelService.getAllPersonnels();
      setPersonnel(response.data || []);

      // For now, this is a placeholder - replace with your actual personnel fetching logic
      console.log("Fetch personnel logic needed here");
    } catch (error) {
      console.error("Error loading personnel:", error);
      setError("Failed to load personnel list");
    } finally {
      setLoadingPersonnel(false);
    }
  };

  // Handle edit form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const validationError = validateVehicleForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await editVehicle(selectedVehicle.id, formData);

      // Reset form and close modal
      reset();

      // Notify parent component of success
      if (onVehicleEdited) onVehicleEdited();

      onClose();
    } catch (error) {
      console.error("Error updating vehicle:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <FormContainer>
      <FormHeader title="Edit Vehicle" error={error} onClose={onClose} />
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
              required
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
              required
            />
          </div>

          {/* Personnel Assignment */}
          <div className="col-span-full md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User size={16} className="inline mr-1" />
              Assigned Personnel
            </label>
            <div className="relative">
              <User
                size={20}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <select
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                disabled={loadingPersonnel}
              >
                <option value="">Unassigned</option>
                {personnel.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} - {person.mark_number || "N/A"}
                  </option>
                ))}
              </select>
              {loadingPersonnel && (
                <div className="absolute right-3 top-2.5">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select a personnel member to assign this vehicle to, or leave
              unassigned
            </p>
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
                Updating...
              </>
            ) : (
              <>
                <Edit size={18} className="mr-2" />
                Update Vehicle
              </>
            )}
          </button>
        </div>
      </form>
    </FormContainer>
  );
};

export default EditVehicleModal;
