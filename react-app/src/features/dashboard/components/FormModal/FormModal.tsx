import { useState, useEffect } from "react";
import { Personnel } from "../../../../types/firestore";
import usePersonnel from "../../../../components/hooks/usePersonnel";
import useVehicle from "../../../../components/hooks/useVehicle";
import useAuth from "../../../../components/hooks/useAuth";
import useFormData from "../../../../components/hooks/useFormData";
import { validateUserForm, validateVehicleForm } from "../../../../utilities/validation";
import PermissionModal from "../PermissionModal";
import AuthLoading from "../AuthLoading";
import FormContainer from "../../../../components/_forms/FormContainer";
import FormHeader from "../FormHeader";
import TabNavigation from "../TabNavigation/TabNavigation";
import { Loader2, Plus } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"Personnel" | "Vehicle">(
    "Personnel"
  );

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

    let validationError; // Initalize validation error

    if (activeTab === "Personnel") {
      // Validate user form data
      validationError = validateUserForm(personnelData);
      if (validationError) {
        setError(validationError);
        return;
      }
    } else {
      // Validate vehicle form data
      validationError = validateVehicleForm(vehicleData);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    try {
      // Set Loading
      setLoading(true);

      // Check the active tab (Personnel | Vehicle)
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
    return <PermissionModal error={error} onClose={onClose} />;
  }

  // Show loading indicator while checking auth
  if (authLoading) {
    return <AuthLoading error={error} onClose={onClose} />;
  }

  return (
    <FormContainer>
      <FormHeader title={`Add ${activeTab}`} error={error} onClose={onClose} />

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <form
        onSubmit={handleSubmit}
        className="p-4 overflow-y-auto max-h-[70vh]"
      >
        {activeTab === "Personnel" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personnel Form Fields */}
            {[
              {
                label: "Full Name*",
                type: "text",
                name: "name",
                value: personnelData.name,
                onChange: handlePersonnelChange,
                is_required: true,
                max_length: 100,
                placeholder: "Enter full name",
              },
              {
                label: "Username*",
                type: "text",
                name: "username",
                value: personnelData.username,
                onChange: handlePersonnelChange,
                is_required: true,
                max_length: 20,
                placeholder: "Enter username",
              },
              {
                label: "Phone Number*",
                type: "tel",
                name: "phone_number",
                value: personnelData.phone_number,
                onChange: handlePersonnelChange,
                is_required: true,
                max_length: 15,
                placeholder: "Enter phone number",
              },
              {
                label: "Mark Number*",
                type: "text",
                name: "mark_number",
                value: personnelData.mark_number,
                onChange: handlePersonnelChange,
                is_required: true,
                max_length: 3,
                placeholder: "Enter 3-digit mark number",
              },
              {
                label: "Email address*",
                type: "email",
                name: "email",
                value: personnelData.email,
                onChange: handlePersonnelChange,
                is_required: true,
                max_length: 100,
                placeholder: "Enter email address",
              },
              {
                label: "Password*",
                type: "password",
                name: "password",
                value: personnelData.password,
                onChange: handlePersonnelChange,
                is_required: true,
                max_length: 100,
                placeholder: "Enter password",
              },
              {
                label: "Confirm Password*",
                type: "password",
                name: "confirmPassword",
                value: personnelData.confirmPassword,
                onChange: handlePersonnelChange,
                is_required: true,
                max_length: 100,
                placeholder: "Confirm password",
              },
            ].map((data, index) => (
              <div
                key={index}
                className={`col-span-2 ${
                  data.type === "email" ? "" : "md:col-span-1"
                }`}
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {data.label}
                </label>
                <input
                  type={data.type}
                  name={data.name}
                  value={data.value}
                  onChange={data.onChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={data.placeholder}
                  maxLength={data.max_length}
                  required={data.is_required}
                />
              </div>
            ))}

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

            {[
              {
                label: "Guardian Name*",
                type: "text",
                name: "guardian_name",
                value: personnelData.guardian_name,
                onChange: handlePersonnelChange,
                placeholder: "Enter guardian name",
                is_required: true,
              },
              {
                label: "Guardian Phone Number*",
                type: "tel",
                name: "guardian_phone_number",
                value: personnelData.guardian_phone_number,
                onChange: handlePersonnelChange,
                placeholder: "Enter guardian phone number",
                is_required: true,
              },
              {
                label: "Birthday*",
                type: "date",
                name: "birthday",
                value: personnelData.birthday,
                onChange: handlePersonnelChange,
                placeholder: "",
                is_required: true,
              },
            ].map((data, index) => (
              <div key={index} className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {data.label}
                </label>

                <input
                  type={data.type}
                  name={data.name}
                  value={data.value}
                  onChange={handlePersonnelChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={data.placeholder}
                  required={data.is_required}
                />
              </div>
            ))}
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
