import { createBrowserRouter, Navigate } from "react-router-dom";
import GuestLayout from "./layouts/GuestLayout";
import Login from "./modules/Login";
import DefaultLayout from "./layouts/DefaultLayout";
import Dashboard from "./modules/Dashboard";

// Create router
const router = createBrowserRouter([
  
  {
    path:"/",
    element: <DefaultLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      }
    ]
  },

  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={"/login"} />,
      },
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
]);

// Exporting router
export default router;
