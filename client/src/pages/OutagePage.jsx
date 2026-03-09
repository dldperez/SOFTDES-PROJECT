import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/styles.css";

export default function OutagePage() {
  const [outages, setOutages] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/outages")
      .then((res) => res.json())
      .then((data) => setOutages(data))
      .catch((error) => console.error("Error fetching outages:", error));
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
        <h1>Network Coverage Map</h1>

        <iframe
          src="https://maps.google.com/maps?q=manila&t=&z=13&ie=UTF8&iwloc=&output=embed"
          width="80%"
          height="450"
          style={{ border: 0 }}
          title="Network Coverage Map"
          loading="lazy"
        ></iframe>

        <div style={{ marginTop: "30px" }}>
          <h2>Current Outage Updates</h2>

          {outages.length === 0 ? (
            <p>No outage data available.</p>
          ) : (
            outages.map((item) => (
              <div
                key={item.id}
                className="router-card"
                style={{ marginBottom: "15px" }}
              >
                <h3>{item.area}</h3>
                <p>Status: {item.status}</p>
                <p>Estimated Restoration: {item.estimatedRestoration}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}