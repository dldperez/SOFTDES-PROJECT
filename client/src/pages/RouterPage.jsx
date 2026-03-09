import { Link } from "react-router-dom";
import "../styles/styles.css";

export default function RouterPage() {
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
          <h3>Step 1</h3>
          <p>Connect your router to the modem using an Ethernet cable.</p>

          <h3>Step 2</h3>
          <p>
            Open your browser and go to <b>192.168.1.1</b>.
          </p>

          <h3>Step 3</h3>
          <p>Login using your router username and password.</p>

          <h3>Step 4</h3>
          <p>Configure WiFi name and password.</p>
        </div>
      </section>
    </>
  );
}