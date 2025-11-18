import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import LoginForm from "../pages/LoginForm";
import RegisterForm from "../pages/RegisterForm";
import ProfileSetting from "../pages/ProfileSetting";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import UploadCV from "../pages/UploadCv";
import RecoverPassword from "../pages/RecoverPassword";
import ResetPassword from "../pages/ResetPassword";
import CVAnalysis from "../pages/CVAnalysis";
import MyCVs from "../pages/MyCVs";
import MyInterviews from "../pages/MyInterviews";
import StartInterview from "../pages/StartInterview";
import Interview from "../pages/Interview";
import InterviewResult from "../pages/InterviewResult";
import JobsPage from "../pages/JobPage";

const RoutesConfig = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profileSetting" element={<ProfileSetting />} />
        <Route path="/upload-cv" element={<UploadCV />} />
        <Route path="/cv-analysis/:cvId" element={<CVAnalysis />} />
        <Route path="/my-cvs" element={<MyCVs />} />
        <Route path="/my-interviews" element={<MyInterviews />} />
        <Route path="/start-interview" element={<StartInterview />} />
        <Route path="/interview/:id" element={<Interview />} />
        <Route path="/interview/:id/result" element={<InterviewResult />} />
        <Route path="/jobs" element={<JobsPage />} />
      </Route>

      {/* Default public route */}
      <Route path="/" element={<Home />} />
    </Routes>
  );
};

export default RoutesConfig;
