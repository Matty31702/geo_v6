import { RouteObject } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LINKS from "../../core/constants/links";

const dashboardRoutes: RouteObject = {
  path: LINKS.DASHBOARD,
  element: <Dashboard />,
};

export default dashboardRoutes;
