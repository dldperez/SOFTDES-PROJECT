import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/styles.css";

export default function RouterPage() {
  const [guides, setGuides] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/router")
      .then((res) => res.json())
      .then((data) => setGuides(data))
      .catch((error) => console.error("Error fetching router guide:", error));
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

      <section className="router-section">
        <h1>Router Configuration Guide</h1>

        <div className="router-card">
          {guides.length === 0 ? (
            <p>No router guide data available.</p>
          ) : (
            guides.map((item) => (
              <div key={item.step} style={{ marginBottom: "20px" }}>
                <h3>Step {item.step}</h3>
                <p>{item.instruction}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}