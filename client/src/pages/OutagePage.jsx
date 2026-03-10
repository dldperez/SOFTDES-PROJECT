import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../styles/styles.css";

// Fix default Leaflet marker icons in Vite/React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

export default function OutagePage() {
  const [outages, setOutages] = useState([]);
  const [lastRefresh, setLastRefresh] = useState("");

  const fetchOutages = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/outages");
      const data = await res.json();
      setOutages(data);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching outages:", error);
    }
  };

  useEffect(() => {
    fetchOutages();

    const interval = setInterval(() => {
      fetchOutages();
    }, 15000); // refresh every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header>
        <div className="navbar">
          <div className="logo">
            <img src="/images/logo.png" alt="PLDT Logo" width="50" height="50" />
            <span>PLDT Smart Support</span>
          </div>

          <nav>
            <Link to="/">Home</Link>
            <Link to="/chat">Chat Support</Link>
            <Link to="/outage">Outage Map</Link>
            <Link to="/router">Router Setup</Link>
            <button className="auth">Sign In</button>
            <button className="auth">Register</button>
          </nav>
        </div>
      </header>

      <section className="map-section">
        <h1>Network Outage Map</h1>
        <p>Last refreshed: {lastRefresh || "Loading..."}</p>

        <div className="leaflet-map-wrapper">
          <MapContainer
            center={[14.6760, 121.0437]}
            zoom={11}
            scrollWheelZoom={true}
            className="leaflet-map"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {outages.map((item) => (
              <Marker key={item.id} position={[item.lat, item.lng]}>
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
                <strong>{item.area}</strong>
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