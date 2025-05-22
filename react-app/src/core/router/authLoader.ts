import { redirect } from "react-router-dom";
import { auth } from "../config/firebaseConfig";
import LINKS from "../constants/links";

/**
 * Authentication loader for protected routes
 * Checks if the user is authenticated and redirects to login if not
 * @returns {Promise<null|Response>} Redirect response or null to continue
 */
const authLoader = async () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      if (!user) {
        // If not logged in, redirect to login
        return resolve(redirect(LINKS.LOGIN));
      }
      resolve(null);
    });
  });
};

export default authLoader;