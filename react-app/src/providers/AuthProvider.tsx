import { ReactNode, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase/config";
import LINKS from "../constants/links";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Context
 * A provider that wraps up the RouterProvider (main.tsx) for verifying if the user is authenticated or not.
 * @param param0 
 * @returns {ReactNode}
 */
const AuthProvider = ({ children }: AuthProviderProps) => {
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const currentPath = window.location.pathname;
      
      // If user is logged in and trying to access login page, redirect to dashboard
      if (currentUser && currentPath === LINKS.LOGIN) {
        window.location.href = LINKS.DASHBOARD;
      }
      
      // If user is not logged in and trying to access protected routes, redirect to login
      else if (!currentUser && currentPath !== LINKS.LOGIN) {
        window.location.href = LINKS.LOGIN;
      }
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  return <>{children}</>;
};

export default AuthProvider;