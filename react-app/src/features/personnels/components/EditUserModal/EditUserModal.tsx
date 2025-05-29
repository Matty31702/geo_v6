import React, { useState } from "react";
import useFormData from "../../../../components/hooks/useFormData";
import FormContainer from "../../../../components/_forms/FormContainer";
import FormHeader from "../../../../components/_forms/FormHeader";
import usePersonnel from "../../../dashboard/hooks/usePersonnel";
import { Edit, Loader2, Lock, Mail } from "lucide-react";
import { validateEditUserForm } from "../../../../shared/utilities/validation";
import { Personnel } from "../../../dashboard/shared/types/personnel";
import useAuth from "../../../dashboard/hooks/useAuth";

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
  email: Personnel["email"];
  password: Personnel["password"];
  gender: Personnel["gender"];
  birthday: Personnel["birthday"];
  address: Personnel["address"];
  guardian_name: Personnel["guardian_name"];
  guardian_phone_number: Personnel["guardian_phone_number"];
}

interface CredentialUpdateData {
  currentEmail: string;
  currentPassword: string;
  newEmail: string;
  newPassword: string;
  confirmPassword: string;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  selectedPersonnel,
  isOpen,
  onClose,
  onUserEdited,
}) => {
  // Use auth
  const { isSuperAdmin } = useAuth();

  // State for credential updates
  const [showCredentialSection, setShowCredentialSection] = useState(false);
  const [credentialError, setCredentialError] = useState<string>("");

  // Use form data for main user info
  const { formData, reset, handleChange } = useFormData<EditFormDataProps>({
    initialValues: {
      id: selectedPersonnel.id,
      name: selectedPersonnel.name,
      phone_number: selectedPersonnel.phone_number,
      address: selectedPersonnel.address,
      gender: selectedPersonnel.gender,
      email: selectedPersonnel.email,
      password: selectedPersonnel.password || "",
      guardian_name: selectedPersonnel.guardian_name,
      guardian_phone_number: selectedPersonnel.guardian_phone_number,
      birthday: selectedPersonnel.birthday,
    },
  });

  // Use form data for credential updates
  const {
    formData: credentialData,
    reset: resetCredentials,
    handleChange: handleCredentialChange,
  } = useFormData<CredentialUpdateData>({
    initialValues: {
      currentEmail: selectedPersonnel.email,
      currentPassword: "",
      newEmail: selectedPersonnel.email,
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Use personnel hook
  const { loading, editPersonnel } = usePersonnel();

  // Validate credential form
  const validateCredentialForm = (): string | null => {
    if (!credentialData.currentPassword) {
      return "Current password is required to make changes";
    }

    if (
      credentialData.newEmail !== selectedPersonnel.email &&
      !credentialData.newEmail
    ) {
      return "New email cannot be empty";
    }

    if (
      credentialData.newPassword &&
      credentialData.newPassword !== credentialData.confirmPassword
    ) {
      return "New passwords don't match";
    }

    if (credentialData.newPassword && credentialData.newPassword.length < 6) {
      return "New password must be at least 6 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (credentialData.newEmail && !emailRegex.test(credentialData.newEmail)) {
      return "Please enter a valid email address";
    }

    return null;
  };

  // Handle form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setCredentialError("");

    const validationError = validateEditUserForm(formData);
    if (validationError) {
      return;
    }

    try {
      let credentialUpdates = undefined;

      // If SuperAdmin wants to update credentials
      if (isSuperAdmin && showCredentialSection) {
        const credentialValidationError = validateCredentialForm();
        if (credentialValidationError) {
          setCredentialError(credentialValidationError);
          return;
        }

        // Check if there are actual changes to make
        const emailChanged =
          credentialData.newEmail !== selectedPersonnel.email;
        const passwordChanged = credentialData.newPassword.trim() !== "";

        if (emailChanged || passwordChanged) {
          credentialUpdates = {
            currentEmail: credentialData.currentEmail,
            currentPassword: credentialData.currentPassword,
            newEmail: emailChanged ? credentialData.newEmail : undefined,
            newPassword: passwordChanged
              ? credentialData.newPassword
              : undefined,
          };
        }
      }

      // Update personnel data and credentials
      const result = await editPersonnel(
        selectedPersonnel.id,
        formData,
        credentialUpdates
      );

      if (result.success) {
        // Reset forms and close modal
        reset();
        resetCredentials();
        setShowCredentialSection(false);

        // Notify parent component of success
        if (onUserEdited) onUserEdited();
        onClose();
      } else {
        setCredentialError(result.error || "Failed to update user");
      }
    } catch (err: any) {
      console.error("Error updating user:", err);
      setCredentialError(err.message || "Failed to update user");
    }
  };

  if (!isOpen) return null;

  return (
    <FormContainer>
      <FormHeader
        title="Edit User Personnel"
        error={credentialError}
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="p-4">
        {/* Main User Information */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          {/* Email - Read-only unless SuperAdmin updates credentials */}
          <div className="col-span-full md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-300 cursor-not-allowed"
              placeholder="Enter email"
              readOnly={!isSuperAdmin}
              required
            />
          </div>

          {/* Password - Read-only unless SuperAdmin updates credentials */}
          <div className="col-span-full md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              disabled
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-300 cursor-not-allowed"
              placeholder="••••••••"
              readOnly={!isSuperAdmin}
              required
            />
          </div>
        </div>

        {/* SuperAdmin Credential Management Section */}
        {isSuperAdmin && (
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Lock className="mr-2" size={18} />
                Update Login Credentials
              </h3>
              <button
                type="button"
                onClick={() => setShowCredentialSection(!showCredentialSection)}
                className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                {showCredentialSection ? "Hide" : "Show"} Credential Options
              </button>
            </div>

            {showCredentialSection && (
              <div className="bg-gray-50 p-4 rounded-md space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  <strong>Note:</strong> You must enter the current password to
                  make any changes to email or password.
                </div>

                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={credentialData.currentPassword}
                    onChange={handleCredentialChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="inline mr-1" size={14} />
                      Email
                    </label>
                    <input
                      type="email"
                      name="newEmail"
                      disabled
                      value={credentialData.newEmail}
                      onChange={handleCredentialChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-not-allowed bg-gray-300"
                      placeholder="Enter new email"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Lock className="inline mr-1" size={14} />
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={credentialData.newPassword}
                      onChange={handleCredentialChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new password (optional)"
                    />
                  </div>
                </div>

                {/* Confirm New Password */}
                {credentialData.newPassword && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={credentialData.confirmPassword}
                      onChange={handleCredentialChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Rest of the form fields */}
        <div className="space-y-3 mt-4">
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
                  Update User
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
