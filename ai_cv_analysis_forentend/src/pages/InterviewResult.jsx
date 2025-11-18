import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterview } from "../components/api/interview";
import BackButton from "../components/BackButton";
export default function InterviewResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInterview(id)
      .then((res) => {
        setInterview(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center py-8">Loading results...</p>;

  if (!interview)
    return <p className="text-center py-8 text-red-600">Interview not found</p>;

  const scorePercentage = interview.score || 0;
  const scoreColor =
    scorePercentage >= 70
      ? "text-green-600"
      : scorePercentage >= 50
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-pink-50 to-indigo-50 p-8">
      <BackButton to="/my-interviews" title="Back to My Interviews" />
      <div className="max-w-4xl mx-auto">
        {/* Score Card */}
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#050E7F] mb-4">
            Interview Results
          </h1>
          <div className={`text-6xl font-bold ${scoreColor} mb-4`}>
            {Math.round(scorePercentage)}%
          </div>
          <p className="text-xl text-gray-600">
            Correct Answers: {interview.correct_answers} /{" "}
            {interview.total_questions}
          </p>
          <p className="text-gray-500 mt-2">
            Interview completed on{" "}
            {new Date(interview.started_at).toLocaleDateString()}
          </p>
        </div>

        {/* Questions Review */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#050E7F] mb-6">
            Question Review
          </h2>
          {interview.questions && interview.questions.length > 0 ? (
            interview.questions.map((q, index) => {
              const isCorrect = q.user_answer === q.correct_answer;
              const choices = {
                A: q.choice_1,
                B: q.choice_2,
                C: q.choice_3,
                D: q.choice_4,
              };

              return (
                <div
                  key={q.id}
                  className={`bg-white shadow-md rounded-lg p-6 border-l-4 ${
                    isCorrect ? "border-green-500" : "border-red-500"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        Question {index + 1}
                      </h3>
                      <p className="text-gray-700 mt-2">{q.question_text}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        isCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="font-semibold text-blue-900">
                        Your Answer:
                      </p>
                      <p className="text-blue-800">
                        {q.user_answer}:{" "}
                        {choices[q.user_answer] || "Not answered"}
                      </p>
                    </div>

                    {!isCorrect && (
                      <div className="bg-green-50 p-3 rounded">
                        <p className="font-semibold text-green-900">
                          Correct Answer:
                        </p>
                        <p className="text-green-800">
                          {q.correct_answer}: {choices[q.correct_answer]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-600">No questions to review</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => navigate("/my-interviews")}
            className="px-6 py-3 bg-[#050E7F] text-white rounded-lg font-medium hover:scale-105 transition-all"
          >
            Back to Interviews
          </button>
          <button
            onClick={() => navigate("/my-cvs")}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:scale-105 transition-all"
          >
            My CVs
          </button>
        </div>
      </div>
    </div>
  );
}
