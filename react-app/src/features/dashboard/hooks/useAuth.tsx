import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { database } from "../../../core/config/firebaseConfig";

interface AuthUser extends User {
  type?: string;
}

interface UseAuthReturn {
  currentUser: AuthUser | null;
  userRole: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const useAuth = (): UseAuthReturn => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from Firestore
        try {
          const userDocRef = doc(database, "Users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Extend the user object with role information
            const extendedUser: AuthUser = {
              ...user,
              type: userData.type || userData.role || "user", // Use type or role field depending on your DB structure
            };

            // console.log(extendedUser.type);

            if (extendedUser && extendedUser.type) {
              setCurrentUser(extendedUser);
              setUserRole(extendedUser.type);
            }
          } else {
            // If no user document exists, set default role
            const defaultUser: AuthUser = {
              ...user,
              type: "admin",
            };
            setCurrentUser(defaultUser);
            setUserRole("admin");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setCurrentUser(user as AuthUser);
          setUserRole("admin"); // Default to regular user on error
        }
      } else {
        // No user is signed in
        setCurrentUser(null);
        setUserRole(null);
      }

      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Utility computed properties for role checks
  const isAdmin = userRole === "admin" || userRole === "superadmin";
  const isSuperAdmin = userRole === "superadmin";

  return {
    currentUser,
    userRole,
    isLoading,
    isAdmin,
    isSuperAdmin,
  };
};

export default useAuth;
