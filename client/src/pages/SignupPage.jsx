import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/styles.css";

export default function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    surname: "",
    firstName: "",
    middleInitial: "",
    email: "",
    mobileNumber: "",
    accountNumber: "",
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

    if (
      !formData.surname ||
      !formData.firstName ||
      !formData.email ||
      !formData.mobileNumber ||
      !formData.accountNumber ||
      !formData.username ||
      !formData.password
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Signup failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/login");
    } catch (error) {
      setMessage("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="simple-auth-page">
      <div className="simple-auth-card signup-card">
        <div className="simple-auth-top">
          <span className="brand-badge">PLDT Smart Support</span>
          <Link to="/login" className="simple-auth-link">
            Log In
          </Link>
        </div>

        <div className="simple-auth-header">
          <h1>Create your account</h1>
          <p>Sign up to manage your PLDT support portal access</p>
        </div>

        <form onSubmit={handleSubmit} className="simple-auth-form">
          <div className="simple-name-row">
            <div className="simple-field-group">
              <label>Surname</label>
              <input
                type="text"
                name="surname"
                placeholder="Surname"
                value={formData.surname}
                onChange={handleChange}
              />
            </div>

            <div className="simple-field-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="simple-field-group">
              <label>M.I.</label>
              <input
                type="text"
                name="middleInitial"
                placeholder="M.I."
                value={formData.middleInitial}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="simple-field-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="simple-field-group">
            <label>Mobile Number</label>
            <input
              type="text"
              name="mobileNumber"
              placeholder="Enter your mobile number"
              value={formData.mobileNumber}
              onChange={handleChange}
            />
          </div>

          <div className="simple-field-group">
            <label>PLDT Account Number</label>
            <input
              type="text"
              name="accountNumber"
              placeholder="Enter your PLDT account number"
              value={formData.accountNumber}
              onChange={handleChange}
            />
          </div>

          <div className="simple-field-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Create a username"
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
                placeholder="Create a password"
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

          <button type="submit" className="simple-signup-btn" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>

          {message && <p className="simple-form-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}