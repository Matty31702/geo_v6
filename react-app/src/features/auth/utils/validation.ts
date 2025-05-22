// Validate userId and password before logging in
export const validateLoginForm = (
  userId: string,
  password: string
): { email?: string; password?: string } => {
  const errors: { email?: string; password?: string } = {};

  if (!userId.trim()) {
    errors.email = "Email is required";
  }
  if (!password.trim()) {
    errors.password = "Password is required";
  }
  return errors;
};
