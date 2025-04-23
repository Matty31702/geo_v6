import { useState, useEffect } from "react";
import FormHeader from "../FormHeader";
import useFormData from "../../../../components/hooks/useFormData";
import usePersonnel from "../../../../components/hooks/usePersonnel";
import useAuth from "../../../../components/hooks/useAuth"; // New auth hook
import {
  validateUserForm,
  validateVehicleForm,
} from "../../../../utilities/validation";
import useVehicle from "../../../../components/hooks/useVehicle";
import { Loader2, Plus, ShieldAlert } from "lucide-react";
import { Personnel } from "../../../../types/firestore";
import FormContainer from "../../../../components/FormContainer/FormContainer";

interface PersonnelFormDataProps {
  name: string;
  username: string;
  phone_number: string;
  mark_number: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  type: string;
  gender: string;
  guardian_name: string;
  guardian_phone_number: string;
  birthday: string;
}

interface VehicleFormDataProps {
  color: string;
  model: string;
  plate_number: string;
  user_id: string;
}

interface FormModalProps {
  isOpen: boolean;
  personnels: Personnel[];
  onObjectAdded: (activeTab: string) => void;
  onClose: () => void;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  personnels,
  onObjectAdded,
  onClose,
}) => {
  // Active Tab
  const [activeTab, setActiveTab] = useState<string>("Personnel");

  // Loading State
  const [loading, setLoading] = useState<boolean>(false);

  // Use personnel and vehicle hook
  const { addPersonnel } = usePersonnel();
  const { addVehicle } = useVehicle();
  
  // Auth hook for role-based authorization
  const { userRole, isLoading: authLoading } = useAuth();

  // Authorization state
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  // Error state
  const [error, setError] = useState<string>("");

  // Check authorization when user data loads
  useEffect(() => {
    if (!authLoading && userRole) {
      setIsAuthorized(userRole === "superadmin");
    }
  }, [authLoading, userRole]);

  // Personnel Form Data
  const {
    formData: personnelData,
    handleChange: handlePersonnelChange,
    reset: personnelReset,
  } = useFormData<PersonnelFormDataProps>({
    initialValues: {
      name: "",
      username: "",
      phone_number: "",
      mark_number: "",
      email: "",
      password: "",
      confirmPassword: "",
      address: "",
      type: "",
      gender: "",
      guardian_name: "",
      guardian_phone_number: "",
      birthday: "",
    },
  });

  // Vehicle Form Data
  const {
    formData: vehicleData,
    handleChange: handleVehicleChange,
    reset: vehicleReset,
  } = useFormData<VehicleFormDataProps>({
    initialValues: {
      color: "",
      model: "",
      plate_number: "",
      user_id: "",
    },
  });

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check authorization first
    if (!isAuthorized) {
      setError("You don't have permission to add personnel or vehicles");
      return;
    }

    let validationError;

    if (activeTab === "Personnel") {
      validationError = validateUserForm(personnelData);

      if (validationError) {
        setError(validationError);
        return;
      }
    } else {
      validationError = validateVehicleForm(vehicleData);

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    try {
      // Set Loading
      setLoading(true);

      if (activeTab === "Personnel") {
        // Submit personnel data
        await addPersonnel(personnelData);
        // Reset form and close modal
        personnelReset();
      } else {
        // Submit vehicle data
        await addVehicle(vehicleData);
        // Reset form and close modal
        vehicleReset();
      }

      // Notify parent component of success
      if (onObjectAdded) onObjectAdded(activeTab);

      // Close modal on success
      onClose();
    } catch (err) {
      setError("An error occurred while saving data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check is open
  if (!isOpen) return null;

  // Show authorization error if user is not authorized
  if (!authLoading && !isAuthorized) {
    return (
      <FormContainer>
        <FormHeader title="Access Denied" error={error} onClose={onClose} />
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert size={48} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Permission Denied</h3>
          <p className="text-gray-600 mb-6">
            Only superadmins can add personnel and vehicles. Contact your system administrator for assistance.
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
  }

  // Show loading indicator while checking auth
  if (authLoading) {
    return (
      <FormContainer>
        <FormHeader title="Loading" error={error} onClose={onClose} />
        <div className="p-8 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <FormHeader title={`Add ${activeTab}`} error={error} onClose={onClose} />

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          type="button"
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === "Personnel"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("Personnel")}
        >
          Personnel
        </button>
        <button
          type="button"
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === "Vehicle"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("Vehicle")}
        >
          Vehicle
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 overflow-y-auto max-h-[70vh]"
      >
        {activeTab === "Personnel" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personnel Form Fields */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name*
              </label>
              <input
                type="text"
                name="name"
                value={personnelData.name}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username*
              </label>
              <input
                type="text"
                name="username"
                value={personnelData.username}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter username"
                required
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number*
              </label>
              <input
                type="tel"
                name="phone_number"
                value={personnelData.phone_number}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mark Number
              </label>
              <input
                type="text"
                name="mark_number"
                value={personnelData.mark_number}
                onChange={handlePersonnelChange}
                maxLength={3} // Limits to 3 characters
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter 3-digit mark number"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address*
              </label>
              <input
                type="email"
                name="email"
                value={personnelData.email}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password*
              </label>
              <input
                type="password"
                name="password"
                value={personnelData.password}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password"
                required
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password*
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={personnelData.confirmPassword}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm password"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address*
              </label>
              <textarea
                name="address"
                value={personnelData.address}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter address"
                rows={2}
                required
              />
            </div>

            {/* Add user role/type field - visible only to superadmin */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Role*
              </label>
              <select
                name="type"
                value={personnelData.type}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select role</option>
                <option value="admin">Admin</option>
                <option value="Personnel">Personnel</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender*
              </label>
              <select
                name="gender"
                value={personnelData.gender}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guardian Name*
              </label>
              <input
                type="text"
                name="guardian_name"
                value={personnelData.guardian_name}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter guardian name"
                required
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guardian Phone Number*
              </label>
              <input
                type="tel"
                name="guardian_phone_number"
                value={personnelData.guardian_phone_number}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter guardian phone number"
                required
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birthday*
              </label>
              <input
                type="date"
                name="birthday"
                value={personnelData.birthday}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        )}

        {activeTab === "Vehicle" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle Form Fields */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model*
              </label>
              <input
                type="text"
                name="model"
                value={vehicleData.model}
                onChange={handleVehicleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter vehicle model"
                required
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color*
              </label>
              <input
                type="text"
                name="color"
                value={vehicleData.color}
                onChange={handleVehicleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter vehicle color"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Plate Number*
              </label>
              <input
                type="text"
                name="plate_number"
                value={vehicleData.plate_number}
                onChange={handleVehicleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter license plate number"
                required
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Personnel
              </label>
              <select
                name="user_id"
                value={vehicleData.user_id}
                onChange={handleVehicleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Personnel</option>
                {personnels.map((personnel) => (
                  <option key={personnel.id} value={personnel.id}>
                    {personnel.vehicle ? "🟢" : "🔴"} {personnel.name} |{" "}
                    {personnel.vehicle ? personnel.vehicle.model : "No Vehicle"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus size={18} className="mr-2" />
                Create
              </>
            )}
          </button>
        </div>
      </form>
    </FormContainer>
  );
};

export default FormModal;