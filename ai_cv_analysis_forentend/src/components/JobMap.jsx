import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


export default function JobMap() {
  const mapRef = useRef(null);
  const [places, setPlaces] = useState([]);
  const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        console.log("Your location:", latitude, longitude);

        // Initialize Map ONLY once
        if (!mapRef.current) {
          mapRef.current = L.map("map").setView([latitude, longitude], 14);

          L.tileLayer(
            `https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`,
            {
              maxZoom: 20,
            }
          ).addTo(mapRef.current);
        }

        // Add your location marker
        L.marker([latitude, longitude])
          .addTo(mapRef.current)
          .bindPopup("You are here")
          .openPopup();

        // Fetch nearby places (5 km radius)
        const url = `https://api.geoapify.com/v2/places?categories=business&filter=circle:${longitude},${latitude},5000&limit=20&apiKey=${GEOAPIFY_KEY}`;

        try {
          const res = await fetch(url);
          const data = await res.json();

          console.log("Places:", data);

          if (!data.features || data.features.length === 0) {
            alert("No places found near your location.");
            return;
          }

          const extracted = data.features.map((place) => ({
            name: place.properties.name ?? "Unknown",
            lat: place.geometry.coordinates[1],
            lon: place.geometry.coordinates[0],
          }));

          setPlaces(extracted);
        } catch (err) {
          console.error("Error fetching places:", err);
        }
      },
      (err) => {
        console.error("Location error:", err);
        alert("Enable location access to show nearby places.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  // Add place markers after fetch
  useEffect(() => {
    if (!mapRef.current) return;

    places.forEach((p) => {
      L.marker([p.lat, p.lon]).addTo(mapRef.current).bindPopup(p.name);
    });
  }, [places]);

  return (
    <div
      id="map"
      style={{
        height: "80vh",
        width: "100%",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    ></div>
  );
}
