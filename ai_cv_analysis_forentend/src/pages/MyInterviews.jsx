import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getInterviews,
  getCVDetails,
  deleteInterview,
} from "../components/api/interview";
import Alert from "../components/Alert";
import BackButton from "../components/BackButton";

/**
 * Safely extract interviews array from various API response structures
 */
function extractInterviews(data) {
  if (!data) return [];

  // If data is already an array, return it
  if (Array.isArray(data)) return data;

  // If data is an object, try common nesting patterns
  if (typeof data === "object") {
    // Check common response structures
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.interviews)) return data.interviews;
    if (Array.isArray(data.data)) return data.data;
  }

  return [];
}

export default function MyInterviews() {
  const navigate = useNavigate();
  const [cvDetailsMap, setCvDetailsMap] = useState({});
  const [alert, setAlert] = useState(null);

  // ✅ Updated for React Query v5
  const {
    data: rawData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["interviews"],
    queryFn: async () => {
      const response = await getInterviews();
      return response.data; // Extract data from axios response
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Safely extract interviews array
  const interviews = extractInterviews(rawData);

  // Fetch CV details for each interview
  useEffect(() => {
    if (interviews.length === 0) return;

    const fetchCVDetails = async () => {
      const detailsMap = {};

      for (const interview of interviews) {
        if (interview.cv && !detailsMap[interview.cv]) {
          try {
            const cvResponse = await getCVDetails(interview.cv);
            detailsMap[interview.cv] = cvResponse.data;
          } catch (error) {
            console.error(`Error fetching CV ${interview.cv}:`, error);
            detailsMap[interview.cv] = null;
          }
        }
      }

      setCvDetailsMap(detailsMap);
    };

    fetchCVDetails();
  }, [interviews]);

  const handleResume = (interviewId, currentQuestionIndex) => {
    // Navigate to interview with startFrom parameter to resume from saved position
    navigate(`/interview/${interviewId}?startFrom=${currentQuestionIndex}`);
  };

  const getCVFileName = (cvId) => {
    const cvData = cvDetailsMap[cvId];
    if (cvData?.file) {
      return cvData.file.split("/").pop() || `CV #${cvId}`;
    }
    return `CV #${cvId}`;
  };

  const handleDeleteInterview = async (interviewId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this interview? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteInterview(interviewId);
      setAlert({
        type: "success",
        title: "Interview Deleted",
        message: "Interview has been successfully deleted.",
      });
      // Refetch interviews after deletion
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error deleting interview:", error);
      setAlert({
        type: "error",
        title: "Failed to Delete",
        message:
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to delete interview. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg ">Loading interviews...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md">
          <Alert
            type="error"
            title="Error Loading Interviews"
            message={
              error?.response?.data?.detail ||
              error?.message ||
              "Failed to load interviews. Please try again."
            }
            onClose={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-pink-50 to-indigo-50 p-8">
      <BackButton to="/" title="Back to Home" />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Interviews</h1>

        {alert && (
          <Alert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {interviews.length === 0 ? (
          <div className="bg-white shadow-lg rounded-lg p-12 text-center">
            <p className="text-lg text-gray-600 mb-6">
              No interviews yet. Upload and analyze a CV to get started.
            </p>
            <button
              onClick={() => navigate("/upload-cv")}
              className="px-6 py-3 bg-[#050E7F] text-white rounded-lg font-medium hover:scale-105 transition-all"
            >
              Upload CV
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="bg-white shadow-lg rounded-lg p-6 flex justify-between items-center hover:shadow-xl transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#050E7F]">
                    Interview #{interview.id}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Based on: <strong>{getCVFileName(interview.cv)}</strong>
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        interview.completed
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {interview.completed ? "✓ Completed" : "⏳ Pending"}
                    </span>
                    {interview.score !== undefined &&
                      interview.score !== null && (
                        <span className="text-gray-600">
                          Score: <strong>{Math.round(interview.score)}%</strong>
                        </span>
                      )}
                    {interview.total_questions && (
                      <span className="text-gray-600">
                        Questions: <strong>{interview.total_questions}</strong>
                      </span>
                    )}
                  </div>
                  {interview.started_at && (
                    <p className="text-sm text-gray-500 mt-2">
                      Started:{" "}
                      {new Date(interview.started_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {!interview.completed && (
                    <button
                      onClick={() =>
                        handleResume(
                          interview.id,
                          interview.current_question_index || 0
                        )
                      }
                      className="px-4 py-2 bg-[#050E7F] text-white rounded-lg font-medium hover:scale-105 transition-all"
                    >
                      {interview.current_question_index > 0
                        ? `Resume (Q${interview.current_question_index + 1})`
                        : "Start"}
                    </button>
                  )}
                  {interview.completed && (
                    <button
                      onClick={() =>
                        navigate(`/interview/${interview.id}/result`)
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:scale-105 transition-all"
                    >
                      View Results
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteInterview(interview.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all"
                    title="Delete this interview"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
