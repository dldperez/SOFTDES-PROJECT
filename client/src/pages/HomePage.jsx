import { Link, useNavigate } from "react-router-dom";
import "../styles/styles.css";

export default function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
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
                <Link className="auth" to="/login">Sign In</Link>
                <Link className="auth" to="/signup">Register</Link>
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

      <section className="hero public-hero">
        <div className="hero-content">
          <h1>PLDT Smart Support System</h1>
          <p>
            Ask general questions anytime, check outage updates, and access
            router setup guidance. Login is only needed for account-specific concerns.
          </p>

          <div className="hero-actions">
            <Link to="/chat" className="btn-signup">
              Start Chatting
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <Link to="/chat" className="feature-box-link">
          <div className="feature-box">
            <h2>AI-Powered Chatbot</h2>
            <p>
              Ask support questions anytime. General assistance is available even without login.
            </p>
          </div>
        </Link>

        <Link to="/outage" className="feature-box-link">
          <div className="feature-box">
            <h2>Real-Time Outage Map</h2>
            <p>
              View service interruption updates and affected locations in your area.
            </p>
          </div>
        </Link>

        <Link to="/router" className="feature-box-link">
          <div className="feature-box">
            <h2>Router Setup Guide</h2>
            <p>
              Follow step-by-step instructions for router troubleshooting and Wi-Fi setup.
            </p>
          </div>
        </Link>
      </section>
    </>
  );
}