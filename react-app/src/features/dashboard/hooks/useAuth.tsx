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
      try {
        if (user) {
          // Get additional user data from Firestore
          const userDocRef = doc(database, "Users", user.uid);
          const userDoc = await getDoc(userDocRef);

          let userType = "admin"; // Default fallback

          if (userDoc.exists()) {
            const userData = userDoc.data();
            userType = userData.type || userData.role || "admin";
          }

          // Create extended user object
          const extendedUser: AuthUser = {
            ...user,
            type: userType,
          };

          setCurrentUser(extendedUser);
          setUserRole(userType);
        } else {
          // No user is signed in
          setCurrentUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);

        if (user) {
          // Fallback to default user on error
          const defaultUser: AuthUser = {
            ...user,
            type: "admin",
          };
          setCurrentUser(defaultUser);
          setUserRole("admin");
        } else {
          setCurrentUser(null);
          setUserRole(null);
        }
      } finally {
        // Always set loading to false, regardless of success or error
        setIsLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Utility computed properties for role checks
  const isAdmin = userRole === "admin" || userRole === "superadmin";
  const isSuperAdmin: boolean = userRole === "superadmin";

  return {
    currentUser,
    userRole,
    isLoading,
    isAdmin,
    isSuperAdmin,
  };
};

export default useAuth;
