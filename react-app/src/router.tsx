import { createBrowserRouter, Navigate, redirect } from "react-router-dom";
import GuestLayout from "./layouts/GuestLayout";
import Login from "./modules/Login";
import DefaultLayout from "./layouts/DefaultLayout";
import { auth } from "./services/firebase/config";
import Personnel from "./modules/Personnel";
import Activity from "./modules/Activity";
import Vehicles from "./modules/Vehicles";
import Monitoring from "./modules/Monitoring";
import Dashboard from "./modules/Dashboard";
import LINKS from "./constants/links";

// Authentication loader function
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

// Guest routes loader
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

// Create router
const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    loader: authLoader,
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
        element: <Activity />
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
        loader: guestLoader,
      },
    ],
  },
]);

// Exporting router
export default router;