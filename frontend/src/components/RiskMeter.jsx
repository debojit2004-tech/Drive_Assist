import React, { useMemo, useEffect, useRef } from 'react';
import { Gauge, TrendingUp, TrendingDown, Minus, Zap, Timer, Activity, Brain } from 'lucide-react';

export default function RiskMeter({ score = 0, level = 'safe', trend = 'stable', action = '', components = {}, sessionMinutes = 0 }) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const prevScoreRef = useRef(0);

  useEffect(() => { prevScoreRef.current = clampedScore; }, [clampedScore]);

  const cfg = useMemo(() => ({
    safe:      { color: 'var(--safe)',   bg: 'var(--safe-bg)',   border: 'var(--safe-border)',   label: 'SAFE',      emoji: '✅' },
    warning:   { color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'var(--warning-border)', label: 'WARNING',   emoji: '⚠️' },
    alarm:     { color: 'var(--alarm)',  bg: 'var(--alarm-bg)',  border: 'var(--alarm-border)',  label: 'ALARM',     emoji: '🚨' },
    emergency: { color: 'var(--danger)', bg: 'var(--danger-bg)', border: 'var(--danger-border)', label: 'EMERGENCY', emoji: '🆘' },
  }), [])[level] || { color: 'var(--safe)', bg: 'var(--safe-bg)', border: 'var(--safe-border)', label: 'SAFE', emoji: '✅' };

  const TrendIcon = trend === 'rising' ? TrendingUp : trend === 'falling' ? TrendingDown : Minus;
  const needleAngle = -135 + (clampedScore / 100) * 270;

  return (
    <div className={`card ${level === 'emergency' ? 'anim-blink' : ''}`}>
      <div className="card-header">
        <h3><Gauge size={16} /> Risk Score</h3>
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <TrendIcon size={12} style={{ color: trend === 'rising' ? 'var(--danger)' : trend === 'falling' ? 'var(--safe)' : 'var(--text-muted)' }} />
          {trend}
        </div>
      </div>
      <div className="card-body">
        {/* Gauge */}
        <div className="flex justify-center mb-4">
          <svg viewBox="0 0 200 130" style={{ width: '100%', maxWidth: '220px' }}>
            {/* Outer glow */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="safe-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--safe)" />
                <stop offset="100%" stopColor="var(--safe)" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="warn-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--warning)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--warning)" />
              </linearGradient>
              <linearGradient id="alarm-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--alarm)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--alarm)" />
              </linearGradient>
              <linearGradient id="danger-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--danger)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--danger)" />
              </linearGradient>
            </defs>

            {/* Background track */}
            <path d="M 20 120 A 80 80 0 0 1 180 120" fill="none" stroke="var(--border-color)" strokeWidth="12" strokeLinecap="round" />

            {/* Zone arcs */}
            <path d="M 20 120 A 80 80 0 0 1 44 56" fill="none" stroke="url(#safe-grad)" strokeWidth="12" strokeLinecap="round" opacity="0.7" />
            <path d="M 44 56 A 80 80 0 0 1 100 40" fill="none" stroke="url(#warn-grad)" strokeWidth="12" strokeLinecap="round" opacity="0.7" />
            <path d="M 100 40 A 80 80 0 0 1 156 56" fill="none" stroke="url(#alarm-grad)" strokeWidth="12" strokeLinecap="round" opacity="0.7" />
            <path d="M 156 56 A 80 80 0 0 1 180 120" fill="none" stroke="url(#danger-grad)" strokeWidth="12" strokeLinecap="round" opacity="0.7" />

            {/* Needle */}
            <g style={{ transform: `rotate(${needleAngle}deg)`, transformOrigin: '100px 120px', transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)' }}>
              <line x1="100" y1="120" x2="100" y2="52" stroke={cfg.color} strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)" />
              <circle cx="100" cy="120" r="5" fill={cfg.color} filter="url(#glow)" />
              <circle cx="100" cy="120" r="3" fill="var(--bg-primary)" />
            </g>

            {/* Score */}
            <text x="100" y="105" textAnchor="middle"
                  style={{ fontSize: '32px', fontFamily: 'Orbitron, sans-serif', fontWeight: '800', fill: cfg.color }}>
              {Math.round(clampedScore)}
            </text>
            <text x="100" y="120" textAnchor="middle"
                  style={{ fontSize: '9px', fontFamily: 'var(--font-sans)', fill: 'var(--text-muted)', letterSpacing: '2px' }}>
              / 100
            </text>
          </svg>
        </div>

        {/* Level badge */}
        <div className="flex justify-center mb-4">
          <span className="badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            {cfg.emoji} {cfg.label}
          </span>
        </div>

        {/* Component breakdown */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'EAR', value: ((components.ear_drop || 0) * 100).toFixed(0), icon: '👁️', weight: '35%' },
            { label: 'MAR', value: ((components.mar_freq || 0) * 100).toFixed(0), icon: '👄', weight: '20%' },
            { label: 'FEEL', value: ((components.emotion || 0) * 100).toFixed(0), icon: '😊', weight: '15%' },
            { label: 'TIME', value: ((components.time_factor || 0) * 100).toFixed(0), icon: '⏱️', weight: '20%' },
          ].map((c) => (
            <div key={c.label} className="stat-block" style={{ padding: '10px 4px' }}>
              <span className="text-sm">{c.icon}</span>
              <div className="stat-value" style={{ fontSize: '16px', color: 'var(--accent-1)', marginTop: '4px' }}>{c.value}%</div>
              <div className="stat-label" style={{ fontSize: '8px' }}>{c.label} ({c.weight})</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
