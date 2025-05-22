import { useState } from "react";
import { validateLoginForm } from "../utils/validation";
import { authApi } from "../api/authApi";
import { User } from "firebase/auth";
import { CustomUser } from "../api/models/AuthUser";

export const useAuth = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<{
    email?: string;
    password?: string;
    other?: string;
  } | null>(null);

  // Attempt login using userId and password
  const loginWithIdAndPassword = async (userId: string, password: string, loginType: "admin" | "superadmin"): Promise<User | undefined> => {
    // Set Loading
    setLoading(true);

    try {
      // Validate userId and password
      const errors = validateLoginForm(userId, password);
      if (errors.email || errors.password) {
        setError(errors);
        return;
      }

      // First, check if the user ID exists in our Firestore
      const user: CustomUser = await authApi.getByUsername(userId);

      // Verify if user does exist
      if(!user) {
        setError({
          other: "User not found"
        });
        return;
      }

      // Check if user type matches
      const userType = user.getType();
      if (
        (loginType === "admin" &&userType !== "admin") ||
        (loginType === "superadmin" &&userType !== "superadmin")
      ) {
        setError(
          {
            other: `This ID is not registered as a ${
            loginType === "admin" ? "Admin" : "Super Admin"
          }`
          }
        );
        return;
      }

      // Use the email from Firestore to log in via Firebase Auth
      // If the email field is empty in your Firestore, you'll need to set up an email-password
      // in Firebase Authentication that corresponds to this user ID
      const authUser: User = await authApi.loginWithEmailAndPassword(user.getEmail(), password);

      // Return user
      return authUser;
    } catch (error) {
      setError({
        other: "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  // Attempt to logout user
  const logout = async (): Promise<void> => {
    await authApi.logout();
  }

  return {
    loading,
    error,
    loginWithIdAndPassword,
    logout,
  };
};
