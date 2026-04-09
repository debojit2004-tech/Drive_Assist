import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X, BellRing, ShieldAlert, Volume2 } from 'lucide-react';

const LEVEL_CONFIG = {
  safe:      { color: '#22c55e', bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.18)',  icon: '✅', label: 'All Clear',   pulse: false },
  warning:   { color: '#eab308', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.22)',  icon: '⚠️', label: 'Warning',     pulse: true  },
  alarm:     { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.28)', icon: '🚨', label: 'Alarm',       pulse: true  },
  emergency: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)',  icon: '🆘', label: 'EMERGENCY', pulse: true  },
};

function useAlertSound(level) {
  const audioRef = useRef(null);
  useEffect(() => {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    if (level === 'alarm' || level === 'emergency') {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = level === 'emergency' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(level === 'emergency' ? 880 : 660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(level === 'emergency' ? 440 : 330, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    }
  }, [level]);
}

export default function AlertBanner({ level, action }) {
  const [dismissed, setDismissed] = useState(false);
  const [prevLevel, setPrevLevel] = useState(level);
  useAlertSound(level);

  useEffect(() => {
    if (level !== prevLevel) {
      setDismissed(false);
      setPrevLevel(level);
    }
  }, [level, prevLevel]);

  if (!level || level === 'safe' || dismissed) return null;

  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.warning;

  return (
    <div style={{
      margin: '0 0 16px 0',
      borderRadius: 16,
      background: cfg.bg,
      border: `1.5px solid ${cfg.border}`,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      animation: cfg.pulse ? 'blink-danger 1.5s ease-in-out infinite' : 'fadeUp 0.4s ease',
      boxShadow: `0 4px 24px ${cfg.bg}`,
    }}>
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 20,
      }}>
        {cfg.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 1, color: cfg.color, textTransform: 'uppercase' }}>
            {cfg.label}
          </span>
          {cfg.pulse && (
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 8px ${cfg.color}`, animation: 'glow-pulse 1s ease-in-out infinite' }} />
          )}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 3, fontWeight: 500 }}>{action}</p>
      </div>

      {/* Voice alert for emergency */}
      {(level === 'alarm' || level === 'emergency') && (
        <button
          title="Alert spoken"
          onClick={() => { const u = new SpeechSynthesisUtterance(action); u.rate = 1.1; u.volume = 1; window.speechSynthesis?.speak(u); }}
          style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color }}>
          <Volume2 size={15} />
        </button>
      )}

      {/* Dismiss */}
      <button onClick={() => setDismissed(true)}
        style={{ width: 28, height: 28, borderRadius: 8, background: 'transparent', border: `1px solid ${cfg.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>
        <X size={13} />
      </button>
    </div>
  );
}
