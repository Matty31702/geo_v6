import { useState } from "react";
import CustomHelmet from "../../components/CustomHelmet";
import logo from "/images/logo-bg-removed.png";
import { Eye, EyeClosed } from "lucide-react";

const Login = () => {
  // Password visible state
  const [isHidden, setIsHidden] = useState<boolean>(true);

  // Login type state
  const [loginType, setLoginType] = useState<string>("admin");

  return (
    <>
      <CustomHelmet title="Login | Geobound" />

      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-700">
        {/* Logo container - you'll add your image here */}
        <div className="w-48 h-48 mb-4 flex items-center justify-center">
          {/* Replace this div with your actual image */}
          <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
            {/* Your image will go here */}
            <img src={logo} alt="Geobound Logo" />
          </div>
        </div>

        <div className="w-full max-w-md px-4">
          <h2 className="text-center text-white text-xl font-bold mb-6">
            {loginType === "admin" ? "Admin Account" : "Super Admin Account"}
          </h2>

          <div className="mb-6">
            <div className="text-white mb-2">
              {loginType === "admin" ? "Admin ID" : "Super Admin ID"}
            </div>
            <input
              type="text"
              className="w-full p-3 rounded"
              placeholder={
                loginType === "admin"
                  ? "Enter Admin ID"
                  : "Enter Super Admin ID"
              }
            />
          </div>

          <div className="mb-6">
            <div className="text-white mb-2">Password</div>
            <div className="relative">
              <input
                type={isHidden ? "password" : "text"}
                className="w-full p-3 rounded pr-10"
                placeholder="Enter Password"
              />
              <button
                onClick={() => setIsHidden(!isHidden)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {isHidden ? <EyeClosed size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded">
            Login
          </button>

          <div className="mt-6 text-center">
            <button
              className="text-white underline"
              onClick={() =>
                setLoginType(loginType === "admin" ? "superadmin" : "admin")
              }
            >
              {loginType === "admin"
                ? "Login as Super Admin"
                : "Login as Admin"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
