import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, BarChart3, Info, Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      padding: '40px 24px 24px',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40, marginBottom: 36 }} className="lg:grid-cols-3 grid-cols-1">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Car size={18} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: 2, background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DRIVEASSIST</div>
                <div style={{ fontSize: 8, letterSpacing: 3, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI SAFETY</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 340 }}>
              AI-powered driver monitoring using computer vision, adaptive risk scoring, and real-time alerts — keeping you safe on every journey.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              {['MediaPipe', 'Gemini AI', 'FastAPI', 'React'].map(tech => (
                <span key={tech} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.14)', color: '#a5b4fc', fontWeight: 600 }}>{tech}</span>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 16 }}>Navigate</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/dashboard', label: 'Dashboard', icon: Shield },
                { to: '/analytics', label: 'Analytics', icon: BarChart3 },
                { to: '/about', label: 'About', icon: Info },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  <l.icon size={13} /> {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)', marginBottom: 16 }}>System Status</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'AI Engine', status: 'Online' },
                { label: 'Backend API', status: 'Online' },
                { label: 'WebSocket', status: 'Active' },
                { label: 'GPS Module', status: 'Ready' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                    <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ paddingTop: 20, borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            © 2026 DriveAssist AI. Built with <Heart size={11} style={{ display: 'inline', color: '#ef4444', verticalAlign: 'middle' }} /> for safer roads.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <span key={l} style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-secondary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
