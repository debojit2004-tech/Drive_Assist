import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Eye, Brain, MapPin, Gauge, MessageCircle, BarChart3,
  ArrowRight, Code, Play, Zap, Check, Cpu, Wifi, Globe,
  Car, Star, Github, ExternalLink, ChevronRight
} from 'lucide-react';

const ARCH_STEPS = [
  { icon: '📸', title: 'Camera + GPS', desc: 'Real-time video capture via browser getUserMedia API plus GPS coordinates from Geolocation API', color: '#6366f1' },
  { icon: '🧠', title: 'Computer Vision', desc: 'MediaPipe Face Mesh extracts 468 landmarks, OpenCV processes frames, DeepFace classifies emotion', color: '#8b5cf6' },
  { icon: '📊', title: 'EAR / MAR Analysis', desc: 'Eye Aspect Ratio and Mouth Aspect Ratio computed per frame, emotion risk weights assigned', color: '#22c55e' },
  { icon: '⚡', title: 'Risk Engine', desc: 'Adaptive AI combines 5 weighted factors: EAR 35%, MAR 20%, Emotion 15%, Time 20%, Baseline 10%', color: '#f97316' },
  { icon: '🌐', title: 'FastAPI Backend', desc: 'WebSocket streaming at 30 FPS, REST APIs for chat, GPS, profiles and analytics', color: '#3b82f6' },
  { icon: '💻', title: 'React Dashboard', desc: 'Premium responsive UI with live gauges, charts, map, AI chatbot, voice assistant and 3 themes', color: '#eab308' },
];

const TEAM_SKILLS = [
  { category: 'AI / Vision', color: '#6366f1', items: ['Python 3.10+', 'OpenCV', 'MediaPipe Face Mesh', 'DeepFace', 'NumPy'] },
  { category: 'Backend', color: '#22c55e', items: ['FastAPI', 'WebSockets', 'Uvicorn', 'Motor (MongoDB)', 'httpx'] },
  { category: 'Frontend', color: '#3b82f6', items: ['React 18', 'Vite 5', 'Tailwind CSS', 'Recharts', 'Leaflet.js'] },
  { category: 'APIs & Services', color: '#f97316', items: ['Google Gemini AI', 'Overpass API', 'Geolocation API', 'Web Speech API', 'CARTO Tiles'] },
];

const FORMULAS = [
  { name: 'Eye Aspect Ratio (EAR)', formula: 'EAR = (|p2−p6| + |p3−p5|) / (2 × |p1−p4|)', threshold: '< 0.21 → Eyes Closing', icon: '👁️', color: '#6366f1' },
  { name: 'Mouth Aspect Ratio (MAR)', formula: 'MAR = (|p2−p6| + |p3−p5|) / (2 × |p1−p4|)', threshold: '> 0.60 → Yawning', icon: '👄', color: '#8b5cf6' },
  { name: 'Risk Score', formula: 'Risk = Σ(wi × fi) × 100', threshold: '0–30 Safe | 30–60 Warning | 60+ Alert', icon: '📊', color: '#22c55e' },
  { name: 'Haversine Distance', formula: 'a = sin²(Δφ/2) + cos(φ₁)·cos(φ₂)·sin²(Δλ/2)', threshold: 'Used for nearby place distances', icon: '📍', color: '#f97316' },
];

const FEATURES = [
  { icon: Eye, title: 'Drowsiness Detection', desc: '468-point facial landmark tracking with real-time EAR computation', color: '#6366f1' },
  { icon: Brain, title: 'Emotion AI', desc: 'DeepFace classifies 7 emotions and maps to risk weights', color: '#8b5cf6' },
  { icon: Gauge, title: 'Adaptive Risk Engine', desc: '5-factor weighted formula personalises to your baseline', color: '#22c55e' },
  { icon: MapPin, title: 'GPS Safety Map', desc: 'Real-time location with nearby rest stops and hospitals', color: '#f97316' },
  { icon: MessageCircle, title: 'Voice AI Chatbot', desc: 'Gemini-powered assistant with speech input & TTS output', color: '#3b82f6' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Historical trends, session logs, and emotion breakdown', color: '#eab308' },
];

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--bg-primary)' }}>

      {/* ─── Hero ─── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(60px)' }} />
        </div>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ width: 80, height: 80, borderRadius: 26, margin: '0 auto 28px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 60px rgba(99,102,241,0.35)' }} className="anim-float">
            <Car size={38} color="white" />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 600, letterSpacing: 1 }}>AI DRIVER SAFETY SYSTEM</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem,5vw,3.8rem)', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 20 }}>
            About{' '}
            <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DriveAssist</span>
          </h1>

          <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 700, margin: '0 auto 36px' }}>
            An AI-powered driver monitoring system combining computer vision, adaptive risk scoring, voice AI chatbot,
            and real-time alerts — built to prevent drowsy driving accidents before they happen.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            {[
              { val: '468', label: 'Face Landmarks' },
              { val: '99%', label: 'Detection Accuracy' },
              { val: '30fps', label: 'Processing Speed' },
              { val: '5', label: 'Risk Factors' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800, background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#6366f1', fontWeight: 600, marginBottom: 14 }}>What DriveAssist Does</p>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
              Six powerful <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>safety systems</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card" style={{ padding: 28 }}>
                <div style={{ width: 50, height: 50, borderRadius: 16, background: `${f.color}10`, border: `1px solid ${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Architecture Pipeline ─── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#22c55e', fontWeight: 600, marginBottom: 14 }}>Under the Hood</p>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
              System <span style={{ background: 'linear-gradient(135deg,#22c55e,#4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pipeline</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {ARCH_STEPS.map((step, i) => (
              <div key={i} className="card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: `${step.color}10`, border: `1px solid ${step.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {step.icon}
                  </div>
                  <div>
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 2, color: step.color, textTransform: 'uppercase' }}>STEP {String(i + 1).padStart(2, '0')}</span>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{step.title}</h3>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ─── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#3b82f6', fontWeight: 600, marginBottom: 14 }}>Technology</p>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
              Full <span style={{ background: 'linear-gradient(135deg,#3b82f6,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Stack</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {TEAM_SKILLS.map((group, i) => (
              <div key={i} className="card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: `${group.color}12`, border: `1px solid ${group.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Code size={16} color={group.color} />
                  </div>
                  <p style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: group.color }}>{group.category}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {group.items.map((item, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: `${group.color}10`, border: `1px solid ${group.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={11} color={group.color} />
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Core Formulas ─── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#f97316', fontWeight: 600, marginBottom: 14 }}>Mathematical Core</p>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
              Core <span style={{ background: 'linear-gradient(135deg,#f97316,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Formulas</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {FORMULAS.map((f, i) => (
              <div key={i} className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 22 }}>{f.icon}</span>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{f.name}</h3>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '12px 16px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: f.color, marginBottom: 10, lineHeight: 1.6 }}>
                  {f.formula}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.threshold}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(60px)' }} />
        </div>
        <div style={{ maxWidth: 660, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 20, lineHeight: 1.1 }}>
            Ready to drive <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>safer?</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.7 }}>
            Launch DriveAssist and experience AI-powered safety monitoring in real-time on your very next drive.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15,
              boxShadow: '0 8px 30px rgba(99,102,241,0.35)', transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 44px rgba(99,102,241,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.35)'; }}>
              <Play size={17} /> Launch Dashboard
            </Link>
            <Link to="/analytics" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 26px', borderRadius: 16, background: 'var(--bg-card)', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, fontSize: 15,
              border: '1px solid var(--border-active)', transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
              <BarChart3 size={17} /> View Analytics
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
