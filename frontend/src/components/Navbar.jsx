import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, User, LogOut, Car, BarChart3, Info, LayoutDashboard } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

const NAV_LINKS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analytics',  label: 'Analytics',  icon: BarChart3 },
  { path: '/about',      label: 'About',       icon: Info },
];

export default function Navbar({ theme, setTheme, themes }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = (() => { try { return JSON.parse(localStorage.getItem('dg-user')); } catch { return null; } })();

  const handleLogout = () => { localStorage.removeItem('dg-user'); navigate('/'); };

  return (
    <nav className="sticky top-0 z-50" style={{
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(30px) saturate(1.8)',
      WebkitBackdropFilter: 'blur(30px) saturate(1.8)',
      borderBottom: '1px solid var(--border-color)',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>

        {/* ── Logo ── */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 13,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 18px rgba(99,102,241,0.3)',
            flexShrink: 0,
          }}>
            <Car size={20} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{
              fontSize: 15, fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: 2,
              background: 'linear-gradient(135deg,#6366f1,#a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1.1,
            }}>DRIVEASSIST</div>
            <div style={{ fontSize: 8, letterSpacing: 3, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI SAFETY</div>
          </div>
        </Link>

        {/* ── Desktop Links ── */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 2 }}>
          {NAV_LINKS.map(link => {
            const active = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 10, textDecoration: 'none',
                fontSize: 13, fontWeight: 600,
                color: active ? '#6366f1' : 'var(--text-secondary)',
                background: active ? 'rgba(99,102,241,0.08)' : 'transparent',
                border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}>
                <link.icon size={14} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* ── Right Controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThemeSwitcher theme={theme} setTheme={setTheme} themes={themes} />

          {user ? (
            <div className="hidden md:flex" style={{ alignItems: 'center', gap: 8 }}>
              {/* User chip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={13} color="white" />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{user.name}</span>
              </div>
              {/* Logout */}
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10,
                background: 'transparent', border: '1px solid var(--border-color)', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          ) : (
            <Link to="/signin" className="hidden md:inline-flex" style={{
              alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 10, textDecoration: 'none',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 700,
              boxShadow: '0 4px 15px rgba(99,102,241,0.3)', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(99,102,241,0.3)'; }}>
              <LogIn size={14} /> Sign In
            </Link>
          )}

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setMobileOpen(o => !o)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: 6 }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="md:hidden anim-fade-up" style={{ borderTop: '1px solid var(--border-color)', padding: '12px 24px 20px' }}>
          {NAV_LINKS.map(link => (
            <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
              color: location.pathname === link.path ? '#6366f1' : 'var(--text-secondary)',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <link.icon size={15} /> {link.label}
            </Link>
          ))}
          {user ? (
            <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{
              display: 'block', width: '100%', marginTop: 12, padding: '12px', borderRadius: 12, cursor: 'pointer',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444',
              fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-sans)',
            }}>Sign Out</button>
          ) : (
            <Link to="/signin" onClick={() => setMobileOpen(false)} style={{
              display: 'block', marginTop: 12, textAlign: 'center', padding: '12px', borderRadius: 12,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', textDecoration: 'none',
              fontWeight: 700, fontSize: 14,
            }}>Sign In →</Link>
          )}
        </div>
      )}
    </nav>
  );
}
