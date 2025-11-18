import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import JobMap from "../components/JobMap";
import "leaflet/dist/leaflet.css";


export default function JobsPage() {
  const location = useLocation();
  const { skills, selectedCvId } = location.state || {};

  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Fetch user's current location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("Location error:", err);
        alert("Please enable location to find nearby jobs.");
      }
    );
  }, []);

  if (!skills) return <p>No skills found, cannot search jobs.</p>;
  if (!userLocation) return <p>Getting your location...</p>;

  return (
    <div className="min-h-screen">
      <JobMap
        skills={skills}
        userLat={userLocation.lat}
        userLng={userLocation.lng}
      />
    </div>
  );
}
