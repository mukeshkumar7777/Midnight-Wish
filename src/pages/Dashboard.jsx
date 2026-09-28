import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection, query, where, orderBy, getDocs,
  deleteDoc, doc,
} from "firebase/firestore";
import { Sparkles, LogOut, Plus, Copy, Check, Trash2, Home, ExternalLink } from "lucide-react";
import "../wish.css";

function toMillis(ts) {
  if (!ts) return 0;
  if (typeof ts.toDate === "function") return ts.toDate().getTime();
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (ts.seconds) return ts.seconds * 1000;
  if (ts instanceof Date) return ts.getTime();
  const parsed = new Date(ts).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

function formatDate(ts) {
  const ms = toMillis(ts);
  if (!ms) return "";
  const d = new Date(ms);
  return d.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" });
}

function isUpcoming(ts) {
  const ms = toMillis(ts);
  return ms > Date.now();
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();

  const [wishes,  setWishes]  = useState([]);
  const [fetching,setFetching]= useState(true);
  const [copied,  setCopied]  = useState(null); // wish id being copied

  /* Fetch user's wishes */
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        console.log(`[MidnightWish] Fetching dashboard wishes for user UID: "${user.uid}"`);
        const q = query(
          collection(db, "wishes"),
          where("ownerUid", "==", user.uid)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        console.log(`[MidnightWish] Found ${list.length} wishes for user:`, list);
        list.sort((a, b) => {
          const tA = toMillis(a.createdAt);
          const tB = toMillis(b.createdAt);
          return tB - tA;
        });
        setWishes(list);
      } catch (err) {
        console.error("[MidnightWish] Error loading user wishes:", err);
      } finally {
        setFetching(false);
      }
    })();
  }, [user]);

  const handleLogout = async () => { await logout(); navigate("/"); };

  const handleCopy = (wishId) => {
    const url = `${window.location.origin}/wish/${wishId}`;
    navigator.clipboard.writeText(url);
    setCopied(wishId);
    setTimeout(() => setCopied(null), 2500);
  };

  const handleDelete = async (wishId) => {
    if (!window.confirm("Delete this wish?")) return;
    await deleteDoc(doc(db, "wishes", wishId));
    setWishes((prev) => prev.filter((w) => w.id !== wishId));
  };

  return (
    <div className="app">
      <div className="bg-glow glow-one" />
      <div className="bg-glow glow-two" />

      {/* Navbar */}
      <nav className="navbar">
        <Link to="/" className="logo" style={{ textDecoration: "none" }}>
          <div className="logo-icon"><Sparkles size={20} /></div>
          <h2>Midnight<span>Wish</span></h2>
        </Link>
        <div className="nav-actions">
          <span className="nav-greeting">Hi, {user?.displayName} 👋</span>
          <Link
            to="/"
            className="signin-btn"
            style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}
          >
            <Home size={15} /> Home
          </Link>
          <button
            onClick={handleLogout}
            className="signin-btn"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </nav>

      {/* Header */}
      <section style={{ position:"relative", zIndex:2, padding:"60px 48px 0", textAlign:"center" }}>
        <div className="badge" style={{ margin:"0 auto 24px" }}>
          <Sparkles size={16} /><span>Your wishes</span>
        </div>
        <h1 style={{ fontSize:"clamp(36px,5vw,58px)", fontWeight:900, letterSpacing:"-2px", marginBottom:16 }}>
          Welcome,{" "}
          <span style={{ background:"linear-gradient(135deg,#facc15,#f9a8d4,#c084fc)", WebkitBackgroundClip:"text", color:"transparent" }}>
            {user?.displayName}
          </span>{" "}
          ✨
        </h1>
        <p style={{ color:"#aaa6b8", fontSize:17, fontWeight:600, marginBottom:36 }}>
          Create magical birthday countdowns and share them with the people you love.
        </p>
        <button
          className="primary-btn"
          style={{ margin:"0 auto" }}
          onClick={() => navigate("/create")}
        >
          <Plus size={20} /> Create a Wish
        </button>
      </section>

      {/* Wish list */}
      <section style={{ position:"relative", zIndex:2, padding:"0 48px 80px" }}>
        {fetching ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div className="big-spinner" style={{ margin:"0 auto" }} />
          </div>
        ) : wishes.length === 0 ? (
          <div className="empty-wishes">
            No wishes yet. Create your first magical countdown! 🎂
          </div>
        ) : (
          <div className="wish-list">
            {wishes.map((w) => (
              <div key={w.id} className="wish-list-item">
                <div className="wish-list-info">
                  <p className="wish-list-name">🎂 {w.recipientName}</p>
                  <p className="wish-list-date">
                    {formatDate(w.birthdayDateTime)}{" "}
                    <span style={{
                      marginLeft: 8,
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 800,
                      background: isUpcoming(w.birthdayDateTime)
                        ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.07)",
                      color: isUpcoming(w.birthdayDateTime) ? "#10b981" : "#7e6fa0",
                      border: `1px solid ${isUpcoming(w.birthdayDateTime) ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`,
                    }}>
                      {isUpcoming(w.birthdayDateTime) ? "Upcoming" : "Celebrated"}
                    </span>
                  </p>
                </div>

                <Link
                  to={`/wish/${w.id}`}
                  className="wish-copy-btn"
                  style={{ textDecoration: "none" }}
                  title="View wish countdown"
                >
                  <ExternalLink size={14} /> View
                </Link>

                <button
                  className={`wish-copy-btn ${copied === w.id ? "copied" : ""}`}
                  onClick={() => handleCopy(w.id)}
                >
                  {copied === w.id
                    ? <><Check size={14} /> Copied!</>
                    : <><Copy size={14} /> Copy Link</>}
                </button>

                <button
                  className="wish-delete-btn"
                  onClick={() => handleDelete(w.id)}
                  title="Delete wish"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
