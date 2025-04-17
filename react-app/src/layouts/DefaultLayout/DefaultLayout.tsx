import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const DefaultLayout = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<any>(null);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-blue-800 to-blue-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content with Outlet */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Admin dropdown */}
        <header className="bg-blue-800 text-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Dashboard</h1>

          {/* Admin dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 hover:bg-blue-700 py-1 px-3 rounded-full transition-colors duration-200"
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
                    onClick={() => {
                      // Add logout functionality here
                      setDropdownOpen(false);
                    }}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;