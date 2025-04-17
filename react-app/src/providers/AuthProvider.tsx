import { ReactNode, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase/config";

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const currentPath = window.location.pathname;
      
      // If user is logged in and trying to access login page, redirect to dashboard
      if (currentUser && currentPath === "/login") {
        window.location.href = "/dashboard";
      }
      
      // If user is not logged in and trying to access protected routes, redirect to login
      else if (!currentUser && currentPath !== "/login") {
        window.location.href = "/login";
      }
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  return <>{children}</>;
};

export default AuthProvider;