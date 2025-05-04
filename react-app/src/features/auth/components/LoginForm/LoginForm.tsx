import React, { useState } from "react";
import InputField from "../InputField";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface LoginFormProps {
  loginType: "admin" | "superadmin";
}

const LoginForm: React.FC<LoginFormProps> = ({ loginType }) => {
  // Form states
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  // Use Hook
  const {loading, error, loginWithIdAndPassword} = useAuth();
  const navigate = useNavigate();   

  /**
   * Attempt to login the user using their user ID and password
   * @param e - Prevent redirecting to different page
   */
  const handleLogin = async (e: any) => {
    e.preventDefault();
    
    const user = await loginWithIdAndPassword(userId, password, loginType);
    // If successful, then navigate to dashboard
    if(user) {
      navigate('/');
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error.email}
          {error.password}
          {error.other}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <InputField
          title="Admin ID"
          placeholder="Enter Admin ID"
          value={userId}
          setValue={setUserId}
        />

        <InputField
          title="Password"
          isPassword={true}
          placeholder={"Enter password"}
          value={password}
          setValue={setPassword}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </>
  );
};

export default LoginForm;
