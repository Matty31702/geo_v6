/**
 *
 *
 * VALIDATION FOR PERSONNEL
 *
 *
 */

export interface CreatePersonnelValidate {
  name: string;
  username: string;
  email: string;
  phone_number: string;
  password: string;
  confirmPassword: string;
  address: string;
  guardian_name: string;
  guardian_phone_number: string;
  mark_number: string;
  gender: string;
  type: "Personnel";
  birthday: string;
}

export type PersonnelFormErrors = Partial<
  Record<keyof CreatePersonnelValidate, string>
>;

export const validatePersonnelForm = (
  formData: CreatePersonnelValidate
): PersonnelFormErrors => {
  const errors: PersonnelFormErrors = {};

  if (!formData.name.trim()) {
    errors.name = "Name is required";
  }

  if (!formData.username.trim()) {
    errors.username = "Personnel ID is required";
  }

  if (!formData.email.trim()) {
    errors.email = "Email is required";
  }

  if (!formData.password.trim()) {
    errors.password = "Password is required";
  } else if (formData.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!formData.confirmPassword.trim()) {
    errors.confirmPassword = "Please confirm your password";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!formData.phone_number.trim()) {
    errors.phone_number = "Phone number is required";
  }

  if (!formData.address.trim()) {
    errors.address = "Address is required";
  }

  if (!formData.gender.trim()) {
    errors.gender = "Gender is required";
  }

  if (!formData.birthday.trim()) {
    errors.birthday = "Birthday is required";
  }

  if (!formData.guardian_name.trim()) {
    errors.guardian_name = "Guardian name is required";
  }

  if (!formData.guardian_phone_number.trim()) {
    errors.guardian_phone_number = "Guardian phone number is required";
  }

  if (!formData.mark_number.trim()) {
    errors.mark_number = "Mark number is required";
  }

  return errors;
};

/**
 *
 *
 * VALIDATION FOR VEHICLE
 *
 *
 */

export interface CreateVehicleValidate {
  color: string;
  model: string;
  plate_number: string;
}

export type VehicleFormErrors = Partial<
  Record<keyof CreateVehicleValidate, string>
>;

export const validateVehicleForm = (
  formData: CreateVehicleValidate
): VehicleFormErrors => {
  const errors: VehicleFormErrors = {};

  if (!formData.model.trim()) errors.model = "Model is required";
  if (!formData.color.trim()) errors.color = "Color is required";
  if (!formData.plate_number.trim())
    errors.plate_number = "Plate number is required";

  return errors;
};
