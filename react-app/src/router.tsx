/**
 * Router configuration for  the application
 * Sets up protected routes for authenticated users and guest routes
 */
import { createBrowserRouter, Navigate, redirect } from "react-router-dom";
import GuestLayout from "./layouts/GuestLayout";
import Login from "./modules/Login";
import DefaultLayout from "./layouts/DefaultLayout";
import { auth } from "./services/firebase/config";
import Personnel from "./modules/Personnel";
import Vehicles from "./modules/Vehicles";
import Monitoring from "./modules/Monitoring";
import Dashboard from "./modules/Dashboard";
import LINKS from "./constants/links";
import Activities from "./modules/Activities";

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

/**
 * Application router configuration
 * Defines two main layouts:
 * 1. DefaultLayout - For authenticated users (protected routes)
 * 2. GuestLayout - For unauthenticated users
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    loader: authLoader, // Protect all child routes
    children: [
      {
        index: true,
        element: <Navigate to={LINKS.DASHBOARD} />,
      },
      {
        path: LINKS.DASHBOARD,
        element: <Dashboard />,
      },
      {
        path: LINKS.PERSONNELS,
        element: <Personnel />,
      },
      {
        path: LINKS.VEHICLES,
        element: <Vehicles />,
      },
      {
        path: LINKS.MONITORING,
        element: <Monitoring />
      },
      {
        path: LINKS.ACTIVITIES,
        element: <Activities />
      },
    ]
  },
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={LINKS.LOGIN} />,
      },
      {
        path: LINKS.LOGIN,
        element: <Login />,
        loader: guestLoader, // Prevent authenticated users from seeing login
      },
    ],
  },
]);

export default router;