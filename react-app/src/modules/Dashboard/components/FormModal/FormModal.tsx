import { useState } from "react";
import FormContainer from "../FormContainer/FormContainer";
import FormHeader from "../FormHeader";
import useFormData from "../../../../components/hooks/useFormData";
import usePersonnel from "../../../../components/hooks/usePersonnel";
import { validateUserForm, validateVehicleForm } from "../../../../utilities/validation";
import useVehicle from "../../../../components/hooks/useVehicle";
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
  onObjectAdded: (activeTab: string) => void;
  onClose: () => void;
}

const FormModal: React.FC<FormModalProps> = ({ isOpen, onObjectAdded, onClose }) => {
  // Active Tab
  const [activeTab, setActiveTab] = useState<string>("Personnel");

  // Loading State
  const [loading, setLoading] = useState<boolean>(false);

  // Use personnel and vehicle hook
  const {addPersonnel} = usePersonnel();
  const {addVehicle} = useVehicle();

  // Error state
  const [error, setError] = useState<string>("");

  // Personnel Form Data
  const { formData: personnelData, handleChange: handlePersonnelChange, reset:personnelReset } = useFormData<PersonnelFormDataProps>({
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
      birthday: ""
    }
  });

  // Vehicle Form Data
  const { formData: vehicleData, handleChange: handleVehicleChange, reset:vehicleReset } = useFormData<VehicleFormDataProps>({
    initialValues: {
      color: "",
      model: "",
      plate_number: "",
      user_id: ""
    }
  });

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let validationError;

    if(activeTab === 'Personnel') {

      validationError = validateUserForm(personnelData);

      if(validationError) {
        setError(validationError);
        return
      }
    } else {

      validationError = validateVehicleForm(vehicleData);

      if(validationError) {
        setError(validationError);
        return
      }
    }

    try {

      // Set Loading
      setLoading(true);

      if (activeTab === "Personnel") {

        // Submit personnel data
        // console.log("Submitting personnel data:", personnelData);
        // API call would go here
        await addPersonnel(personnelData);

        // Reset form and close modal
        personnelReset();
        
      } else {
        // Submit vehicle data
        // console.log("Submitting vehicle data:", vehicleData);
        // API call would go here
        await addVehicle(vehicleData);

        // Reset form and close modal
        vehicleReset();
      }

      // Notify parent component of success
      if(onObjectAdded) onObjectAdded(activeTab);
      
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

      <form onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[70vh]">
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
                Address
              </label>
              <textarea
                name="address"
                value={personnelData.address}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter address"
                rows={2}
              />
            </div>
            
            {/* <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type*
              </label>
              <select
                name="type"
                value={personnelData.type}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select type</option>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
                <option value="contractor">Contractor</option>
                <option value="visitor">Visitor</option>
              </select>
            </div> */}
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={personnelData.gender}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guardian Name
              </label>
              <input
                type="text"
                name="guardian_name"
                value={personnelData.guardian_name}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter guardian name"
              />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guardian Phone Number
              </label>
              <input
                type="tel"
                name="guardian_phone_number"
                value={personnelData.guardian_phone_number}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter guardian phone number"
              />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birthday
              </label>
              <input
                type="date"
                name="birthday"
                value={personnelData.birthday}
                onChange={handlePersonnelChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
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
            
            {/* <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner ID*
              </label>
              <input
                type="text"
                name="user_id"
                value={vehicleData.user_id}
                onChange={handleVehicleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter owner ID"
                required
              />
            </div> */}
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