import {
  LoginCredentials,
  LoginValidationErrors,
} from "../shared/types/authType";

// Validate userId and password before logging in
export const validateLoginForm = (
  credentials: LoginCredentials
): LoginValidationErrors => {
  const errors: LoginValidationErrors = {};

  if (!credentials.userId.trim()) {
    errors.email = "Email is required";
  }
  if (!credentials.password.trim()) {
    errors.password = "Password is required";
  }
  return errors;
};
