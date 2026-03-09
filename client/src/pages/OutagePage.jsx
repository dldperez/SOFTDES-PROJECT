import { Link } from "react-router-dom";
import "../styles/styles.css";

export default function OutagePage() {
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
      </section>
    </>
  );
}