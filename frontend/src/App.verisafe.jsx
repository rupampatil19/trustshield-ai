import { useState } from "react";
import "./App.css";

const sections = [
  { id: "media", icon: "◈", name: "Media Scan", description: "Check images and videos" },
  { id: "cyber", icon: "⌁", name: "Cyber Scan", description: "Check suspicious links and messages" },
  { id: "trust", icon: "◇", name: "Trust Checks", description: "Inspect integrity and provenance" },
  { id: "history", icon: "◷", name: "Scan History", description: "Review previous scans" },
];

function App() {
  const [active, setActive] = useState("media");
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");

  function handleFile(event) {
    setFile(event.target.files?.[0] || null);
    setNotice("");
  }

  function handleDemo() {
    setNotice(
      "Interface preview only. Detection is not connected yet, so no authenticity verdict has been produced."
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">T</div>
          <div>
            <h2>TrustShield</h2>
            <span>AI • DIGITAL TRUST</span>
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
                setNotice("");
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
          <small>Local development preview</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>Trust & Safety Workspace</span>
          <span className="preview-badge">DEVELOPMENT PREVIEW</span>
        </header>

        <section className="welcome">
          <p className="eyebrow">RESPONSIBLE AI · CYBER RESILIENCE</p>
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
                setNotice("");
              }}
            >
              <span className="card-icon">{section.icon}</span>
              <strong>{section.name}</strong>
              <span className="card-description">{section.description}</span>
              <span className="card-arrow">↗</span>
            </button>
          ))}
        </section>

        <section className="work-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">WORKSPACE / {active.toUpperCase()}</p>
              <h2>{sections.find((item) => item.id === active)?.name}</h2>
            </div>
            <span className="mock-label">DETECTION NOT CONNECTED</span>
          </div>

          {active === "media" && (
            <div className="scan-form">
              <label className="upload-area">
                <span className="upload-icon">↑</span>
                <strong>{file ? file.name : "Choose an image or video"}</strong>
                <span>Use a local file to preview the upload interface.</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFile}
                />
              </label>
              <button className="primary-button" onClick={handleDemo}>
                Preview scan workflow
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
              <button className="primary-button" onClick={handleDemo}>
                Preview scan workflow
              </button>
            </div>
          )}

          {active === "trust" && (
            <div className="info-panel">
              <strong>Digital evidence checks</strong>
              <p>
                The planned module will examine file hashes and available
                content provenance credentials. These checks are not connected
                yet.
              </p>
              <button className="primary-button" onClick={handleDemo}>
                Preview trust workflow
              </button>
            </div>
          )}

          {active === "history" && (
            <div className="info-panel">
              <strong>No scan records yet</strong>
              <p>
                Scan history will appear here once the history API and database
                are connected.
              </p>
            </div>
          )}

          {notice && <div className="notice" role="status">{notice}</div>}
        </section>

        <footer>
          TrustShield AI · Prototype interface · Results require validated
          detection services.
        </footer>
      </main>
    </div>
  );
}

export default App;