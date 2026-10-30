import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./App.verisafe.css";

const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const sections = [
  { id: "media", icon: "◈", name: "Media Scan", description: "Check images and videos" },
  { id: "cyber", icon: "Ⱏ", name: "Cyber Scan", description: "Check suspicious links and messages" },
  { id: "trust", icon: "◇", name: "Trust Checks", description: "Inspect integrity and provenance" },
  { id: "history", icon: "◯", name: "Scan History", description: "Review previous scans" },
];

function App() {
  const [active, setActive] = useState("media");
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function handleFile(event) {
    setFile(event.target.files?.[0] || null);
    setResult(null);
  }

  async function handleScan() {
    setLoading(true);
    setResult(null);
    try {
      if (active === "media") {
        if (!file) return alert("Select a file first.");
        const fd = new FormData();
        fd.append("file", file);
        const res = await axios.post(`${API_ORIGIN}/api/legacy/api/v1/media/scans`, fd);
        setResult(res.data);
      } else if (active === "cyber") {
        if (url) {
          const res = await axios.post(`${API_ORIGIN}/api/legacy/api/v1/cyber/url-scans`, { url });
          setResult(res.data);
        } else if (message) {
          const res = await axios.post(`${API_ORIGIN}/api/legacy/api/v1/cyber/message-scans`, { message });
          setResult(res.data);
        } else {
          alert("Enter a URL or a message.");
        }
      } else if (active === "history") {
        const res = await axios.get(`${API_ORIGIN}/api/legacy/api/v1/scans`);
        setResult(res.data);
      } else if (active === "trust") {
        setResult({ message: "The Trust Checks module was a UI preview in the original VeriSafe repository and was not connected to a backend endpoint." });
      }
    } catch (err) {
      setResult({ error: err.response?.data?.detail || err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <div style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 9999 }}>
        <Link to="/" style={{ background: "#3b82f6", color: "white", padding: "0.5rem 1rem", borderRadius: "0.5rem", textDecoration: "none", fontWeight: "bold", fontSize: "0.875rem", boxShadow: "0 4px 6px rgba(0,0,0,0.3)" }}>
          &larr; Back to Unified App
        </Link>
      </div>

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">T</div>
          <div>
            <h2>TrustShield</h2>
            <span>AI â€¢ DIGITAL TRUST</span>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav>
          {sections.map((section) => (
            <button
              key={section.id}
              className={`nav-item ${active === section.id ? "active" : ""}`}
              onClick={() => {
                setActive(section.id);
                setResult(null);
              }}
            >
              <span className="nav-icon">{section.icon}</span>
              <span>{section.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          Backend configured
          <small>Legacy UI Mode</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>Trust & Safety Workspace</span>
          <span className="preview-badge">LEGACY INTEGRATION</span>
        </header>

        <section className="welcome">
          <p className="eyebrow">RESPONSIBLE AI Â· CYBER RESILIENCE</p>
          <h1>Trust what you see.<br /><span>Verify what you share.</span></h1>
          <p className="subtitle">
            Examine digital media, investigate suspicious content, and review
            available trust evidence in one workspace.
          </p>
        </section>

        <section className="module-grid">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`module-card ${active === section.id ? "selected" : ""}`}
              onClick={() => {
                setActive(section.id);
                setResult(null);
              }}
            >
              <span className="card-icon">{section.icon}</span>
              <strong>{section.name}</strong>
              <span className="card-description">{section.description}</span>
              <span className="card-arrow">â†—</span>
            </button>
          ))}
        </section>

        <section className="work-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">WORKSPACE / {active.toUpperCase()}</p>
              <h2>{sections.find((item) => item.id === active)?.name}</h2>
            </div>
            <span className="mock-label" style={{ color: "#10b981", borderColor: "#10b981" }}>
              LIVE BACKEND CONNECTED
            </span>
          </div>

          {active === "media" && (
            <div className="scan-form">
              <label className="upload-area">
                <span className="upload-icon">â†‘</span>
                <strong>{file ? file.name : "Choose an image or video"}</strong>
                <span>Use a local file to preview the upload interface.</span>
                <input type="file" accept="image/*,video/*" onChange={handleFile} />
              </label>
              <button className="primary-button" onClick={handleScan} disabled={loading}>
                {loading ? "Processing..." : "Run Media Scan"}
              </button>
            </div>
          )}

          {active === "cyber" && (
            <div className="scan-form">
              <label htmlFor="url">Website URL</label>
              <input
                id="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com"
              />
              <label htmlFor="message">Suspicious message (optional)</label>
              <textarea
                id="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Paste a suspicious message here"
                rows={4}
              />
              <button className="primary-button" onClick={handleScan} disabled={loading}>
                {loading ? "Processing..." : "Run Cyber Scan"}
              </button>
            </div>
          )}

          {active === "trust" && (
            <div className="info-panel">
              <strong>Digital evidence checks</strong>
              <p>
                This module was a UI preview in the original VeriSafe repository.
              </p>
              <button className="primary-button" onClick={handleScan} disabled={loading}>
                Check Trust Status
              </button>
            </div>
          )}

          {active === "history" && (
            <div className="info-panel">
              <strong>Scan History API</strong>
              <p>Fetch records from the mounted VeriSafe database.</p>
              <button className="primary-button" onClick={handleScan} disabled={loading}>
                Fetch History
              </button>
            </div>
          )}

          {result && (
            <div className="info-panel" style={{ marginTop: "2rem", overflowX: "auto" }}>
              <strong>Backend Response:</strong>
              <pre style={{ background: "#0f172a", padding: "1rem", borderRadius: "0.5rem", fontSize: "0.875rem", color: "#38bdf8", marginTop: "1rem" }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </section>

        <footer>
          TrustShield AI Â· Legacy UI Integration Â· Results require validated detection services.
        </footer>
      </main>
    </div>
  );
}

export default App;