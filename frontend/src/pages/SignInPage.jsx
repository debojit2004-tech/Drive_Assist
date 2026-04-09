import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles,
  User, CheckCircle2, AlertCircle, ChevronLeft
} from 'lucide-react';

/* ─── Animated canvas background ─── */
function AuthCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const pts = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() + 0.4,
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
        ctx.fillStyle = 'rgba(99,102,241,0.5)';
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.06 * (1 - d / 100)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

/* ─── Input Field ─── */
function InputField({ icon: Icon, type, label, value, onChange, placeholder, required, minLength, rightElement }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
        {label}
      </label>
      <div style={{
        position: 'relative',
        border: `1.5px solid ${focused ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.1)'}`,
        borderRadius: 14, overflow: 'hidden',
        transition: 'border-color 0.3s',
        boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
      }}>
        {Icon && (
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused ? '#6366f1' : 'var(--text-muted)', transition: 'color 0.3s' }}>
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: Icon ? '13px 44px 13px 44px' : '13px 16px',
            paddingRight: rightElement ? 48 : (Icon ? 44 : 16),
            background: 'rgba(6,9,15,0.6)',
            color: 'var(--text-primary)',
            fontSize: 14,
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
          }}
        />
        {rightElement && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Password strength ─── */
function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < score ? colors[score] : 'rgba(255,255,255,0.06)', transition: 'background 0.3s' }} />
        ))}
        <span style={{ fontSize: 10, color: score > 0 ? colors[score] : 'var(--text-muted)', fontWeight: 600, minWidth: 40, textAlign: 'right' }}>
          {score > 0 ? labels[score] : ''}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {checks.map(c => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: c.ok ? '#22c55e' : 'var(--text-muted)' }}>
            <CheckCircle2 size={10} color={c.ok ? '#22c55e' : 'rgba(255,255,255,0.1)'} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function SignInPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isSignUp && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
    localStorage.setItem('dg-user', JSON.stringify({ email, name: name || email.split('@')[0] }));
    await new Promise(r => setTimeout(r, 600));
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: '#06090f',
      fontFamily: 'var(--font-sans)',
    }}>

      {/* ─── LEFT PANEL: branding ─── */}
      <div className="hidden lg:flex" style={{
        background: 'rgba(12,18,36,0.5)',
        borderRight: '1px solid rgba(99,102,241,0.08)',
        position: 'relative', overflow: 'hidden',
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 56px',
      }}>
        <AuthCanvas />

        {/* Glow orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', top: '30%', left: '30%', transform: 'translate(-50%,-50%)', filter: 'blur(50px)' }} />
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)', bottom: '20%', right: '10%', filter: 'blur(40px)' }} />
        </div>

        {/* Top: logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>
              <Shield size={22} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: 2, background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DRIVEASSIST</div>
              <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI SAFETY</div>
            </div>
          </Link>
        </div>

        {/* Center: headline */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.16)', borderRadius: 30, marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 600, letterSpacing: 1 }}>REAL-TIME AI MONITORING</span>
          </div>

          <h2 style={{ fontSize: 'clamp(2rem,3.5vw,3rem)', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#eef2ff', lineHeight: 1.1, marginBottom: 20 }}>
            Your AI co-pilot<br />
            <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>watches every mile</span>
          </h2>

          <p style={{ fontSize: 15, color: '#a5b4d4', lineHeight: 1.7, maxWidth: 440, marginBottom: 36 }}>
            Join thousands of drivers who trust DriveAssist to detect fatigue, analyze emotions, and compute real-time safety scores.
          </p>

          {/* Feature checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { color: '#6366f1', text: '468-point face landmark tracking' },
              { color: '#22c55e', text: 'Adaptive 5-factor risk engine' },
              { color: '#f97316', text: 'Live GPS safe stop recommendations' },
              { color: '#3b82f6', text: 'Gemini AI safety chatbot' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: `${f.color}12`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={12} color={f.color} />
                </div>
                <span style={{ fontSize: 13.5, color: '#a5b4d4' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: stat row */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 28, paddingTop: 24, borderTop: '1px solid rgba(99,102,241,0.08)' }}>
          {[
            { val: '99%', label: 'Accuracy' },
            { val: '30fps', label: 'Tracking' },
            { val: '468', label: 'landmarks' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#eef2ff' }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── RIGHT PANEL: form ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

          {/* Back to home */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 36, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <ChevronLeft size={14} /> Back to home
          </Link>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div className="flex lg:hidden" style={{ marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={20} color="white" />
              </div>
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#eef2ff', marginBottom: 8 }}>
              {isSignUp ? 'Create Account' : 'Welcome back'}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {isSignUp
                ? 'Join DriveAssist AI and drive with confidence.'
                : 'Sign in to your DriveAssist AI account to continue.'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, marginBottom: 20 }}>
              <AlertCircle size={15} color="#ef4444" />
              <span style={{ fontSize: 13, color: '#f87171' }}>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, marginBottom: 20 }}>
              <CheckCircle2 size={15} color="#22c55e" />
              <span style={{ fontSize: 13, color: '#4ade80' }}>Authenticated! Launching dashboard…</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {isSignUp && (
              <InputField
                icon={User}
                type="text"
                label="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            )}

            <InputField
              icon={Mail}
              type="email"
              label="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <div>
              <InputField
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                rightElement={
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
              {isSignUp && <PasswordStrength password={password} />}
            </div>

            {!isSignUp && (
              <div style={{ textAlign: 'right', marginTop: -8 }}>
                <button type="button" style={{ background: 'transparent', border: 'none', fontSize: 12, color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 24px', borderRadius: 14, border: 'none', cursor: loading || success ? 'not-allowed' : 'pointer',
                background: success ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-sans)',
                boxShadow: success ? '0 6px 24px rgba(34,197,94,0.35)' : '0 6px 24px rgba(99,102,241,0.35)',
                transition: 'all 0.4s', opacity: (loading || success) ? 0.85 : 1,
              }}
              onMouseEnter={e => { if (!loading && !success) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(99,102,241,0.5)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = success ? '0 6px 24px rgba(34,197,94,0.35)' : '0 6px 24px rgba(99,102,241,0.35)'; }}
            >
              {loading ? (
                <div style={{ display: 'flex', gap: 5 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'white', animation: `bounce 1s ${i * 0.15}s infinite` }} />
                  ))}
                </div>
              ) : success ? (
                <><CheckCircle2 size={17} /> Launching Dashboard…</>
              ) : (
                <>{isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(99,102,241,0.08)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(99,102,241,0.08)' }} />
          </div>

          {/* Quick demo access */}
          <button
            type="button"
            onClick={async () => {
              setEmail('demo@driveassist.ai');
              setPassword('Demo1234');
              setLoading(true);
              await new Promise(r => setTimeout(r, 800));
              localStorage.setItem('dg-user', JSON.stringify({ email: 'demo@driveassist.ai', name: 'Demo User' }));
              setLoading(false);
              setSuccess(true);
              await new Promise(r => setTimeout(r, 500));
              navigate('/dashboard');
            }}
            style={{
              width: '100%', padding: '12px', borderRadius: 14, cursor: 'pointer',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            ⚡ Quick Demo Access — No signup needed
          </button>

          {/* Toggle */}
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 24 }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsSignUp(v => !v); setError(''); }}
              style={{ background: 'transparent', border: 'none', color: '#6366f1', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          {/* Trust */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(99,102,241,0.06)' }}>
            {['🔒 256-bit SSL', '🛡️ Privacy first', '⚡ No install'].map(t => (
              <span key={t} style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
