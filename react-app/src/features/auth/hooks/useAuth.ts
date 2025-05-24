import { useState } from "react";
import { validateLoginForm } from "../utils/authValidation";
import { authApi } from "../api/authApi";
import { User } from "firebase/auth";
import {
  CustomUser,
  LoginCredentials,
  LoginErrorResponse,
  LoginValidationErrors,
} from "../shared/types/authType";

export const useAuth = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [validationError, setValidationError] =
    useState<LoginValidationErrors>();
  const [errorResponse, setErrorResponse] = useState<LoginErrorResponse | null>(
    null
  );

  // Attempt login using userId and password
  const loginWithIdAndPassword = async (
    credentials: LoginCredentials,
    loginType: "admin" | "superadmin"
  ): Promise<User | undefined> => {
    // Set Loading
    setLoading(true);

    try {
      // Validate userId and password
      const errors = validateLoginForm(credentials);
      if (errors.email || errors.password) {
        setValidationError(errors);
        return;
      }

      // First, check if the user ID exists in our Firestore
      const user: CustomUser = await authApi.getByUsername(credentials.userId);

      // Verify if user does exist
      if (!user) {
        setErrorResponse({
          other: "User not found",
        });
        return;
      }

      // Check if user type matches
      const userType = user.type;
      if (
        (loginType === "admin" && userType !== "admin") ||
        (loginType === "superadmin" && userType !== "superadmin")
      ) {
        setErrorResponse({
          other: `This ID is not registered as a ${
            loginType === "admin" ? "Admin" : "Super Admin"
          }`,
        });
        return;
      }

      // Use the email from Firestore to log in via Firebase Auth
      // If the email field is empty in your Firestore, you'll need to set up an email-password
      // in Firebase Authentication that corresponds to this user ID
      const authUser: User = await authApi.loginWithEmailAndPassword(
        user.email,
        credentials.password
      );

      // Return user
      return authUser;
    } catch (error) {
      setErrorResponse({
        other: "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  // Attempt to logout user
  const logout = async (): Promise<void> => {
    await authApi.logout();
  };

  return {
    loading,
    errorResponse,
    validationError,
    loginWithIdAndPassword,
    logout,
  };
};
