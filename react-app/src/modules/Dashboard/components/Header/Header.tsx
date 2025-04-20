const Header = () => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-white">
        Geobound Monitoring System
      </h1>
      <div className="flex items-center space-x-2">
        <span className="text-green-400 flex items-center">
          <span className="h-2 w-2 bg-green-400 rounded-full mr-2"></span>
          System Online
        </span>
        <span className="text-gray-300 text-sm">Last updated: Just now</span>
      </div>
    </div>
  );
};

export default Header;
