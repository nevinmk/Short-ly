import { useState, useEffect } from "react";
import "./App.css";

// Point at the Express API running on port 3000
const API_URL = "http://localhost";

function LinkIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 17H7A5 5 0 0 1 7 7h2" />
      <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function CheckIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.5l2.5 2.5 5-5" />
    </svg>
  );
}

function CopyIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
    </svg>
  );
}

function ChartIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="6" />
    </svg>
  );
}

function StackIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="4" y="4" width="16" height="4" rx="1" />
      <rect x="4" y="10" width="16" height="4" rx="1" />
      <rect x="4" y="16" width="16" height="4" rx="1" />
    </svg>
  );
}

function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [code, setCode] = useState("");
  const [stats, setStats] = useState({ hits: 0, misses: 0 });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Poll the stats endpoint every second
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/stats`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleShorten = async (e) => {
    e.preventDefault();
    setError("");
    setCopied(false);
    try {
      const res = await fetch(`${API_URL}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.shortUrl) {
        setShortUrl(data.shortUrl);
        setCode(data.code);
      } else {
        setError("Error shortening URL");
      }
    } catch (err) {
      setError("Error shortening URL");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy");
    }
  };

  const hitRate =
    stats.hits + stats.misses > 0
      ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="page">
      <header className="brand">
        <h1>
          <LinkIcon className="brand-icon" />
          Short-ly
        </h1>
        <p className="subtitle">URL Shortener</p>
      </header>

      <section className="card">
        <form className="shorten-form" onSubmit={handleShorten}>
          <div className="input-wrap">
            <LinkIcon className="input-icon" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example.com"
              required
            />
          </div>
          <button type="submit" className="shorten-btn">
            Shorten
          </button>
        </form>

        {error && <p className="error-alert">{error}</p>}

        {code && (
          <div className="success-alert">
            <CheckIcon />
            <span>
              Shortened! Code: <strong>{code}</strong>
            </span>
          </div>
        )}

        {shortUrl && (
          <div className="short-url-row">
            <LinkIcon className="row-icon" />
            <span className="row-label">Short URL:</span>
            <a href={shortUrl} target="_blank" rel="noreferrer">
              {shortUrl}
            </a>
            <button
              type="button"
              className="copy-btn"
              onClick={handleCopy}
              title="Copy to clipboard"
              aria-label="Copy short URL"
            >
              <CopyIcon />
            </button>
            {copied && <span className="copied-tag">Copied!</span>}
          </div>
        )}
      </section>

      <div className="divider" />

      <section className="card stats-card">
        <h2 className="stats-title">
          <ChartIcon />
          Cache Stats (Live)
        </h2>
        <div className="stats-grid">
          <div className="stat">
            <div className="stat-value stat-hits">{stats.hits}</div>
            <div className="stat-label">Cache Hits</div>
          </div>
          <div className="stat">
            <div className="stat-value stat-misses">{stats.misses}</div>
            <div className="stat-label">Cache Misses</div>
          </div>
          <div className="stat">
            <div className="stat-value stat-rate">{hitRate}%</div>
            <div className="stat-label">Hit Rate</div>
          </div>
        </div>
        {stats.instance && (
          <div className="instance-footer">
            <StackIcon />
            <span>Last responding instance: {stats.instance}</span>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
