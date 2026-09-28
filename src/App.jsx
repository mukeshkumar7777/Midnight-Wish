import { Routes, Route, useNavigate, Navigate, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles, Gift, Heart, Cake, LinkIcon, CalendarHeart,
  ArrowRight, Check, Star, Zap, Share2, Clock,
} from "lucide-react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateWish from "./pages/CreateWish";
import WishView from "./pages/WishView";
import NotFound from "./pages/NotFound";
import { useAuth } from "./context/AuthContext";

/* ── Protected Route ─────────────────────────────── */
function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

/* ── Live demo countdown (ticks every second) ─────── */
function useDemoCountdown() {
  const target = useRef(Date.now() + 7 * 24 * 60 * 60 * 1000).current;
  const [t, setT] = useState(() => calcLeft(target));
  useEffect(() => {
    const id = setInterval(() => setT(calcLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}
function calcLeft(target) {
  const diff = Math.max(0, target - Date.now());
  const s = Math.floor(diff / 1000);
  return {
    d: String(Math.floor(s / 86400)).padStart(2, "0"),
    h: String(Math.floor((s % 86400) / 3600)).padStart(2, "0"),
    m: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    s: String(s % 60).padStart(2, "0"),
  };
}

/* ── Scroll reveal hook ──────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ── Navbar ──────────────────────────────────────── */
function Navbar({ scrolled }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
      <Link to="/" className="logo" style={{ textDecoration: "none" }}>
        <div className="logo-icon"><Sparkles size={20} /></div>
        <h2>Midnight<span>Wish</span></h2>
      </Link>
      <div className="nav-actions">
        {user ? (
          <>
            <span className="nav-greeting">Hi, {user.displayName} 👋</span>
            <button className="nav-create-btn" onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
          </>
        ) : (
          <>
            <button className="signin-btn" onClick={() => navigate("/login")}>Sign in</button>
            <button className="nav-create-btn" onClick={() => navigate("/register")}>
              Create a Wish
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

/* ── Landing Page ────────────────────────────────── */
function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const countdown = useDemoCountdown();
  const [scrolled, setScrolled] = useState(false);

  /* Navbar scroll glass */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Scroll to section */
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  /* Section reveal refs */
  const [statsRef, statsVis] = useReveal();
  const [howRef, howVis] = useReveal();
  const [featureRef, featureVis] = useReveal();
  const [ctaRef, ctaVis] = useReveal();

  const STEPS = [
    {
      icon: <Sparkles size={24} />,
      num: "01",
      title: "Create your wish",
      desc: "Pick the birthday date & time, write a heartfelt message, and choose a colour theme.",
    },
    {
      icon: <Share2 size={24} />,
      num: "02",
      title: "Share the link",
      desc: "Send one beautiful link. No app download, no account needed for the recipient.",
    },
    {
      icon: <Zap size={24} />,
      num: "03",
      title: "Magic at midnight",
      desc: "The cake opens, confetti flies, and your personalised greeting reveals — right on time.",
    },
  ];

  const FEATURES = [
    {
      icon: <Clock size={22} />,
      title: "Live countdown",
      desc: "Seconds tick away on a beautiful themed page that builds anticipation.",
    },
    {
      icon: <Cake size={22} />,
      title: "Animated cake",
      desc: "A 3D-styled cake flips open exactly at the moment you chose — pure delight.",
    },
    {
      icon: <CalendarHeart size={22} />,
      title: "Three themes",
      desc: "Classic gold, Galaxy indigo, or Rose pink — each with matching confetti.",
    },
    {
      icon: <LinkIcon size={22} />,
      title: "Shareable link",
      desc: "One URL, forever accessible. Share via WhatsApp, email, or anywhere.",
    },
    {
      icon: <Star size={22} />,
      title: "Personal message",
      desc: "Up to 300 characters of your most heartfelt words, displayed beautifully.",
    },
    {
      icon: <Check size={22} />,
      title: "Free forever",
      desc: "No subscriptions, no credit cards. Create as many wishes as you want.",
    },
  ];

  const STATS = [
    { value: "100%", label: "Free to use" },
    { value: "3", label: "Beautiful themes" },
    { value: "0", label: "Apps to install" },
    { value: "∞", label: "Wishes to create" },
  ];

  return (
    <main className="app">
      {/* Background glows */}
      <div className="bg-glow glow-one" />
      <div className="bg-glow glow-two" />
      <div className="bg-glow glow-three" />

      {/* Stars */}
      <div className="starfield" aria-hidden="true">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }} />
        ))}
      </div>

      <Navbar scrolled={scrolled} />

      {/* ── Hero ───────────────────────────────────── */}
      <section className="hero" id="hero">
        <div className="hero-left">
          <div className="badge">
            <Sparkles size={15} />
            <span>A surprise that blooms at midnight</span>
          </div>

          <h1>
            Create<br />
            <span className="hero-gradient-text">magical</span><br />
            birthday<br />
            countdowns
          </h1>

          <p className="hero-desc">
            Design a beautiful birthday surprise, share the link,
            and let the magic reveal at the perfect midnight moment.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => navigate(user ? "/create" : "/register")}>
              <Sparkles size={19} /> Create a Wish
            </button>
            <button className="secondary-btn" onClick={() => scrollTo("how-it-works")}>
              How it works <ArrowRight size={17} />
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="floating-icon gift-icon"><Gift size={28} /></div>
          <div className="floating-icon heart-icon"><Heart size={28} /></div>

          <div className="countdown-card">
            <div className="card-header-pill">
              <span className="live-dot" />
              Live demo
            </div>
            <div className="cake-circle"><Cake size={34} /></div>
            <p className="countdown-label">COUNTDOWN TO</p>
            <h2 className="countdown-card-title">Aria's Birthday</h2>
            <div className="countdown-grid">
              {[
                { v: countdown.d, l: "DAYS" },
                { v: countdown.h, l: "HRS" },
                { v: countdown.m, l: "MINS" },
                { v: countdown.s, l: "SECS" },
              ].map(({ v, l }) => (
                <div className="time-box" key={l}>
                  <strong>{v}</strong>
                  <span>{l}</span>
                </div>
              ))}
            </div>
            <p className="magic-text">The magic begins soon ✨</p>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────── */}
      <div
        className={`stats-bar reveal${statsVis ? " visible" : ""}`}
        ref={statsRef}
      >
        {STATS.map(({ value, label }) => (
          <div className="stat-item" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* ── How it works ───────────────────────────── */}
      <section
        id="how-it-works"
        className={`how-section reveal${howVis ? " visible" : ""}`}
        ref={howRef}
      >
        <div className="section-header">
          <div className="badge" style={{ margin: "0 auto 18px" }}>
            <Sparkles size={14} /> How it works
          </div>
          <h2 className="section-title">Three steps to magic</h2>
          <p className="section-sub">
            From blank page to birthday surprise in under two minutes.
          </p>
        </div>

        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div className="step-card" key={s.num} style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="step-num">{s.num}</div>
              <div className="step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────── */}
      <section
        id="features"
        className={`features reveal${featureVis ? " visible" : ""}`}
        ref={featureRef}
      >
        <div className="section-header">
          <div className="badge" style={{ margin: "0 auto 18px" }}>
            <Star size={14} /> Everything included
          </div>
          <h2 className="section-title">Built for the moment</h2>
          <p className="section-sub">Every detail crafted to make the birthday person feel truly special.</p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card" key={f.title} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section
        className={`cta-section reveal${ctaVis ? " visible" : ""}`}
        ref={ctaRef}
      >
        <div className="cta-card">
          <span className="cta-emoji">🎂</span>
          <h2 className="cta-title">Someone's birthday is coming up</h2>
          <p className="cta-sub">
            Don't let it pass with just a text. Create something they'll remember forever.
          </p>
          <button
            className="primary-btn"
            style={{ margin: "0 auto" }}
            onClick={() => navigate(user ? "/create" : "/register")}
          >
            <Sparkles size={19} />
            {user ? "Create a Wish" : "Get started — it's free"}
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <Link to="/" className="footer-logo" style={{ textDecoration: "none" }}>
            <div className="logo-icon" style={{ width: 32, height: 32 }}><Sparkles size={16} /></div>
            <span>Midnight<strong>Wish</strong></span>
          </Link>
          <p className="footer-tagline">Make every birthday feel like midnight magic ✨</p>
          <div className="footer-links">
            <button className="footer-link" onClick={() => navigate(user ? "/create" : "/register")}>
              Create a Wish
            </button>
            <button className="footer-link" onClick={() => navigate("/login")}>Sign In</button>
            <button className="footer-link" onClick={() => scrollTo("how-it-works")}>How it works</button>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} Mukesh Kumar Sanivada. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

/* ── App Routes ──────────────────────────────────── */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/wish/:id" element={<WishView />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/create" element={<Protected><CreateWish /></Protected>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}