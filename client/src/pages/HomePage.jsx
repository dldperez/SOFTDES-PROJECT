import { Link } from "react-router-dom";
import "../styles/styles.css";

export default function HomePage() {
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
            <a className="auth" href="#">Sign In</a>
            <a className="auth" href="#">Register</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <h1>Welcome to PLDT Smart Support System</h1>
        <p>
          Get instant help with your internet service. Our automated technical
          assistant provides 24/7 support, real-time outage updates, and
          step-by-step router configuration guides.
        </p>
      </section>

     <section className="features">
  <Link to="/chat" className="feature-box-link">
    <div className="feature-box">
      <h2>AI-Powered Chatbot</h2>
      <p>
        Get instant answers to common questions about your internet service,
        billing, and technical issues. Available 24/7.
      </p>
    </div>
  </Link>

  <Link to="/outage" className="feature-box-link">
    <div className="feature-box">
      <h2>Real-Time Outage</h2>
      <p>
        Check service interruptions in your area with live updates,
        estimated restoration times, and affected locations.
      </p>
    </div>
  </Link>

  <Link to="/router" className="feature-box-link">
    <div className="feature-box">
      <h2>Router Configuration Guide</h2>
      <p>
        Step-by-step instructions for setting up and configuring your PLDT
        router. Supports all major router models.
      </p>
    </div>
  </Link>
</section>
    </>
  );
}