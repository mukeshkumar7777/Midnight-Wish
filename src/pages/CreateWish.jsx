import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { Sparkles, ArrowLeft, Copy, Check, Gift } from "lucide-react";
import "../wish.css";

const THEMES = [
  { id: "classic", icon: "🟡", name: "Classic" },
  { id: "galaxy",  icon: "🟣", name: "Galaxy"  },
  { id: "rose",    icon: "🌸", name: "Rose"    },
];

export default function CreateWish() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    recipientName: "",
    birthdayDateTime: "",
    message: "",
    theme: "classic",
  });
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState("");
  const [wishId,  setWishId]    = useState(null);
  const [copied,  setCopied]    = useState(false);

  if (!user) { navigate("/login"); return null; }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const MAX_CHARS = 300;
  const charCount = form.message.length;
  const overLimit = charCount > MAX_CHARS;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.birthdayDateTime) { setError("Please pick a birthday date & time."); return; }
    const dt = new Date(form.birthdayDateTime);
    if (isNaN(dt)) { setError("Invalid date."); return; }
    if (overLimit) { setError(`Message is too long. Max ${MAX_CHARS} characters.`); return; }

    setLoading(true);
    try {
      const ref = await addDoc(collection(db, "wishes"), {
        ownerUid:         user.uid,
        ownerName:        user.displayName || "Someone",
        recipientName:    form.recipientName.trim(),
        birthdayDateTime: Timestamp.fromDate(dt),
        message:          form.message.trim(),
        theme:            form.theme,
        createdAt:        Timestamp.now(),
      });
      setWishId(ref.id);
    } catch (err) {
      console.error(err);
      setError("Failed to create wish. Check Firestore is enabled in Firebase Console.");
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = wishId ? `${window.location.origin}/wish/${wishId}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  /* ── Success screen ──────────────────────────── */
  if (wishId) {
    return (
      <div className="create-page">
        <div className="bg-glow glow-one" />
        <div className="bg-glow glow-two" />
        <div className="create-card" style={{ textAlign: "center" }}>
          <span style={{ fontSize: 64, display: "block", marginBottom: 20 }}>🎉</span>
          <p className="share-success-title">Wish created!</p>
          <p className="share-success-sub">
            Share this link with <strong>{form.recipientName}</strong> — they&apos;ll
            see the countdown and celebration when the moment arrives.
          </p>
          <div className="share-box">
            <span className="share-url">{shareUrl}</span>
            <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={handleCopy}>
              {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy</>}
            </button>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "center" }}>
            <button
              onClick={() => { setWishId(null); setForm({ recipientName:"", birthdayDateTime:"", message:"", theme:"classic" }); }}
              className="copy-btn"
              style={{ height: 44, fontSize: 14 }}
            >
              <Gift size={15} /> Create Another
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="create-submit-btn"
              style={{ height: 44, padding: "0 22px", margin: 0, fontSize: 14 }}
            >
              <Sparkles size={15} /> Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Create form ─────────────────────────────── */
  return (
    <div className="create-page">
      <div className="bg-glow glow-one" />
      <div className="bg-glow glow-two" />

      <button className="create-back" onClick={() => navigate("/dashboard")}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="create-card">
        <p className="create-title">✨ Create a Wish</p>
        <p className="create-subtitle">
          Set the moment, write your message — share one magical link.
        </p>

        {error && (
          <div className="auth-error" style={{ marginBottom: 20 }}>{error}</div>
        )}

        <form className="create-form" onSubmit={handleSubmit}>
          {/* Recipient name */}
          <div>
            <label className="field-label" htmlFor="recipient-name">
              Their name
            </label>
            <input
              id="recipient-name"
              className="field-input"
              type="text"
              placeholder="e.g. Aria"
              value={form.recipientName}
              onChange={(e) => set("recipientName", e.target.value)}
              required
            />
          </div>

          {/* Birthday date + time */}
          <div>
            <label className="field-label" htmlFor="birthday-dt">
              Birthday date &amp; time (the reveal moment)
            </label>
            <input
              id="birthday-dt"
              className="field-input"
              type="datetime-local"
              value={form.birthdayDateTime}
              onChange={(e) => set("birthdayDateTime", e.target.value)}
              required
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Message */}
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 8 }}>
              <label className="field-label" htmlFor="wish-message" style={{ margin: 0 }}>
                Personal message
              </label>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: overLimit ? "#f87171" : charCount >= 240 ? "#fbbf24" : "rgba(255,255,255,0.35)",
                transition: "color 0.2s",
              }}>
                {charCount} / {MAX_CHARS}
              </span>
            </div>
            <textarea
              id="wish-message"
              className="field-textarea"
              placeholder="Write something heartfelt... (max 300 characters)"
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              maxLength={300}
              required
              style={overLimit ? { borderColor: "rgba(248,113,113,0.5)" } : {}}
            />
            {overLimit && (
              <p style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: "#f87171" }}>
                Too long — max {MAX_CHARS} characters.
              </p>
            )}
          </div>

          {/* Theme picker */}
          <div>
            <label className="field-label">Theme</label>
            <div className="theme-picker">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`theme-option ${form.theme === t.id ? "selected" : ""}`}
                  onClick={() => set("theme", t.id)}
                >
                  <span className="theme-icon">{t.icon}</span>
                  <span className="theme-name">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            id="create-wish-submit"
            type="submit"
            className="create-submit-btn"
            disabled={loading}
          >
            {loading
              ? <span className="spinner" />
              : <><Sparkles size={18} /> Create &amp; Get Link</>}
          </button>
        </form>
      </div>
    </div>
  );
}
