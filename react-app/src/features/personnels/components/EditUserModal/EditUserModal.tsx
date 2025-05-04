import React from "react";
import { Personnel } from "../../../../types/firestore";
import useFormData from "../../../../components/hooks/useFormData";
import FormContainer from "../../../../components/_forms/FormContainer";
import FormHeader from "../../../../components/_forms/FormHeader";
import usePersonnel from "../../../../components/hooks/usePersonnel";
import { Edit, Loader2 } from "lucide-react";
import {
  validateEditUserForm,
} from "../../../../utilities/validation";

interface EditUserModalProps {
  selectedPersonnel: Personnel;
  isOpen: boolean;
  onClose: () => void;
  onUserEdited: () => void;
}

interface EditFormDataProps {
  id: Personnel["id"];
  name: Personnel["name"];
  phone_number: Personnel["phone_number"];
  gender: Personnel["gender"];
  birthday: Personnel["birthday"];
  address: Personnel["address"];
  guardian_name: Personnel["guardian_name"];
  guardian_phone_number: Personnel["guardian_phone_number"];
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  selectedPersonnel,
  isOpen,
  onClose,
  onUserEdited,
}) => {
  // console.log(selectedPersonnel);

  // Use form data
  const { formData, reset, handleChange } = useFormData<EditFormDataProps>({
    initialValues: {
      id: selectedPersonnel.id,
      name: selectedPersonnel.name,
      phone_number: selectedPersonnel.phone_number,
      address: selectedPersonnel.address,
      gender: selectedPersonnel.gender,
      guardian_name: selectedPersonnel.guardian_name,
      guardian_phone_number: selectedPersonnel.guardian_phone_number,
      birthday: selectedPersonnel.birthday,
    },
  });

  // Use personnel hook
  const { loading, error, setError, editPersonnel } = usePersonnel();

  // Handle submit form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const validationError = validateEditUserForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await editPersonnel(selectedPersonnel.id, formData);

      // Reset form and close modal
      reset();

      // Notify parent component of success
      if (onUserEdited) onUserEdited();

      onClose();
    } catch (err: any) {
      console.error("Error adding user:", err);
      setError(err.message || "Failed to create user");
    }
  };

  if (!isOpen) return null;

  return (
    <FormContainer>
      <FormHeader title="Edit User Personnel" error={error} onClose={onClose} />

      <form onSubmit={handleSubmit} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="col-span-full md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="col-span-full md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          {/* Gender */}
          <div className="col-span-full md:col-span-2 mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Birthday */}
          <div className="col-span-full md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birthday *
            </label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter birthday"
              required
            />
          </div>

          {/* Address */}
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter address"
              required
            />
          </div>

          {/* Guardian name */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guardian Name *
            </label>
            <input
              type="text"
              name="guardian_name"
              value={formData.guardian_name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter guardian name"
              required
            />
          </div>

          {/* Guardian phone number */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guardian Phone Number *
            </label>
            <input
              type="text"
              name="guardian_phone_number"
              value={formData.guardian_phone_number}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter guardian phone number"
              required
            />
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
                  Edit User
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </FormContainer>
  );
};

export default EditUserModal;
