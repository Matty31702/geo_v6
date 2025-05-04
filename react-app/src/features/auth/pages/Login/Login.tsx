import { useState } from "react";
import CustomHelmet from "../../../../shared/components/CustomHelmet";
import LoginForm from "../../components/LoginForm";
import Logo from "../../components/Logo";

/**
 * Login Page
 * - A page dedicated to authenticate the guest user. If the user is authenticated then will be redirected to the Dashboad (/).
 */
const Login = () => {
  // Login type state
  const [loginType, setLoginType] = useState<"admin" | "superadmin">("admin");

  return (
    <>
      <CustomHelmet title="Login | Geobound" />

      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-700">
        {/* Logo container */}
        <Logo />

        <div className="w-full max-w-md px-4">
          <h2 className="text-center text-white text-xl font-bold mb-6">
            {loginType === "admin" ? "Admin Account" : "Super Admin Account"}
          </h2>

          {/* Login Form */}
          <LoginForm loginType={loginType} />

          <div className="mt-6 text-center">
            <button
              type="button"
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
