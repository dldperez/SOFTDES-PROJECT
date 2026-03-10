import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/styles.css";

export default function RouterPage() {
  const [currentNode, setCurrentNode] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/router")
      .then((res) => res.json())
      .then((data) => {
        setCurrentNode(data);
        setHistory([data]);
      })
      .catch((error) => console.error("Error fetching router guide:", error));
  }, []);

  const handleOptionClick = async (nextId) => {
    try {
      const res = await fetch("http://localhost:5000/api/router/decision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nextId })
      });

      const data = await res.json();
      setCurrentNode(data);
      setHistory((prev) => [...prev, data]);
    } catch (error) {
      console.error("Error loading next router step:", error);
    }
  };

  const handleRestart = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/router");
      const data = await res.json();
      setCurrentNode(data);
      setHistory([data]);
    } catch (error) {
      console.error("Error restarting guide:", error);
    }
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

      <section className="router-section">
        <h1>Cisco Router Configuration & Troubleshooting</h1>

        <div className="router-card">
          {!currentNode ? (
            <p>Loading guide...</p>
          ) : (
            <>
              <h2>{currentNode.title}</h2>
              <p>{currentNode.text}</p>

              {currentNode.commands && (
                <div className="command-block">
                  <h3>CLI Commands</h3>
                  <pre>
                    <code>{currentNode.commands.join("\n")}</code>
                  </pre>
                </div>
              )}

              {currentNode.notes && (
                <div className="router-notes">
                  <h3>Notes</h3>
                  <ul>
                    {currentNode.notes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentNode.type === "question" && currentNode.options && (
                <div className="decision-options">
                  {currentNode.options.map((option, index) => (
                    <button
                      key={index}
                      className="choice-button"
                      onClick={() => handleOptionClick(option.next)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ marginTop: "20px" }}>
                <button className="choice-button" onClick={handleRestart}>
                  Start Again
                </button>
              </div>
            </>
          )}
        </div>

        <div className="router-history">
          <h3>Guide Progress</h3>
          {history.map((step, index) => (
            <div key={index} className="history-item">
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}