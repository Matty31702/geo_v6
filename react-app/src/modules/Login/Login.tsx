import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomHelmet from "../../components/CustomHelmet";
import logo from "/images/logo-bg-removed.png";
import { Eye, EyeClosed } from "lucide-react";
import authService from "../../services/authService";
import { User } from "../../types/firestore";

const Login = () => {
  // Password visible state
  const [isHidden, setIsHidden] = useState(true);
  // Login type state
  const [loginType, setLoginType] = useState("admin");
  // Form states
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  // Error and loading states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError("");

    if (!userId || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // First, check if the user ID exists in our Firestore
      const { data: userData, error: dbError } =
        await authService.getDocument<User>("Users", userId);

      if (dbError) {
        setError("Error checking user information");
        setLoading(false);
        return;
      }

      if (!userData) {
        setError("User ID not found");
        setLoading(false);
        return;
      }

      // Check if user type matches
      const userType = userData.type; // "Personnel" in your case
      if (
        (loginType === "admin" && userType !== "Personnel") ||
        (loginType === "superadmin" && userType !== "SuperAdmin")
      ) {
        setError(
          `This ID is not registered as a ${
            loginType === "admin" ? "Admin" : "Super Admin"
          }`
        );
        setLoading(false);
        return;
      }

      // Use the email from Firestore to log in via Firebase Auth
      // If the email field is empty in your Firestore, you'll need to set up an email-password
      // in Firebase Authentication that corresponds to this user ID
      const email = userData.email || `${userId}@yourdomain.com`; // Use a default if email is empty

      const { error: authError } = await authService.loginWithEmail(
        email,
        password
      );

      if (authError) {
        setError("Invalid credentials");
        setLoading(false);
        return;
      }

      // If successful, navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomHelmet title="Login | Geobound" />

      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-700">
        {/* Logo container */}
        <div className="w-48 h-48 mb-4 flex items-center justify-center">
          <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
            <img src={logo} alt="Geobound Logo" />
          </div>
        </div>

        <div className="w-full max-w-md px-4">
          <h2 className="text-center text-white text-xl font-bold mb-6">
            {loginType === "admin" ? "Admin Account" : "Super Admin Account"}
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
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
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <div className="text-white mb-2">Password</div>
              <div className="relative">
                <input
                  type={isHidden ? "password" : "text"}
                  className="w-full p-3 rounded pr-10"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setIsHidden(!isHidden)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {isHidden ? <EyeClosed size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

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
