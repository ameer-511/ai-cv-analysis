import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
const baseURL = import.meta.env.VITE_API_BASE_URL;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${baseURL}/api/users/reset_password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, new_password: password }),
      });

      const data = await res.json();
      if (res.ok) {
        setAlert({
          type: "success",
          title: "Success",
          message: "Password reset successful! Redirecting to login...",
        });
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setAlert({
          type: "error",
          title: "Error",
          message: data.detail || "Invalid or expired link.",
        });
      }
    } catch (err) {
      setAlert({
        type: "error",
        title: "Error",
        message: "Network error. Please try again.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-white via-pink-50 to-indigo-50 px-4">
      <div className="bg-gray-100 shadow-2xl rounded-2xl p-8 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold mb-6">Reset Password</h2>
        {alert && (
          <Alert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#050E7F]"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#050E7F]"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#050E7F] text-white hover:scale-105 transform"
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <div className="mt-4">
          {message && (
            <Alert
              type={message.includes("Check") ? "success" : "error"} // simple logic
              title={message.includes("Check") ? "Success" : "Error"}
              message={message}
              onClose={() => setMessage("")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
