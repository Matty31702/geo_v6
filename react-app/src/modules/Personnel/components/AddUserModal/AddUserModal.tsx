import { useState, useRef } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, database } from "../../../../services/firebase/config";
import { X, Plus, Upload, Loader2 } from "lucide-react";
import { validateUserForm } from "../../../../utilities/validation";
import useFormData from "../../../../components/hooks/useFormData";
import usePersonnel from "../../../../components/hooks/usePersonnel";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

// Add User Modal Component
const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserAdded,
}) => {
  // Use form data
  const {
    formData,
    reset,
    handleChange,
  } = useFormData({
    initialValues: {
      name: "",
      username: "",
      phone_number: "",
      email: "",
      password: "",
      confirmPassword: "",
      address: "",
      sector: "",
      datetime: "",
      type: "",
      gender: "",
      guardian_name: "",
      guardian_phone_number: "",
      birthday: "",
    },
  });

  // Use personnel data
  const { loading, error, addPersonnel, setError } = usePersonnel();

  // List of available sectors
  const sectors = ["1", "2", "3", "4", "5"];

  // Handle form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const validationError = validateUserForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await addPersonnel(formData);

      // Reset form and close modal
      reset();

      // Notify parent component of success
      if (onUserAdded) onUserAdded();

      onClose();
    } catch (err: any) {
      console.error("Error adding user:", err);
      setError(err.message || "Failed to create user");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Add New Personnel
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {error}
          </div>
        )}

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

            {/* Username/Personnel ID */}
            <div className="col-span-full md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personnel ID
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter personnel ID"
              />
            </div>

            {/* Email */}
            <div className="col-span-full md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="col-span-full md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
                required
              />
            </div>

            {/* Password */}
            <div className="col-span-full md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="col-span-full md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm password"
                required
              />
            </div>

            {/* Gender */}
            <div className="col-span-full md:col-span-2">
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
                <option value="" disabled>Select gender</option>
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

            

            {/* Sector */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sector *
              </label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a sector</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    Sector {sector}
                  </option>
                ))}
              </select>
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
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
