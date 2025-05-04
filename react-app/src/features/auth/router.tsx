import { Navigate, RouteObject } from "react-router-dom";
import GuestLayout from "./components/GuestLayout";
import LINKS from "../../core/constants/links";
import Login from "./pages/Login";
import guestLoader from "../../core/router/guestLoader";

const authRoutes: RouteObject = {
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
};

export default authRoutes;
