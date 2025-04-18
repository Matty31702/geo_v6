import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

const pageTitles: any = {
  '/dashboard': 'Dashboard',
  '/personnels': 'Personnel Management',
  '/vehicles': 'Vehicle Management',
  '/monitoring': 'Monitoring personnels and vehicles',
  '/activities': 'Logged Entry/Exit',
  // Add more routes as needed
};

const DefaultLayout = () => {

  // Use location
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    return pageTitles[path] || 'Admin Portal'; // Default title if path not found
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-blue-800 to-blue-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content with Outlet */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Admin dropdown */}
        <Navbar title={getPageTitle()} />

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;