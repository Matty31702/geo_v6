import { createBrowserRouter, Navigate, redirect } from "react-router-dom";
import GuestLayout from "./layouts/GuestLayout";
import Login from "./modules/Login";
import DefaultLayout from "./layouts/DefaultLayout";
import { auth } from "./services/firebase/config";
import Personnel from "./modules/Personnel";

// Authentication loader function
const authLoader = async () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      if (!user) {
        // If not logged in, redirect to login
        return resolve(redirect("/login"));
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
        return resolve(redirect("/personnels"));
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
        element: <Navigate to="/personnels" />,
      },
      {
        path: "personnels",
        element: <Personnel />,
      },
    ]
  },
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" />,
      },
      {
        path: "/login",
        element: <Login />,
        loader: guestLoader,
      },
    ],
  },
]);

// Exporting router
export default router;