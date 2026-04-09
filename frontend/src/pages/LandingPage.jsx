import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Eye, Brain, MapPin, MessageCircle, BarChart3,
  Gauge, ChevronRight, ArrowRight, Star, Heart, Monitor,
  Zap, Lock, Wifi, Activity, Cpu, Globe, Sparkles, Play,
  CheckCircle2, TrendingUp, AlertTriangle, Navigation2,
  Menu, X, LogIn, User
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   MICRO PARTICLES
═══════════════════════════════════════════════════════════ */
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random() * 0.4 + 0.1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.a})`;
        ctx.fill();
      });
      // draw connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════════════════ */
function AnimCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const animate = (now) => {
          const prog = Math.min((now - t0) / duration, 1);
          const eased = 1 - Math.pow(1 - prog, 4);
          setCount(Math.floor(eased * end));
          if (prog < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════
   INLINE NAV FOR LANDING (no global Navbar shown here)
═══════════════════════════════════════════════════════════ */
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(6,9,15,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(99,102,241,0.1)' : '1px solid transparent',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
            <Shield size={20} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: 2, background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DRIVEASSIST</div>
            <div style={{ fontSize: 8, letterSpacing: 3, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI SAFETY</div>
          </div>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex" style={{ gap: 8 }}>
          {['Features', 'How It Works', 'Safety Engine', 'Tech Stack'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, '-')}`}
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, fontWeight: 500, padding: '8px 14px', borderRadius: 10, transition: 'all 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
              {l}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/signin" style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
            borderRadius: 12, border: '1px solid rgba(99,102,241,0.3)',
            color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, fontWeight: 600,
            transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            <LogIn size={14} /> Sign In
          </Link>
          <Link to="/signin" style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px',
            borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700,
            boxShadow: '0 4px 18px rgba(99,102,241,0.4)',
            transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(99,102,241,0.4)'; }}>
            Get Started <ArrowRight size={14} />
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden"
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 6 }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden" style={{ background: 'rgba(6,9,15,0.98)', padding: '16px 24px 24px', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          {['Features', 'How It Works', 'Safety Engine', 'Tech Stack'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => setMobileOpen(false)}
              style={{ display: 'block', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, padding: '12px 0', borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
              {l}
            </a>
          ))}
          <Link to="/signin" onClick={() => setMobileOpen(false)}
            style={{ display: 'block', marginTop: 16, textAlign: 'center', padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
            Get Started →
          </Link>
        </div>
      )}
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */
const FEATURES = [
  { icon: Eye, title: 'Drowsiness Detection', desc: 'Tracks 468 facial landmarks in real-time detecting eye closure & yawning via EAR & MAR algorithms with 99% accuracy.', accent: '#6366f1', g: 'rgba(99,102,241,0.08)' },
  { icon: Brain, title: 'Emotion Recognition', desc: 'DeepFace AI analyzes your emotional state — anger, fear, sadness, and fatigue instantly become computed risk factors.', accent: '#8b5cf6', g: 'rgba(139,92,246,0.08)' },
  { icon: Gauge, title: 'Adaptive Risk Score', desc: '5-factor weighted formula dynamically computes your fatigue risk from 0–100 in real-time, personalised to you.', accent: '#22c55e', g: 'rgba(34,197,94,0.08)' },
  { icon: MapPin, title: 'GPS & Safe Stops', desc: 'Live location tracking with automatic detection of rest stops, hospitals, and fuel stations near your route.', accent: '#f97316', g: 'rgba(249,115,22,0.08)' },
  { icon: MessageCircle, title: 'AI Safety Chatbot', desc: 'Gemini-powered assistant with full situational awareness — knows your risk score and proactively suggests actions.', accent: '#3b82f6', g: 'rgba(59,130,246,0.08)' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Beautiful real-time charts track EAR, MAR, and risk trends with deep historical session analysis.', accent: '#eab308', g: 'rgba(234,179,8,0.08)' },
];

const STEPS = [
  { num: '01', title: 'Open Camera', desc: 'One-click browser camera — no downloads, nothing to install.', icon: Monitor, color: '#6366f1' },
  { num: '02', title: 'AI Monitors', desc: 'Computer vision analyzes 468 facial landmarks every frame.', icon: Brain, color: '#8b5cf6' },
  { num: '03', title: 'Risk Calculated', desc: 'Adaptive engine scores fatigue across 5 real-time factors.', icon: Gauge, color: '#22c55e' },
  { num: '04', title: 'Stay Safe', desc: 'Instant alerts, find rest stops, chat with your AI co-pilot.', icon: Shield, color: '#f97316' },
];

const STATS = [
  { value: 468, suffix: '', label: 'Face Landmarks', icon: Cpu, color: '#6366f1' },
  { value: 30, suffix: 'fps', label: 'Real-time Processing', icon: Activity, color: '#22c55e' },
  { value: 99, suffix: '%', label: 'Detection Accuracy', icon: Zap, color: '#eab308' },
  { value: 5, suffix: '', label: 'Risk Factors', icon: Shield, color: '#f97316' },
];

const RISK_LEVELS = [
  { range: '0–30', label: 'Safe', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', desc: 'All clear, drive on', emoji: '✅' },
  { range: '30–60', label: 'Warning', color: '#eab308', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.2)', desc: 'Consider a break soon', emoji: '⚠️' },
  { range: '60–80', label: 'Alarm', color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)', desc: 'Pull over soon', emoji: '🚨' },
  { range: '80–100', label: 'Emergency', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', desc: 'Stop immediately', emoji: '🆘' },
];

const TECH = [
  { name: 'MediaPipe', desc: 'Face Mesh 468-pt', icon: Eye, color: '#6366f1' },
  { name: 'DeepFace', desc: 'Emotion AI', icon: Brain, color: '#8b5cf6' },
  { name: 'OpenCV', desc: 'Vision Pipeline', icon: Monitor, color: '#3b82f6' },
  { name: 'FastAPI', desc: 'Backend Engine', icon: Zap, color: '#22c55e' },
  { name: 'WebSocket', desc: 'Real-time Stream', icon: Wifi, color: '#f97316' },
  { name: 'React + Vite', desc: 'Reactive UI', icon: Globe, color: '#eab308' },
];

/* ═══════════════════════════════════════════════════════════
   FLOATING MOCK DASHBOARD CARD
═══════════════════════════════════════════════════════════ */
function MockDashboard() {
  const [risk, setRisk] = useState(12);
  const [ear, setEar] = useState(0.312);
  const [emotion, setEmotion] = useState('Happy 😊');

  useEffect(() => {
    const iv = setInterval(() => {
      setRisk(r => {
        const next = r + (Math.random() - 0.5) * 4;
        return Math.max(8, Math.min(25, next));
      });
      setEar(e => parseFloat((e + (Math.random() - 0.5) * 0.02).toFixed(3)));
    }, 1800);
    return () => clearInterval(iv);
  }, []);

  const riskColor = risk < 30 ? '#22c55e' : risk < 60 ? '#eab308' : '#f97316';

  return (
    <div style={{
      background: 'rgba(12,18,36,0.9)',
      backdropFilter: 'blur(30px)',
      border: '1px solid rgba(99,102,241,0.15)',
      borderRadius: 24,
      padding: 24,
      boxShadow: '0 20px 80px rgba(0,0,0,0.5), 0 0 60px rgba(99,102,241,0.08)',
      width: '100%',
      maxWidth: 420,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>Live Session · 12:04</span>
        <div style={{ marginLeft: 'auto', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '3px 10px', fontSize: 10, color: '#22c55e', fontWeight: 600 }}>ACTIVE</div>
      </div>

      {/* Risk Score */}
      <div style={{ background: 'rgba(6,9,15,0.6)', borderRadius: 16, padding: 20, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Risk Score</span>
          <span style={{ fontSize: 11, color: riskColor, fontWeight: 600 }}>✅ Safe</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 44, fontFamily: 'var(--font-display)', fontWeight: 800, color: riskColor, transition: 'color 0.5s' }}>{Math.round(risk)}</span>
          <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/100</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${risk}%`, background: `linear-gradient(90deg, ${riskColor}, ${riskColor}88)`, borderRadius: 3, transition: 'width 0.8s ease, background 0.5s' }} />
        </div>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{ background: 'rgba(6,9,15,0.6)', borderRadius: 14, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Eye size={12} color="#6366f1" />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>EAR</span>
          </div>
          <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700, color: '#6366f1' }}>{ear.toFixed(3)}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>Eye Aspect Ratio</div>
        </div>
        <div style={{ background: 'rgba(6,9,15,0.6)', borderRadius: 14, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Heart size={12} color="#f97316" />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Emotion</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f97316' }}>{emotion}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>87% confidence</div>
        </div>
      </div>

      {/* Alert */}
      <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Shield size={16} color="#22c55e" />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>All Clear — Drive Safely</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>No fatigue detected • 0 yawns • Session 12m</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN LANDING PAGE
═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div style={{ background: '#06090f', minHeight: '100vh', position: 'relative' }}>
      <Particles />
      <LandingNav />

      {/* ════════ HERO ════════ */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '100px 24px 60px' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', top: '50%', left: '30%', transform: 'translate(-50%,-50%)', filter: 'blur(60px)', animation: 'orbFloat 15s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', top: '30%', right: '-5%', filter: 'blur(60px)', animation: 'orbFloat 18s ease-in-out infinite reverse' }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)', bottom: '10%', left: '10%', filter: 'blur(50px)', animation: 'orbFloat 12s ease-in-out infinite 3s' }} />
        </div>

        <div style={{ maxWidth: 1280, width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', position: 'relative', zIndex: 1 }} className="lg:grid-cols-2 grid-cols-1">
          {/* Left */}
          <div className="anim-fade-up">
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 40, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', marginBottom: 28 }}>
              <Sparkles size={13} color="#6366f1" />
              <span style={{ fontSize: 12, color: '#a5b4fc', fontWeight: 600, letterSpacing: 0.5 }}>AI-Powered Driver Safety System</span>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: 'clamp(2.6rem,5.5vw,4.5rem)', fontFamily: 'var(--font-display)', fontWeight: 900, lineHeight: 1.05, color: '#eef2ff', marginBottom: 24, letterSpacing: -1 }}>
              Stay alert on{' '}
              <span style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 200%', animation: 'shimmerGradient 3s ease-in-out infinite' }}>every mile</span>
              <br />you drive
            </h1>

            <p style={{ fontSize: 17, lineHeight: 1.7, color: '#a5b4d4', maxWidth: 520, marginBottom: 40 }}>
              Real-time drowsiness detection, emotion analysis, and adaptive risk scoring — keeping you and everyone around you safe on every journey.
            </p>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link to="/signin" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', borderRadius: 16,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15,
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 44px rgba(99,102,241,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.4)'; }}>
                Start Driving Safer <ArrowRight size={18} />
              </Link>
              <a href="#features" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 26px', borderRadius: 16,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#a5b4d4', textDecoration: 'none', fontWeight: 600, fontSize: 15,
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#a5b4d4'; }}>
                <Play size={15} /> See How It Works
              </a>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {[
                { icon: <CheckCircle2 size={13} color="#22c55e" />, text: 'No downloads needed', },
                { icon: <Lock size={13} color="#6366f1" />, text: 'Works in browser', },
                { icon: <Zap size={13} color="#eab308" />, text: '30fps real-time', },
              ].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {b.icon}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Mock Dashboard */}
          <div className="hidden lg:flex anim-fade-up" style={{ animationDelay: '200ms', justifyContent: 'center' }}>
            <MockDashboard />
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 38, borderRadius: 12, border: '2px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 4 }}>
            <div style={{ width: 3, height: 8, borderRadius: 2, background: '#6366f1', animation: 'scrollDot 2s ease-in-out infinite' }} />
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase' }}>Scroll</span>
        </div>
      </section>

      {/* ════════ STATS BAR ════════ */}
      <section style={{ padding: '32px 24px', borderTop: '1px solid rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(99,102,241,0.06)', background: 'rgba(12,18,36,0.5)', backdropFilter: 'blur(10px)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.color}10`, border: `1px solid ${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon size={20} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 26, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#eef2ff' }}>
                  <AnimCounter end={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section id="features" style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#6366f1', fontWeight: 600, marginBottom: 16, padding: '5px 14px', background: 'rgba(99,102,241,0.06)', borderRadius: 20, border: '1px solid rgba(99,102,241,0.15)' }}>
              Capabilities
            </div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#eef2ff', lineHeight: 1.1, marginBottom: 16 }}>
              Everything you need to<br /><span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>drive safely</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Our AI monitors your alertness round-the-clock so you can focus entirely on the road ahead.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card" style={{ padding: 28, cursor: 'default' }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: f.g, border: `1px solid ${f.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <f.icon size={22} color={f.accent} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#eef2ff', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section id="how-it-works" style={{ padding: '100px 24px', background: 'rgba(12,18,36,0.5)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#22c55e', fontWeight: 600, marginBottom: 16, padding: '5px 14px', background: 'rgba(34,197,94,0.06)', borderRadius: 20, border: '1px solid rgba(34,197,94,0.15)' }}>
              Process
            </div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#eef2ff', lineHeight: 1.1, marginBottom: 16 }}>
              From camera to<br /><span style={{ background: 'linear-gradient(135deg,#22c55e,#4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>safety in seconds</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, position: 'relative' }}>
            {/* connector line */}
            <div className="hidden lg:block" style={{ position: 'absolute', top: '40%', left: '12.5%', right: '12.5%', height: 1, background: 'linear-gradient(90deg, rgba(99,102,241,0), rgba(99,102,241,0.3), rgba(99,102,241,0.3), rgba(99,102,241,0))', zIndex: 0 }} />
            {STEPS.map((s, i) => (
              <div key={i} className="feature-card anim-fade-up" style={{ padding: '32px 20px', textAlign: 'center', animationDelay: `${i * 100}ms`, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, margin: '0 auto 16px', background: `${s.color}12`, border: `1px solid ${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={26} color={s.color} />
                </div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 3, color: s.color, marginBottom: 8 }}>STEP {s.num}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#eef2ff', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ SAFETY ENGINE ════════ */}
      <section id="safety-engine" style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div className="anim-fade-up">
            <div style={{ display: 'inline-block', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#f97316', fontWeight: 600, marginBottom: 16, padding: '5px 14px', background: 'rgba(249,115,22,0.06)', borderRadius: 20, border: '1px solid rgba(249,115,22,0.15)' }}>
              Risk Engine
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#eef2ff', lineHeight: 1.1, marginBottom: 16 }}>
              Adaptive AI that<br /><span style={{ background: 'linear-gradient(135deg,#f97316,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>learns your baseline</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
              Our 5-factor risk engine continuously adapts to your personal driving patterns. Detecting subtle changes before they become dangerous.
            </p>

            {/* Formula Card */}
            <div style={{ background: 'rgba(12,18,36,0.8)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 16, padding: 20, fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 2 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>RISK FORMULA</div>
              <span style={{ color: '#a78bfa' }}>Risk</span>{' '}={' '}
              <span style={{ color: '#6366f1' }}>0.35×EAR</span> +{' '}
              <span style={{ color: '#8b5cf6' }}>0.20×MAR</span> +{' '}
              <span style={{ color: '#f97316' }}>0.15×EMO</span> +{' '}
              <span style={{ color: '#eab308' }}>0.20×TIME</span> +{' '}
              <span style={{ color: '#22c55e' }}>0.10×BASE</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {RISK_LEVELS.map(r => (
              <div key={r.label} style={{ background: r.bg, border: `1px solid ${r.border}`, borderRadius: 18, padding: '22px 16px', textAlign: 'center', transition: 'transform 0.3s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{r.emoji}</div>
                <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 800, color: r.color }}>{r.range}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: r.color, marginTop: 4 }}>{r.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ TECH STACK ════════ */}
      <section id="tech-stack" style={{ padding: '100px 24px', background: 'rgba(12,18,36,0.5)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#eab308', fontWeight: 600, marginBottom: 16, padding: '5px 14px', background: 'rgba(234,179,8,0.06)', borderRadius: 20, border: '1px solid rgba(234,179,8,0.15)' }}>
              Built With
            </div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#eef2ff', lineHeight: 1.1 }}>
              Powered by <span style={{ background: 'linear-gradient(135deg,#eab308,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>cutting-edge tech</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14 }}>
            {TECH.map((t, i) => (
              <div key={i} className="feature-card" style={{ padding: '22px 12px', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, margin: '0 auto 12px', background: `${t.color}10`, border: `1px solid ${t.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <t.icon size={18} color={t.color} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#eef2ff' }}>{t.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FINAL CTA ════════ */}
      <section style={{ padding: '120px 24px', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(60px)' }} />
        </div>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Icon */}
          <div style={{ width: 88, height: 88, borderRadius: 28, margin: '0 auto 28px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 60px rgba(99,102,241,0.4)', animation: 'float 3s ease-in-out infinite' }}>
            <Shield size={40} color="white" />
          </div>

          <h2 style={{ fontSize: 'clamp(2.2rem,5vw,3.8rem)', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#eef2ff', lineHeight: 1.1, marginBottom: 20 }}>
            Start driving<br /><span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>safer today</span>
          </h2>

          <p style={{ fontSize: 17, color: '#a5b4d4', marginBottom: 44, lineHeight: 1.7 }}>
            Create your free account, enable your camera in seconds, and let AI watch over your safety on every journey.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signin" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '16px 36px', borderRadius: 18,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 16,
              boxShadow: '0 8px 40px rgba(99,102,241,0.45)',
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 60px rgba(99,102,241,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(99,102,241,0.45)'; }}>
              Create Free Account <ArrowRight size={20} />
            </Link>
          </div>

          {/* Bottom trust */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
            {['🔒 No credit card required', '⚡ Instant setup', '🛡️ Privacy first'].map(t => (
              <span key={t} style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid rgba(99,102,241,0.06)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={14} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DRIVEGUARD AI</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2026 DriveGuard AI. Built for safety.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <span key={l} style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#a5b4d4'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </footer>

      {/* Keyframe for scroll dot */}
      <style>{`
        @keyframes scrollDot {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(10px); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
