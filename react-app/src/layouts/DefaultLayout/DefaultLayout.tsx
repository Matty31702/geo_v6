import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

const DefaultLayout = () => {


  return (
    <div className="flex h-screen bg-gradient-to-b from-blue-800 to-blue-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content with Outlet */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Admin dropdown */}
        <Navbar />

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;