import logo from "/images/logo-bg-removed.png";

const Logo = () => {
  return (
    <div className="w-48 h-48 mb-4 flex items-center justify-center">
      <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
        <img src={logo} alt="Geobound Logo" />
      </div>
    </div>
  );
};

export default Logo;
