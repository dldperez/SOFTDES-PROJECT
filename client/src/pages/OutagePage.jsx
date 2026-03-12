import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../styles/styles.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapFocus({ selectedOutage, markerRefs }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedOutage) return;

    map.setView([selectedOutage.lat, selectedOutage.lng], 13, {
      animate: true,
    });

    const marker = markerRefs.current[selectedOutage.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedOutage, map, markerRefs]);

  return null;
}

export default function OutagePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [outages, setOutages] = useState([]);
  const [lastRefresh, setLastRefresh] = useState("");
  const [error, setError] = useState("");
  const [selectedOutage, setSelectedOutage] = useState(null);

  const markerRefs = useRef({});

  const fetchOutages = async () => {
    try {
      setError("");

      const res = await fetch("http://localhost:5000/api/outage");

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      setOutages(data);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Error fetching outages:", err);
      setError("Failed to load outage data.");
      setOutages([]);
    }
  };

  useEffect(() => {
    fetchOutages();

    const interval = setInterval(() => {
      fetchOutages();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/outage");
    window.location.reload();
  };

  const handleSelectOutage = (item) => {
    setSelectedOutage(item);

    const mapSection = document.querySelector(".leaflet-map-wrapper");
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <>
      <header>
        <div className="navbar">
          <div className="logo">
            <img
              src={`${import.meta.env.BASE_URL}images/logo.png`}
              alt="PLDT Logo"
              width="50"
              height="50"
            />
            <span>PLDT Smart Support</span>
          </div>

          <nav>
            <Link to="/">Home</Link>
            <Link to="/chat">Chat Support</Link>
            <Link to="/outage">Outage Map</Link>
            <Link to="/router">Router Setup</Link>

            {!token ? (
              <>
                <Link className="auth" to="/login">
                  Sign In
                </Link>
                <Link className="auth" to="/signup">
                  Register
                </Link>
              </>
            ) : (
              <>
                <span className="welcome-user">
                  Welcome, {user?.firstName || user?.username || "User"}
                </span>
                <button className="auth" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="map-section">
        <h1>Network Outage Map</h1>
        <p>Last refreshed: {lastRefresh || "Loading..."}</p>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="leaflet-map-wrapper">
          <MapContainer
            center={[14.676, 121.0437]}
            zoom={11}
            scrollWheelZoom={true}
            className="leaflet-map"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapFocus
              selectedOutage={selectedOutage}
              markerRefs={markerRefs}
            />

            {outages.map((item) => (
              <Marker
                key={item.id}
                position={[item.lat, item.lng]}
                ref={(ref) => {
                  if (ref) {
                    markerRefs.current[item.id] = ref;
                  }
                }}
              >
                <Popup>
                  <strong>{item.area}</strong>
                  <br />
                  Status: {item.status}
                  <br />
                  Severity: {item.severity}
                  <br />
                  Affected Users: {item.affectedUsers}
                  <br />
                  Estimated Restoration: {item.estimatedRestoration}
                  <br />
                  Last Updated: {item.lastUpdated}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="outage-list">
          <h2>Current Outage Updates</h2>
          {outages.length === 0 ? (
            <p>No outage data available.</p>
          ) : (
            outages.map((item) => (
              <div key={item.id} className="history-item">
                <button
                  className="outage-location-link"
                  onClick={() => handleSelectOutage(item)}
                >
                  {item.area}
                </button>
                <p>Status: {item.status}</p>
                <p>Severity: {item.severity}</p>
                <p>Affected Users: {item.affectedUsers}</p>
                <p>Estimated Restoration: {item.estimatedRestoration}</p>
                <p>Last Updated: {item.lastUpdated}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}