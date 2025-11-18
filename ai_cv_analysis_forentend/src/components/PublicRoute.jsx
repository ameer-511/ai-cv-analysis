// src/components/PublicRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PublicRoute = () => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp > currentTime) {
        // Valid token → redirect to home
        return <Navigate to="/" replace />;
      }
    } catch (err) {
      console.error("Token decode failed:", err);
    }
  }

  // No token → allow access (to login/register)
  return <Outlet />;
};

export default PublicRoute;
