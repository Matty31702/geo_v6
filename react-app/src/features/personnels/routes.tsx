import { RouteObject } from "react-router-dom";
import LINKS from "../../core/constants/links";
import Personnel from "./pages/Personnel";


const personnelRoutes: RouteObject = {
  path: LINKS.PERSONNELS,
  element: <Personnel />,
};

export default personnelRoutes;