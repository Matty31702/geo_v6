/**
 * Router configuration for  the application
 * Sets up protected routes for authenticated users and guest routes
 */
import { createBrowserRouter, Navigate } from "react-router-dom";
import DefaultLayout from "../../shared/components/DefaultLayout";
import Vehicles from "../../modules/Vehicles";
import Monitoring from "../../modules/Monitoring";
import LINKS from "../constants/links";
import Activities from "../../modules/Activities";
import authLoader from "./authLoader";
import authRoutes from "../../features/auth/router";
import dashboardRoutes from "../../features/dashboard/routes";
import personnelRoutes from "../../features/personnels/routes";

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
      // Dashboard routes
      dashboardRoutes,
      // Personnel routes
      personnelRoutes,
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

  // Auth routes
  authRoutes,
]);

export default router;