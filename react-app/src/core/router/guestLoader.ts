import { redirect } from "react-router-dom";
import { auth } from "../config/firebaseConfig";
import LINKS from "../constants/links";

/**
 * Guest routes loader
 * Prevents authenticated users from accessing guest routes
 * @returns {Promise<null|Response>} Redirect response or null to continue
 */
const guestLoader = async () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      if (user) {
        // If logged in, redirect to dashboard
        return resolve(redirect(LINKS.DASHBOARD));
      }
      resolve(null);
    });
  });
};

export default guestLoader;