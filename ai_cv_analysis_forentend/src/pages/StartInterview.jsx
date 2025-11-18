import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Alert from "../components/Alert";
import { startInterview, getInterviewByCV } from "../components/api/interview";
import BackButton from "../components/BackButton";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export default function StartInterview() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedCvId = location.state?.selectedCvId || null;
  const [cvs, setCvs] = useState([]);
  const [selectedCV, setSelectedCV] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [cvDetails, setCVDetails] = useState(null);
  const [existingInterview, setExistingInterview] = useState(null);
  const [checkingInterview, setCheckingInterview] = useState(false);

  const token = localStorage.getItem("accessToken");

  // Fetch analyzed CVs
  const fetchAnalyzedCVs = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/api/cv/cvs/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter only analyzed CVs
      const analyzedCVs = await Promise.all(
        response.data.map(async (cv) => {
          try {
            const analysisRes = await axios.get(
              `${baseURL}/api/cv/cvs/${cv.id}/analysis/`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            return { ...cv, analysis: analysisRes.data, isAnalyzed: true };
          } catch {
            return { ...cv, isAnalyzed: false };
          }
        })
      );

      const analyzed = analyzedCVs.filter((cv) => cv.isAnalyzed);
      setCvs(analyzed);

      // If preSelectedCvId exists, auto-select it
      if (preSelectedCvId) {
        const cv = analyzed.find((c) => c.id === preSelectedCvId);
        if (cv) handleSelectCV(cv);
      }

      if (analyzed.length === 0) {
        setAlert({
          type: "info",
          title: "No Analyzed CVs",
          message:
            "Please upload and analyze a CV first before starting an interview.",
        });
      }
    } catch (error) {
      console.error("Error fetching CVs:", error);
      setAlert({
        type: "error",
        title: "Failed to Load CVs",
        message: "Could not load your CVs. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [token, navigate, preSelectedCvId]);

  useEffect(() => {
    fetchAnalyzedCVs();
  }, [fetchAnalyzedCVs]);

  // Handle CV selection
  const handleSelectCV = (cv) => {
    setSelectedCV(cv.id);
    setCVDetails(cv);
    checkForExistingInterview(cv.id);
  };

  const checkForExistingInterview = async (cvId) => {
    try {
      setCheckingInterview(true);
      const existingInterview = await getInterviewByCV(cvId);
      setExistingInterview(existingInterview);
    } catch (error) {
      console.error("Error checking for existing interview:", error);
      setExistingInterview(null);
    } finally {
      setCheckingInterview(false);
    }
  };

  const handleStartInterview = async () => {
    if (!selectedCV) {
      setAlert({
        type: "warning",
        title: "No CV Selected",
        message: "Please select a CV to start the interview.",
      });
      return;
    }

    try {
      setStarting(true);

      // If there's an existing incomplete interview, resume it
      if (existingInterview && !existingInterview.completed) {
        setAlert({
          type: "success",
          title: "Resuming Interview",
          message: "Resuming your previous interview...",
        });
        setTimeout(() => {
          navigate(
            `/interview/${existingInterview.id}?startFrom=${
              existingInterview.current_question_index || 0
            }`
          );
        }, 1500);
        return;
      }

      // Otherwise, start a new interview
      const response = await startInterview(selectedCV);
      const interviewId = response.data?.id;

      if (interviewId) {
        setAlert({
          type: "success",
          title: "Interview Started",
          message: "Interview started successfully. Get ready!",
        });
        setTimeout(() => {
          navigate(`/interview/${interviewId}`);
        }, 1500);
      } else {
        throw new Error("No interview ID returned");
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      setAlert({
        type: "error",
        title: "Failed to Start Interview",
        message:
          error?.response?.data?.error ||
          error?.message ||
          "Could not start the interview. Please try again.",
      });
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#050E7F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your CVs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-pink-50 to-indigo-50 p-8">
      <BackButton to="/" title="Back to Home" />
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold  mb-3">Start Your Interview</h1>
          <p className="text-xl ">
            Select one of your analyzed CVs and begin the technical interview.
            You'll be asked 10 AI-generated questions based on your CV.
          </p>
        </div>

        {cvs.length === 0 ? (
          /* No CVs State */
          <div className="bg-white shadow-xl rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              No Analyzed CVs Found
            </h2>
            <p className="text-gray-600 mb-6">
              You need to upload and analyze a CV before starting an interview.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/upload-cv")}
                className="px-6 py-3 bg-[#050E7F] text-white rounded-lg font-medium hover:scale-105 transition-all"
              >
                Upload CV
              </button>
              <button
                onClick={() => navigate("/my-cvs")}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:scale-105 transition-all"
              >
                View My CVs
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* CV List */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-[#050E7F] mb-6">
                Your Analyzed CVs
              </h2>
              <div className="space-y-4">
                {cvs.map((cv) => (
                  <div
                    key={cv.id}
                    onClick={() => handleSelectCV(cv)}
                    className={`p-6 rounded-lg cursor-pointer transition-all border-2 ${
                      selectedCV === cv.id
                        ? "border-[#050E7F] bg-blue-50 shadow-lg"
                        : "border-gray-200 bg-white hover:border-[#050E7F] hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">
                          {cv.file?.split("/").pop() || `CV ${cv.id}`}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Uploaded:{" "}
                          {new Date(cv.uploaded_at).toLocaleDateString()}
                        </p>

                        {/* Analysis Preview */}
                        {cv.analysis && (
                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-700">
                                AI Score:
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full font-bold ${
                                  cv.analysis.ai_score >= 70
                                    ? "bg-green-100 text-green-700"
                                    : cv.analysis.ai_score >= 50
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {Math.round(cv.analysis.ai_score)}%
                              </span>
                            </div>

                            <div>
                              <span className="font-semibold text-gray-700">
                                Experience Level:
                              </span>
                              <p className="text-gray-600 capitalize">
                                {cv.analysis.experience_level ||
                                  "Not specified"}
                              </p>
                            </div>

                            <div>
                              <span className="font-semibold text-gray-700">
                                Skills:
                              </span>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {cv.analysis.skills_extracted &&
                                cv.analysis.skills_extracted.length > 0 ? (
                                  cv.analysis.skills_extracted
                                    .slice(0, 5)
                                    .map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="px-3 py-1 bg-[#050E7F] text-white text-xs rounded-full"
                                      >
                                        {skill}
                                      </span>
                                    ))
                                ) : (
                                  <p className="text-gray-500">
                                    No skills found
                                  </p>
                                )}
                                {cv.analysis.skills_extracted &&
                                  cv.analysis.skills_extracted.length > 5 && (
                                    <span className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-full font-medium">
                                      +{cv.analysis.skills_extracted.length - 5}{" "}
                                      more
                                    </span>
                                  )}
                              </div>
                            </div>

                            <div>
                              <span className="font-semibold text-gray-700">
                                Summary:
                              </span>
                              <p className="text-gray-600 line-clamp-2">
                                {cv.analysis.summary || "No summary available"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Selection Indicator */}
                      {selectedCV === cv.id && (
                        <div className="ml-4 flex-shrink-0">
                          <div className="w-6 h-6 bg-[#050E7F] rounded-full flex items-center justify-center">
                            <span className="text-white text-lg">✓</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar - Interview Info */}
            <div>
              <div className="bg-white shadow-xl rounded-lg p-8 sticky top-8">
                <h3 className="text-2xl font-bold text-[#050E7F] mb-4">
                  Interview Details
                </h3>

                {selectedCV && cvDetails ? (
                  <div className="space-y-6">
                    {/* Selected CV Info */}
                    <div className="pb-4 border-b border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Selected CV</p>
                      <p className="font-semibold text-gray-800">
                        {cvDetails.file?.split("/").pop() ||
                          `CV ${cvDetails.id}`}
                      </p>
                    </div>

                    {/* Existing Interview Status */}
                    {checkingInterview ? (
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">
                          Checking interview status...
                        </p>
                      </div>
                    ) : existingInterview && !existingInterview.completed ? (
                      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                        <h4 className="font-bold text-purple-900 mb-2">
                          📋 Interview in Progress
                        </h4>
                        <p className="text-sm text-purple-800 mb-3">
                          You have an incomplete interview for this CV. You can
                          resume from where you left off.
                        </p>
                        <div className="text-xs text-purple-700 space-y-1">
                          <p>
                            Progress: Question{" "}
                            <strong>
                              {(existingInterview.current_question_index || 0) +
                                1}
                            </strong>{" "}
                            of{" "}
                            <strong>
                              {existingInterview.total_questions || 10}
                            </strong>
                          </p>
                          <p>
                            Started:{" "}
                            {new Date(
                              existingInterview.started_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ) : existingInterview && existingInterview.completed ? (
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <h4 className="font-bold text-green-900 mb-2">
                          ✓ Interview Completed
                        </h4>
                        <p className="text-sm text-green-800">
                          You can start a new interview for this CV.
                        </p>
                        {existingInterview.score !== undefined &&
                          existingInterview.score !== null && (
                            <p className="text-sm text-green-700 mt-2">
                              Previous Score:{" "}
                              <strong>
                                {Math.round(existingInterview.score)}%
                              </strong>
                            </p>
                          )}
                      </div>
                    ) : null}

                    {/* Interview Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-bold text-[#050E7F] mb-3">
                        What to Expect
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-[#050E7F] font-bold">📝</span>
                          <span>10 AI-generated technical questions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#050E7F] font-bold">🎯</span>
                          <span>Multiple choice format (A, B, C, D)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#050E7F] font-bold">⏱️</span>
                          <span>Take as much time as you need</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#050E7F] font-bold">📊</span>
                          <span>Get instant results and feedback</span>
                        </li>
                      </ul>
                    </div>

                    {/* Tips */}
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-bold text-yellow-900 mb-2">
                        💡 Tips
                      </h4>
                      <ul className="space-y-1 text-xs text-yellow-800">
                        <li>
                          • Read each question carefully before selecting an
                          answer
                        </li>
                        <li>
                          • You can navigate between questions using
                          Previous/Next
                        </li>
                        <li>
                          • All answers must be selected before submitting
                        </li>
                      </ul>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={handleStartInterview}
                      disabled={starting || checkingInterview}
                      className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-all ${
                        starting || checkingInterview
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#050E7F] hover:scale-105 hover:shadow-lg"
                      }`}
                    >
                      {starting || checkingInterview ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {checkingInterview ? "Checking..." : "Starting..."}
                        </div>
                      ) : existingInterview && !existingInterview.completed ? (
                        "▶️ Resume Interview"
                      ) : (
                        "🚀 Start Interview"
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      👈 Select a CV to begin
                    </p>
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">→</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
