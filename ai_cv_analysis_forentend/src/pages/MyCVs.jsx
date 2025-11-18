import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Alert from "../components/Alert";
import BackButton from "../components/BackButton";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export default function MyCVs() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");

  // Fetch CVs and check if analyzed
  const fetchCVs = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${baseURL}/api/cv/cvs/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // For each CV, check analysis via CV endpoint
      const updatedCVs = await Promise.all(
        response.data.map(async (cv) => {
          let status = "pending";
          try {
            await axios.get(`${baseURL}/api/cv/cvs/${cv.id}/analysis/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            status = "analyzed";
          } catch (err) {
            status = "pending";
          }
          return { ...cv, status };
        })
      );

      setCvs(updatedCVs);
    } catch (error) {
      console.error("Error fetching CVs:", error);
      setAlert({
        type: "error",
        title: "Failed to Load",
        message: "Could not load your CVs. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setAlert({
        type: "error",
        title: "Unauthorized",
        message: "Please log in to view your CVs.",
      });
      setLoading(false);
      return;
    }

    fetchCVs();
    const interval = setInterval(fetchCVs, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, [token]);

  // View Analysis
  const handleViewAnalysis = async (cvId) => {
    try {
      const response = await axios.get(
        `${baseURL}/api/cv/cvs/${cvId}/analysis/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate(`/cv-analysis/${cvId}`, { state: { analysis: response.data } });
    } catch (error) {
      setAlert({
        type: "warning",
        title: "Not Analyzed Yet",
        message: "⚠️ This CV has not been analyzed yet. Please wait a moment.",
      });
    }
  };

  // Delete CV
  const handleDeleteCV = async (cvId) => {
    if (!window.confirm("Are you sure you want to delete this CV?")) return;

    try {
      await axios.delete(`${baseURL}/api/cv/cvs/${cvId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlert({
        type: "success",
        title: "Deleted",
        message: "CV deleted successfully.",
      });

      setCvs(cvs.filter((cv) => cv.id !== cvId));
    } catch (error) {
      console.error("Delete error:", error);
      setAlert({
        type: "error",
        title: "Delete Failed",
        message: "Could not delete the CV. Please try again later.",
      });
    }
  };

  // Download CV
  const handleDownloadCV = (cv) => {
    if (!cv.file) {
      setAlert({
        type: "error",
        title: "Download Failed",
        message: "CV file URL not available.",
      });
      return;
    }

    const link = document.createElement("a");
    link.href = cv.file;
    link.download = cv.file_name || `CV-${cv.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-pink-50 to-indigo-50 px-6 py-12 flex flex-col items-center">
      <BackButton to="/" title="Back to Home" />
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-8">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 text-center sm:text-left">
            📂 My Uploaded CVs
          </h1>
          <button
            onClick={() => navigate("/upload-cv")}
            className="bg-[#050E7F] text-white px-6 py-3 font-bold rounded-full hover:bg-indigo-700 transition text-sm sm:text-base"
          >
            Start CV Analysis
          </button>
        </div>

        {alert && (
          <div className="mb-6">
            <Alert
              type={alert.type}
              title={alert.title}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Loading your CVs...</p>
        ) : cvs.length === 0 ? (
          <p className="text-center text-gray-600">
            You haven’t uploaded any CVs yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-indigo-100 text-gray-800">
                <tr>
                  <th className="py-3 px-6">#</th>
                  <th className="py-3 px-6">File Name</th>
                  <th className="py-3 px-6">Upload Date</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cvs.map((cv, index) => (
                  <tr
                    key={cv.id}
                    className="border-b hover:bg-indigo-50 transition"
                  >
                    <td className="py-3 px-6">{index + 1}</td>
                    <td className="py-3 px-6">
                      {cv.file_name || `CV-${cv.id}`}
                    </td>
                    <td className="py-3 px-6">
                      {new Date(cv.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          cv.status === "analyzed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {cv.status === "analyzed" ? "Analyzed" : "Pending"}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center space-x-2">
                      <button
                        onClick={() => handleViewAnalysis(cv.id)}
                        className="px-3 py-1 rounded-full bg-[#050E7F] text-white hover:bg-indigo-700 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadCV(cv)}
                        className="px-3 py-1 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleDeleteCV(cv.id)}
                        className="px-3 py-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
