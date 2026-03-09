import { Link } from "react-router-dom";
import { useState } from "react";
import "../styles/styles.css";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you today?" }
  ]);
  const [userInput, setUserInput] = useState("");

  const sendMessage = () => {
    if (!userInput.trim()) return;

    setMessages([
      ...messages,
      { sender: "user", text: userInput },
      {
        sender: "bot",
        text: "Thanks for your message. Support response will appear here."
      }
    ]);

    setUserInput("");
  };

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

      <section className="chat-container">
        <h1>PLDT Virtual Assistant</h1>

        <div className="chat-box">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.sender === "bot" ? "bot-message" : "user-message"}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </section>
    </>
  );
}