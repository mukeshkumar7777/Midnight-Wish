import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Sparkles } from "lucide-react";
import NotFound from "./NotFound";
import "../wish.css";

/* ── Confetti colours per theme ─────────────────── */
const CONFETTI_COLORS = {
  classic: ["#facc15","#f59e0b","#ec4899","#f9a8d4","#ffffff","#fbbf24"],
  galaxy:  ["#818cf8","#6366f1","#22d3ee","#a78bfa","#ffffff","#38bdf8"],
  rose:    ["#fb7185","#f43f5e","#e879f9","#fda4af","#ffffff","#f9a8d4"],
};

function pad(n) { return String(n).padStart(2, "0"); }

function getTimeLeft(target) {
  const diff = target - Date.now();
  if (diff <= 0) return null;
  const totalSec = Math.floor(diff / 1000);
  return {
    days:    Math.floor(totalSec / 86400),
    hours:   Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600)  / 60),
    seconds: totalSec % 60,
  };
}

function Confetti({ theme }) {
  const pieces = useRef(
    Array.from({ length: 75 }, (_, i) => {
      const colors = CONFETTI_COLORS[theme] || CONFETTI_COLORS.classic;
      return {
        id:       i,
        x:        Math.random() * 100,
        color:    colors[i % colors.length],
        size:     6 + Math.random() * 9,
        delay:    Math.random() * 2.5,
        duration: 2.5 + Math.random() * 2.5,
        sway:     (Math.random() - 0.5) * 120,
        circle:   Math.random() > 0.55,
      };
    })
  ).current;

  return (
    <div className="confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className={`confetti-piece ${p.circle ? "circle" : ""}`}
          style={{
            left:            `${p.x}%`,
            width:           p.size,
            height:          p.size,
            background:      p.color,
            animationDelay:  `${p.delay}s`,
            animationDuration:`${p.duration}s`,
            "--sway":        `${p.sway}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function WishView() {
  const { id } = useParams();

  const [wish,        setWish]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);
  const [timeLeft,    setTimeLeft]    = useState(null);
  const [cakeOpen,    setCakeOpen]    = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  /* ── Fetch wish ──────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "wishes", id));
        if (!snap.exists()) { setNotFound(true); setLoading(false); return; }
        const data = snap.data();
        setWish(data);
        const target = data.birthdayDateTime.toDate().getTime();
        const initial = getTimeLeft(target);
        if (!initial) {
          // already past — go straight to celebration
          setCakeOpen(true);
          setTimeout(() => setCelebrating(true), 1200);
        } else {
          setTimeLeft(initial);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ── Live countdown tick ─────────────────────── */
  useEffect(() => {
    if (!wish || celebrating || cakeOpen) return;
    const target = wish.birthdayDateTime.toDate().getTime();
    const timer = setInterval(() => {
      const tl = getTimeLeft(target);
      if (!tl) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setCakeOpen(true);
        setTimeout(() => setCelebrating(true), 1400);
        return;
      }
      setTimeLeft(tl);
    }, 1000);
    return () => clearInterval(timer);
  }, [wish, celebrating, cakeOpen]);

  /* ── Guards ──────────────────────────────────── */
  if (loading)  return <div className="wish-loading"><div className="big-spinner" /></div>;
  if (notFound) return <NotFound />;

  const theme = wish.theme || "classic";

  /* ── Celebration screen ──────────────────────── */
  if (celebrating) {
    return (
      <div className={`wish-page theme-${theme}`}>
        <Confetti theme={theme} />
        <div className="celebration-screen">
          <div className="celeb-card">
            <span className="celeb-emoji">🎂</span>
            <p className="celeb-hb">Happy Birthday,</p>
            <p className="celeb-name">{wish.recipientName}! 🎉</p>
            <div className="celeb-divider" />
            <p className="celeb-message">{wish.message}</p>
            <p className="celeb-from">— with love from {wish.ownerName} ✨</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Countdown screen ────────────────────────── */
  const tl = timeLeft || { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const units = [
    { value: pad(tl.days),    label: "DAYS"    },
    { value: pad(tl.hours),   label: "HOURS"   },
    { value: pad(tl.minutes), label: "MINS"    },
    { value: pad(tl.seconds), label: "SECS"    },
  ];

  return (
    <div className={`wish-page theme-${theme}`}>
      {/* Nav logo */}
      <Link
        to="/"
        style={{
          position: "absolute", top: 28, left: 32, display: "flex",
          alignItems: "center", gap: 10, textDecoration: "none", color: "white",
          fontWeight: 800, fontSize: 17,
        }}
      >
        <div className="logo-icon" style={{ width: 36, height: 36 }}>
          <Sparkles size={17} />
        </div>
        Midnight<span style={{ background: "linear-gradient(135deg,#facc15,#ec4899)", WebkitBackgroundClip: "text", color: "transparent" }}>Wish</span>
      </Link>

      {/* Recipient header */}
      <p className="wish-label">Countdown to</p>
      <h1 className="wish-name">{wish.recipientName}&apos;s Birthday</h1>
      <p className="wish-subtitle">The magic begins soon ✨</p>

      {/* Cake scene */}
      <div className="cake-scene">
        {/* Candles */}
        <div className={`candles-row ${cakeOpen ? "blown" : ""}`}>
          {[0,1,2].map((i) => (
            <div key={i} className="candle">
              <div className="flame" style={{ animationDelay: `${i * 0.15}s` }} />
            </div>
          ))}
        </div>

        {/* Lid (top tier) */}
        <div className={`cake-lid ${cakeOpen ? "open" : ""}`}>
          <div className="cake-tier-top" />
        </div>

        {/* Frosting drips */}
        <div className="cake-frosting">
          {[0,1,2,3,4].map((i) => <div key={i} className="drip" />)}
        </div>

        {/* Bottom tier */}
        <div className="cake-tier-bottom" />

        {/* Plate */}
        <div className="cake-plate" />

        {/* Glow */}
        <div className="cake-glow" />
      </div>

      {/* Countdown grid */}
      <div className="wish-countdown-grid">
        {units.map(({ value, label }) => (
          <div key={label} className="wish-time-box">
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Footer attribution */}
      <p style={{ marginTop: 48, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>
        Made with ✨ MidnightWish
      </p>
    </div>
  );
}
