import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import "../wish.css";

export default function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <span className="notfound-icon">🎂</span>
        <h2>Wish not found</h2>
        <p>
          This wish doesn&apos;t exist or may have been removed.
          Double-check the link and try again.
        </p>
        <Link to="/">
          <button
            style={{
              height: "52px",
              padding: "0 28px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #ec4899, #7e22ce)",
              color: "white",
              fontFamily: "Inter, sans-serif",
              fontSize: "15px",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Sparkles size={17} /> Go Home
          </button>
        </Link>
      </div>
    </div>
  );
}
