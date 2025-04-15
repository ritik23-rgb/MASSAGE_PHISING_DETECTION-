import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const phishingKeywords = [
  "urgent", "click here", "verify", "OTP", "login", "bank",
  "account", "password", "update", "alert", "free", "win"
];

const highlightPhishingWords = (text) => {
  const regex = new RegExp(`\\b(${phishingKeywords.join("|")})\\b`, "gi");
  return text.split(regex).map((part, index) =>
    phishingKeywords.includes(part.toLowerCase()) ? (
      <mark key={index} className="highlight">{part}</mark>
    ) : part
  );
};

function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("scanHistory")) || []);
  const [feedback, setFeedback] = useState(null);

  const analyzeMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/analyze", { message });
      if (response.data && response.data.status) {
        setResult(response.data.status);
        setNote(response.data.note || "");

        const newEntry = {
          text: message,
          result: response.data.status,
          note: response.data.note,
          timestamp: new Date().toLocaleString(),
        };

        const updatedHistory = [newEntry, ...history];
        setHistory(updatedHistory);
        localStorage.setItem("scanHistory", JSON.stringify(updatedHistory));
      } else {
        alert("⚠️ Unexpected response from server.");
      }
    } catch (err) {
      console.error("Error analyzing:", err);
      alert("❌ Failed to connect to backend.");
    }

    setLoading(false);
  };

  const getEmoji = (status) => {
    switch (status) {
      case "Safe": return "✅";
      case "Suspicious": return "⚠️";
      case "Malicious": return "❌";
      default: return "❓";
    }
  };

  const resetScan = () => {
    setMessage("");
    setResult(null);
    setNote("");
    setFeedback(null);
  };

  const sendFeedback = async (isCorrect) => {
    setFeedback(isCorrect ? "Thanks for confirming!" : "Thanks! We’ll improve.");
    try {
      await fetch("http://127.0.0.1:5000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          predicted: result,
          correct: isCorrect,
        }),
      });
    } catch (err) {
      console.error("Feedback error:", err);
      alert("⚠️ Failed to send feedback.");
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("scanHistory");
  };

  return (
    <div className="app-container horizontal-layout">
      <div className="left-panel">
        <div className="header">
          <h1 className="logo">CyberSentinel 🔐</h1>
          <div className="server-status">🟢 Connected</div>
        </div>

        <div className="main-content">
          {!result && (
            <>
              <textarea
                placeholder="Paste your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="6"
              />
              <div className="button-group">
                <button onClick={analyzeMessage} disabled={loading}>
                  {loading ? "Analyzing..." : "Analyze"}
                </button>
                <button onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    setMessage(text);
                  } catch (err) {
                    console.error("Clipboard error:", err);
                    alert("⚠️ Unable to read clipboard.");
                  }
                }}>
                  📋 Paste
                </button>
              </div>
            </>
          )}

          {result && (
            <div className="result-box">
              <div>
                <span className="status-emoji">{getEmoji(result)}</span>
                <span className={result.toLowerCase()}><strong>Status:</strong> {result}</span>
              </div>
              {note && <p><strong>Note:</strong> {note}</p>}
              <div className="highlighted-message">
                <p><strong>Highlighted Message:</strong></p>
                <p>{highlightPhishingWords(message)}</p>
              </div>
              <div className="feedback">
                <p>Was this result correct?</p>
                <button onClick={() => sendFeedback(true)} className="feedback-yes">✅ Yes</button>
                <button onClick={() => sendFeedback(false)} className="feedback-no">❌ No</button>
                {feedback && <p>{feedback}</p>}
              </div>
              <button className="scan-again-btn" onClick={resetScan}>🔄 Scan Another Message</button>
            </div>
          )}

          {history.length > 0 && (
            <div className="history-list">
              <div className="history-header">
                <h3>Scan History</h3>
                <button onClick={clearHistory} className="clear-btn">Clear</button>
              </div>
              <ul>
                {history.map((item, index) => (
                  <li key={index}>
                    <p><strong>Message:</strong> {highlightPhishingWords(item.text)}</p>
                    <p><strong>Result:</strong> {item.result}</p>
                    <p className="timestamp">{item.timestamp}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="right-panel">
        <h2>Stay Safe Online!</h2>
        <p>Cyber criminals often trick users with links or texts that look real but are dangerous.</p>
        <ul>
          <li>🚫 Don’t click on unknown links.</li>
          <li>🔐 Don’t share OTPs or passwords.</li>
          <li>🔍 Check for strange spellings or urgency.</li>
          <li>🛡 Use CyberSentinel to analyze suspicious content.</li>
        </ul>
        <p><strong>Protect your data. Stay vigilant. 🚀</strong></p>

        {/* Premium Section */}
        <div className="premium-box">
          <h3>🔒 Premium Protection</h3>
          <p className="price-tag">₹8000 / month</p>
          <ul className="premium-features">
            <li>🔍 Advanced Threat Analysis</li>
            <li>🧠 AI-Powered Contextual Scanning</li>
            <li>📊 Detailed Risk Reports</li>
            <li>☁️ Cloud History Storage</li>
            <li>🚨 Real-time Scam Alerts</li>
            <li>📥 Export Reports as PDF</li>
            <li>📞 Priority Support</li>
          </ul> 
          <button className="subscribe-btn">Subscribe Now</button>
        </div>

        {/* 🔽 Image Section */}
        <div className="illustration-container">
          <img
            src="https://www.w3schools.com/w3images/fjords.jpg"  // Test image URL
            alt="Security illustration"
            className="illustration-img"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
