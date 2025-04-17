export interface VehicleFormData {
  color: string;
  model: string;
  plate_number: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone_number: string;
  address: string;
  sector: string;
}

// Validate vehicle form
export const validateVehicleForm = (formData: VehicleFormData): string => {
  if (!formData.model.trim()) return "Model is required";
  if (!formData.color.trim()) return "Color is required";
  if (!formData.plate_number.trim()) return "Plate number is required";

  return "";
};

// Validate user form
export const validateUserForm = (formData: UserFormData): string => {
  if (!formData.name.trim()) return "Name is required";
  if (!formData.email.trim()) return "Email is required";
  if (!formData.password.trim()) return "Password is required";
  if (formData.password.length < 6)
    return "Password must be at least 6 characters";
  if (formData.password !== formData.confirmPassword)
    return "Passwords do not match";
  if (!formData.phone_number.trim()) return "Phone number is required";
  if (!formData.address.trim()) return "Address is required";
  if (!formData.sector) return "Sector is required";
  return "";
};
