import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function JobMap({ skills }) {
  const mapRef = useRef(null);
  const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      mapRef.current = L.map("map").setView([33.6844, 73.0479], 13);

      L.tileLayer(
        `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`,
        { maxZoom: 20 }
      ).addTo(mapRef.current);
    }

    // Fetch nearby companies only if skills exist
    if (!skills || skills.length === 0) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      mapRef.current.setView([latitude, longitude], 13);

      // User marker
      L.marker([latitude, longitude])
        .addTo(mapRef.current)
        .bindPopup("You are here")
        .openPopup();

      // Fetch job locations
      const query = encodeURIComponent(skills.join(" "));
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${query}&bias=proximity:${longitude},${latitude}&apiKey=${GEOAPIFY_KEY}`
      );

      const data = await res.json();
      data.features.forEach((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        L.marker([lat, lng])
          .addTo(mapRef.current)
          .bindPopup(feature.properties.formatted || "Job Location");
      });
    });
  }, [skills]);

  return <div id="map" style={{ height: "80vh", width: "100%" }}></div>;
}
