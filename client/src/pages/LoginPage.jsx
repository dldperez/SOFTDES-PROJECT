import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/styles.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.username || !formData.password) {
      setMessage("Please enter your username and password.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (error) {
      setMessage("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="simple-auth-page">
      <div className="simple-auth-card">
        <div className="simple-auth-top">
          <span className="brand-badge">PLDT Smart Support</span>
          <div className="simple-top-actions">
            <Link to="/" className="simple-auth-link secondary-link">
              Home
            </Link>
            <Link to="/signup" className="simple-auth-link">
              Sign Up
            </Link>
          </div>
        </div>

        <div className="simple-auth-header">
          <h1>Welcome back</h1>
          <p>Log in to continue to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="simple-auth-form">
          <div className="simple-field-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="simple-field-group">
            <label>Password</label>
            <div className="simple-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="simple-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="simple-login-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </button>

          {message && <p className="simple-form-message">{message}</p>}
        </form>

        <div className="simple-auth-footer">
          <p>Do not want to log in yet?</p>
          <Link to="/" className="simple-outline-btn">
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}