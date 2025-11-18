import { useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
const baseURL = import.meta.env.VITE_API_BASE_URL;

export default function RecoverPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${baseURL}/api/users/recover_password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAlert({
          type: "error",
          title: "Error",
          message: data.detail || "Something went wrong.",
        });
      } else {
        setAlert({
          type: "success",
          title: "Info",
          message: data.detail || "Check your email for reset instructions.",
        });
      }

      setLoading(false);
    } catch (err) {
      setAlert({
        type: "error",
        title: "Error",
        message: "Network error. Please try again.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-white via-pink-50 to-indigo-50 px-4">
      <div className="bg-gray-100 shadow-2xl rounded-2xl p-8 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold mb-6">Recover Password</h2>
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
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#050E7F] font-semibold cursor-pointer hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
