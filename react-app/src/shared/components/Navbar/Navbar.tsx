import { LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../features/auth/hooks/useAuth";

interface NavbarProps {
  title: string;
}

const Navbar: React.FC<NavbarProps> = ({title}) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<any>(null);

  // Open useAuth
  const {logout} = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
  };

  return (
    <>
      {/* Header with Admin dropdown */}
      <header className="bg-blue-800 text-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">{title}</h1>

        {/* Admin dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className={`flex items-center gap-2 hover:bg-blue-700 py-1 px-3 rounded-full transition-colors duration-200 ${
              dropdownOpen && "bg-blue-700"
            }`}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <span className="hidden md:inline">Admin</span>
            <div className="bg-white text-blue-900 rounded-full h-8 w-8 flex items-center justify-center font-medium shadow">
              A
            </div>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 overflow-hidden transform origin-top-right">
              <div className="py-1">
                <button
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Navbar;
