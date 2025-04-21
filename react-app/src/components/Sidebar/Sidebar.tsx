import {
  Activity,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogIn,
  Truck,
  Users,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import LINKS from "../../constants/links";

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState(false);

  if(isMobile) {}

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Check on initial load

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Sidebar */}
      <div
        className={`bg-blue-950 transition-all duration-300 ease-in-out shadow-lg ${
          sidebarOpen ? "w-72" : "w-16"
        } relative`}
      >
        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 bg-blue-600 hover:bg-blue-700 rounded-full p-1.5 text-white shadow-md z-10 transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Sidebar content */}
        <div className="h-full flex flex-col">
          {/* Logo Container */}
          <div className="flex justify-center items-center py-6 border-b border-blue-800">
            <div
              className={`transition-all duration-300 ${
                sidebarOpen ? "w-32 h-32" : "w-10 h-10"
              }`}
            >
              <img
                src="/images/logo-bg-removed.png"
                alt="Company Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Navigation Menu */}
          <div
            className={`flex-1 overflow-y-auto py-6 px-3 ${
              !sidebarOpen && "flex flex-col items-center"
            }`}
          >
            <nav className="space-y-4">
              <NavButton
              to={LINKS.DASHBOARD}
                icon={<LayoutDashboard size={20} />}
                text="Dashboard"
                isExpanded={sidebarOpen}
              />
              <NavButton
                to={LINKS.PERSONNELS}
                icon={<Users size={20} />}
                text="Personnels"
                isExpanded={sidebarOpen}
              />
              <NavButton
                to={LINKS.VEHICLES}
                icon={<Truck size={20} />}
                text="Vehicles"
                isExpanded={sidebarOpen}
              />
              <NavButton
                to={LINKS.ACTIVITIES}
                icon={<LogIn size={20} />}
                text="Logged Entry/Exit"
                isExpanded={sidebarOpen}
              />
              <NavButton
                to={LINKS.MONITORING}
                icon={<Activity size={20} />}
                text="Monitor Realtime Status"
                isExpanded={sidebarOpen}
              />
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

// Navigation Button Component
const NavButton = ({
  to,
  icon,
  text,
  isExpanded,
}: {
  to: string;
  icon: ReactNode;
  text: string;
  isExpanded: boolean;
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `w-full flex items-center ${
          isExpanded ? "justify-start gap-3" : "justify-center"
        } ${
          isActive
            ? "bg-yellow-500 text-blue-950"
            : "bg-yellow-400 hover:bg-yellow-500 text-blue-900"
        } font-medium py-3 ${
          isExpanded ? "px-4" : "px-2"
        } rounded shadow-sm transition-all duration-200`
      }
    >
      {icon}
      {isExpanded && <span>{text}</span>}
    </NavLink>
  );
};

export default Sidebar;
