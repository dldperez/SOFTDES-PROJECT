import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/styles.css";

export default function ChatPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [sessionId] = useState(() => {
    let savedSession = localStorage.getItem("chatSessionId");
    if (!savedSession) {
      savedSession = "session-" + Date.now();
      localStorage.setItem("chatSessionId", savedSession);
    }
    return savedSession;
  });

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! How can I help you today?",
      intent: null,
      confidence: null,
      nextAction: null,
      entities: null,
    },
  ]);

  const [userInput, setUserInput] = useState("");

  const needsLogin = (message) => {
    const text = message.toLowerCase();

    const protectedKeywords = [
      "my account",
      "account",
      "account number",
      "billing",
      "bill",
      "balance",
      "due date",
      "registered address",
      "my address",
      "my plan",
      "my subscription",
      "my service",
      "my profile",
      "my details",
      "personal info",
      "account status",
      "registered email",
      "registered mobile",
      "installation address",
    ];

    return protectedKeywords.some((keyword) => text.includes(keyword));
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const currentInput = userInput;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: currentInput,
      },
    ]);

    setUserInput("");

    if (needsLogin(currentInput) && !token) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "You can ask general support questions without logging in. For account-specific or personal information, please sign in first.",
          intent: "auth_required",
          confidence: 1,
          nextAction: "login",
          entities: {},
        },
      ]);
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: currentInput,
          sessionId,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply,
          intent: data.intent,
          confidence: data.confidence,
          nextAction: data.nextAction,
          entities: data.entities,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "There was an error contacting the server.",
          intent: "error",
          confidence: 0,
          nextAction: "none",
          entities: {},
        },
      ]);
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleNextAction = (action) => {
    if (action === "outage") {
      navigate("/outage");
    } else if (action === "router") {
      navigate("/router");
    } else if (action === "login") {
      navigate("/login");
    } else if (action === "signup") {
      navigate("/signup");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/chat");
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

      <section className="chat-container">
        <h1>PLDT Virtual Assistant</h1>
        <p className="chat-subtitle">
          Ask general questions anytime. Login is only needed for
          account-specific concerns.
        </p>

        <div className="chat-box">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.sender === "bot" ? "bot-message" : "user-message"}
            >
              <p>{msg.text}</p>

              {msg.sender === "bot" &&
                (msg.nextAction === "outage" ||
                  msg.nextAction === "router" ||
                  msg.nextAction === "login" ||
                  msg.nextAction === "signup") && (
                  <div style={{ marginTop: "10px" }}>
                    <button
                      className="action-button"
                      onClick={() => handleNextAction(msg.nextAction)}
                    >
                      {msg.nextAction === "outage" && "Open Outage Map"}
                      {msg.nextAction === "router" && "Open Router Setup"}
                      {msg.nextAction === "login" && "Go to Login"}
                      {msg.nextAction === "signup" && "Create Account"}
                    </button>
                  </div>
                )}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </section>
    </>
  );
}