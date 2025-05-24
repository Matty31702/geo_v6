import { Navigate, RouteObject } from "react-router-dom";
import LINKS from "../../core/constants/links";
import guestLoader from "../../core/router/guestLoader";
import LoginPage from "./pages/LoginPage";
import GuestLayout from "./components/GuestLayout";

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
      element: <LoginPage />,
      loader: guestLoader, // Prevent authenticated users from seeing login
    },
  ],
};

export default authRoutes;
