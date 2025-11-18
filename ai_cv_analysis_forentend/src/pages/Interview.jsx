import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  getInterview,
  submitAnswer,
  saveProgress,
} from "../components/api/interview";
import Alert from "../components/Alert";
import BackButton from "../components/BackButton";

export default function Interview() {
  const { id } = useParams(); // interview ID from URL
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Load interview and resume position
  useEffect(() => {
    getInterview(id)
      .then((res) => {
        setInterview(res.data);

        // Load resume position: check URL param first, then interview progress
        const startFromParam = searchParams.get("startFrom");
        if (startFromParam) {
          setCurrentIndex(parseInt(startFromParam));
        } else if (res.data.current_question_index > 0) {
          setCurrentIndex(res.data.current_question_index);
        }

        setLoading(false);
      })
      .catch(() => {
        setAlert({
          type: "error",
          title: "Error",
          message: "Failed to load interview",
        });
        setLoading(false);
      });
  }, [id, searchParams]);

  // Save progress on page unload
  useEffect(() => {
    const saveCurrentProgress = async () => {
      try {
        if (interview) {
          await saveProgress(interview.id, currentIndex);
        }
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    };

    const handleBeforeUnload = () => {
      if (interview && !interview.completed && currentIndex >= 0) {
        saveCurrentProgress();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [interview, currentIndex]);

  const handleNext = useCallback(async () => {
    try {
      if (!interview) return;
      const questions = interview.questions || [];
      const currentQuestion = questions[currentIndex];

      await submitAnswer(interview.id, currentQuestion.id, selectedAnswer);
      setSelectedAnswer("");
      if (currentIndex < questions.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        // Save progress after moving to next question
        await saveProgress(interview.id, nextIndex);
      } else {
        // All questions answered, go to results
        navigate(`/interview/${interview.id}/result`);
      }
    } catch {
      setAlert({
        type: "error",
        title: "Error",
        message: "Failed to submit answer",
      });
    }
  }, [currentIndex, interview, navigate, selectedAnswer]);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  if (loading) return <p className="text-center py-8">Loading interview...</p>;

  if (!interview)
    return <p className="text-center py-8 text-red-600">Interview not found</p>;

  const questions = interview.questions || [];
  if (questions.length === 0)
    return <p className="text-center py-8">No questions available</p>;

  const currentQuestion = questions[currentIndex];

  // Build choices object from individual fields
  const choices = {
    A: currentQuestion.choice_1,
    B: currentQuestion.choice_2,
    C: currentQuestion.choice_3,
    D: currentQuestion.choice_4,
  };

  const handleSelect = (choice) => setSelectedAnswer(choice);

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-pink-50 to-indigo-50 p-8">
      <BackButton to="/my-interviews" title="Back to My Interviews" />
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-[#050E7F] mb-2">
            Question {currentIndex + 1} of {questions.length}
          </h2>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#050E7F] h-2 rounded-full transition-all"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-lg font-semibold text-gray-800 mb-6">
            {currentQuestion.question_text}
          </p>

          <div className="space-y-3">
            {Object.entries(choices).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all font-medium ${
                  selectedAnswer === key
                    ? "border-[#050E7F] bg-[#050E7F] text-white"
                    : "border-gray-300 bg-gray-50 text-gray-800 hover:border-[#050E7F]"
                }`}
              >
                <span className="font-bold">{key}.</span> {value}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-all"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="px-6 py-3 bg-[#050E7F] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
          >
            {currentIndex === questions.length - 1
              ? "Submit Interview"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
