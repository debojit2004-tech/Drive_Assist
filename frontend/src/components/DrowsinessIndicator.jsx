import React from 'react';
import { Eye, EyeOff, AlertTriangle, Brain } from 'lucide-react';

export default function DrowsinessIndicator({ ear = 0.3, mar = 0.2, isDrowsy = false, isYawning = false, yawnCount = 0, closedFrames = 0 }) {
  const earPct = Math.min(100, Math.max(0, (ear / 0.4) * 100));
  const marPct = Math.min(100, Math.max(0, (mar / 0.8) * 100));
  const earStatus = ear < 0.18 ? 'danger' : ear < 0.21 ? 'warning' : 'safe';
  const marStatus = mar > 0.6 ? 'danger' : mar > 0.4 ? 'warning' : 'safe';
  const statusColor = { safe: 'var(--safe)', warning: 'var(--warning)', danger: 'var(--danger)' };

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <h3>
          {isDrowsy ? <EyeOff size={16} style={{ color: 'var(--danger)' }} /> : <Eye size={16} />}
          Drowsiness
        </h3>
        <span className="badge" style={{
          background: isDrowsy ? 'var(--danger-bg)' : 'var(--safe-bg)',
          color: isDrowsy ? 'var(--danger)' : 'var(--safe)',
          border: `1px solid ${isDrowsy ? 'var(--danger-border)' : 'var(--safe-border)'}`,
        }}>
          {isDrowsy ? '😴 DROWSY' : '👁️ ALERT'}
        </span>
      </div>

      <div className="card-body">
        {isDrowsy && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl anim-blink"
               style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)' }}>
            <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
            <span className="text-xs font-bold" style={{ color: 'var(--danger)' }}>DROWSINESS DETECTED!</span>
          </div>
        )}

        {/* EAR */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              👁️ EAR — EYE ASPECT RATIO
            </span>
            <span className="text-sm font-bold mono" style={{ color: statusColor[earStatus] }}>
              {ear.toFixed(3)}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${earPct}%`, background: statusColor[earStatus] }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Threshold: 0.210</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Closed: {closedFrames}f</span>
          </div>
        </div>

        {/* MAR */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
              👄 MAR — MOUTH ASPECT RATIO
            </span>
            <span className="text-sm font-bold mono" style={{ color: statusColor[marStatus] }}>
              {mar.toFixed(3)}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${marPct}%`, background: statusColor[marStatus] }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Threshold: 0.600</span>
            <span className="text-[10px]" style={{ color: isYawning ? 'var(--warning)' : 'var(--text-muted)' }}>
              {isYawning ? '🥱 Yawning!' : 'Normal'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="stat-block">
            <div className="stat-value" style={{ color: isDrowsy ? 'var(--danger)' : 'var(--safe)' }}>
              {isDrowsy ? '😴' : '👁️'}
            </div>
            <div className="stat-label">{isDrowsy ? 'Drowsy' : 'Alert'}</div>
          </div>
          <div className="stat-block">
            <div className="stat-value" style={{ color: 'var(--accent-1)' }}>{yawnCount}</div>
            <div className="stat-label">Yawns</div>
          </div>
          <div className="stat-block">
            <div className="stat-value" style={{ color: isYawning ? 'var(--warning)' : 'var(--safe)', fontSize: '18px' }}>
              {isYawning ? '🥱' : '😊'}
            </div>
            <div className="stat-label">{isYawning ? 'Open' : 'Closed'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
