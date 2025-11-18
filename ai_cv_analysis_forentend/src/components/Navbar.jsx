import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="bg-[#050E7F] text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src={logo}
              alt="AI-CV Portal Logo"
              className="h-10 w-auto rounded-md transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-2xl font-bold tracking-tight group-hover:text-gray-200">
              AI-CV Portal
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="bg-transparent border border-white text-center hover:bg-white hover:text-[#050E7F] px-4 py-2 rounded-3xl shadow-md font-medium transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-[oklch(0.48_0.29_263.85_/_0.82)] text-center hover:bg-[oklch(0.45_0.3_263.85_/_0.9)] px-4 py-2 rounded-3xl shadow-md font-medium transition-all duration-200"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="relative flex items-center gap-4">
                {/* Authenticated Links */}
                <Link
                  to="/upload-cv"
                  className="hover:text-gray-300 font-medium"
                >
                  Upload CV
                </Link>
                <Link to="/my-cvs" className="hover:text-gray-300 font-medium">
                  My CVs
                </Link>
                <Link
                  to="/my-interviews"
                  className="hover:text-gray-300 font-medium"
                >
                  My Interviews
                </Link>
                <Link
                  to="/start-interview"
                  className="hover:text-gray-300 font-medium"
                >
                  Start Interview
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 bg-transparent text-white font-medium text-lg focus:outline-none"
                  >
                    <img
                      src={
                        user.profile_picture
                          ? user.profile_picture.startsWith("http")
                            ? user.profile_picture
                            : `${import.meta.env.VITE_API_BASE_URL}${
                                user.profile_picture
                              }`
                          : "https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
                      }
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="font-semibold">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={() => navigate("/profileSetting")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden ml-auto">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#050E7F] px-4 pt-4 pb-6 space-y-2">
          {!user ? (
            <>
              <Link
                to="/login"
                className="block w-full text-center bg-transparent border border-white hover:bg-white hover:text-[#050E7F] px-4 py-2 rounded-3xl shadow-md font-medium transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block w-full text-center bg-[oklch(0.48_0.29_263.85_/_0.82)] hover:bg-[oklch(0.45_0.3_263.85_/_0.9)] px-4 py-2 rounded-3xl shadow-md font-medium transition-all duration-200"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="space-y-2">
              <Link
                to="/upload-cv"
                className="block px-4 py-2 bg-white text-gray-800 rounded-lg shadow-md"
              >
                Upload CV
              </Link>
              <Link
                to="/my-cvs"
                className="block px-4 py-2 bg-white text-gray-800 rounded-lg shadow-md"
              >
                My CVs
              </Link>
              <Link
                to="/my-interviews"
                className="block px-4 py-2 bg-white text-gray-800 rounded-lg shadow-md"
              >
                My Interviews
              </Link>
              <Link
                to="/start-interview"
                className="block px-4 py-2 bg-white text-gray-800 rounded-lg shadow-md"
              >
                Start Interview
              </Link>
              <button
                onClick={() => navigate("/profileSetting")}
                className="block w-full text-left px-4 py-2 bg-white text-gray-800 rounded-lg shadow-md"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 bg-red-600 text-white rounded-lg shadow-md"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
