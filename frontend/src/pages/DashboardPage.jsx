import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useGeolocation } from '../hooks/useGeolocation';
import Dashboard from '../components/Dashboard';
import ChatbotPanel from '../components/ChatbotPanel';
import {
  Radio, Clock, Cpu, Camera, CameraOff, BellRing,
  ShieldCheck, TriangleAlert, Activity, Zap, Car
} from 'lucide-react';

/* ── Browser Camera Hook ── */
function useBrowserCamera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(false);

  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false });
      setStream(s); setActive(true); setError(null);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e) { setError(e.message || 'Camera access denied'); setActive(false); }
  };

  const stop = () => {
    if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); setActive(false); }
  };

  const captureFrame = useCallback(() => {
    if (!active || !videoRef.current) return null;
    if (!canvasRef.current) { canvasRef.current = document.createElement('canvas'); canvasRef.current.width = 640; canvasRef.current.height = 480; }
    const ctx = canvasRef.current.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);
    return canvasRef.current.toDataURL('image/jpeg', 0.7);
  }, [active]);

  useEffect(() => () => { if (stream) stream.getTracks().forEach(t => t.stop()); }, [stream]);
  return { videoRef, stream, active, error, start, stop, captureFrame };
}

/* ── Camera Analysis ── */
function useCameraAnalysis(camera) {
  const [data, setData] = useState(null);
  const intervalRef = useRef(null);
  useEffect(() => {
    if (!camera.active) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(async () => {
      const frame = camera.captureFrame();
      if (!frame) return;
      try {
        const r = await fetch('/api/analyze-frame', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ frame }) });
        if (r.ok) setData(await r.json());
      } catch {}
    }, 500);
    return () => clearInterval(intervalRef.current);
  }, [camera.active, camera.captureFrame]);
  return data;
}

/* ── Simulation ── */
function useSimulation(isConnected, hasCameraAnalysis) {
  const [simData, setSimData] = useState(null);
  const fr = useRef(0), earH = useRef([]), marH = useRef([]), riskH = useRef([]), yawns = useRef(0), t0 = useRef(Date.now());
  useEffect(() => {
    if (isConnected || hasCameraAnalysis) return;
    const iv = setInterval(() => {
      fr.current++;
      const t = fr.current * 0.05;
      const dc = Math.sin(t * 0.08);
      let ear = 0.29 + 0.04 * Math.sin(t * 0.5) + (Math.random() - 0.5) * 0.015;
      if (dc > 0.7) ear -= 0.08 * (dc - 0.7) / 0.3;
      ear = Math.max(0.08, Math.min(0.38, ear));
      const yw = Math.sin(t * 0.12);
      let mar = 0.15 + (Math.random() - 0.5) * 0.02;
      if (yw > 0.85) { mar = 0.5 + 0.3 * (yw - 0.85) / 0.15; if (fr.current % 60 === 0) yawns.current++; }
      mar = Math.max(0.05, Math.min(0.85, mar));
      earH.current.push(+ear.toFixed(4)); marH.current.push(+mar.toFixed(4));
      if (earH.current.length > 300) earH.current.shift();
      if (marH.current.length > 300) marH.current.shift();
      const re = earH.current.slice(-30), bl = earH.current.slice(0, 30);
      const avgR = re.reduce((a, b) => a + b, 0) / re.length;
      const avgB = bl.length > 0 ? bl.reduce((a, b) => a + b, 0) / bl.length : 0.3;
      const earDrop = Math.min(1, Math.max(0, (avgB - avgR) / avgB) * 3);
      const marFreq = Math.min(1, yawns.current / 5);
      const emotions = ['neutral', 'neutral', 'neutral', 'happy', 'neutral', 'sad', 'neutral'];
      const curEmotion = emotions[Math.floor(t * 0.3) % emotions.length];
      const emoRiskMap = { angry: 0.8, fear: 0.9, happy: 0.05, sad: 0.4, neutral: 0.1, surprise: 0.3, disgust: 0.5 };
      const emoRisk = emoRiskMap[curEmotion] || 0.1;
      const sessMin = (Date.now() - t0.current) / 60000;
      const timeFactor = Math.min(1, sessMin / 240);
      const raw = 0.35 * earDrop + 0.20 * marFreq + 0.15 * emoRisk + 0.20 * timeFactor + 0.10 * Math.max(0, (0.3 - ear) / 0.3);
      const riskScore = Math.min(100, Math.max(0, raw * 100));
      let riskLevel = 'safe', riskAction = 'All clear — drive safely.';
      if (riskScore >= 80) { riskLevel = 'emergency'; riskAction = 'STOP IMMEDIATELY! Severe fatigue detected.'; }
      else if (riskScore >= 60) { riskLevel = 'alarm'; riskAction = 'Pull over soon! High fatigue detected.'; }
      else if (riskScore >= 30) { riskLevel = 'warning'; riskAction = 'Consider a break. Fatigue building.'; }
      riskH.current.push(+riskScore.toFixed(1));
      if (riskH.current.length > 300) riskH.current.shift();
      let trend = 'stable';
      if (riskH.current.length > 20) {
        const r10 = riskH.current.slice(-10), r20 = riskH.current.slice(-20, -10);
        const a1 = r10.reduce((a, b) => a + b, 0) / r10.length, a2 = r20.reduce((a, b) => a + b, 0) / r20.length;
        if (a1 - a2 > 3) trend = 'rising'; else if (a2 - a1 > 3) trend = 'falling';
      }
      setSimData({
        face_detected: true, ear: +ear.toFixed(4), mar: +mar.toFixed(4),
        drowsiness: { is_drowsy: ear < 0.18, is_yawning: mar > 0.6, closed_frames: ear < 0.18 ? 15 : 0, yawn_count: yawns.current },
        emotion: { emotion: curEmotion, confidence: 65 + Math.random() * 30, risk_weight: emoRisk, all_emotions: { neutral: 60, happy: 20, sad: 8, angry: 4, fear: 3, surprise: 3, disgust: 2 } },
        risk: { score: +riskScore.toFixed(1), level: riskLevel, action: riskAction, trend, components: { ear_drop: +earDrop.toFixed(3), mar_freq: +marFreq.toFixed(3), emotion: +emoRisk.toFixed(3), time_factor: +timeFactor.toFixed(3), baseline_dev: 0 }, session_minutes: +sessMin.toFixed(1) },
        demo_mode: true,
        _earHistory: [...earH.current], _marHistory: [...marH.current], _riskHistory: [...riskH.current],
      });
    }, 200);
    return () => clearInterval(iv);
  }, [isConnected, hasCameraAnalysis]);
  return simData;
}

/* ── Alert History Hook ── */
function useAlertHistory(data) {
  const [history, setHistory] = useState([]);
  const lastLevel = useRef('safe');
  useEffect(() => {
    const level = data?.risk?.level;
    if (!level || level === lastLevel.current) return;
    if (level !== 'safe') {
      setHistory(prev => [
        { id: Date.now(), level, action: data.risk.action, score: data.risk.score, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9)
      ]);
    }
    lastLevel.current = level;
  }, [data?.risk?.level]);
  return [history, setHistory];
}

const ALERT_COLORS = {
  warning:   { color: '#eab308', bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.2)',  icon: '⚠️' },
  alarm:     { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)', icon: '🚨' },
  emergency: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)', icon: '🆘' },
};

export default function DashboardPage() {
  const { data: wsData, isConnected } = useWebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`);
  const { position } = useGeolocation();
  const camera = useBrowserCamera();
  const cameraAnalysis = useCameraAnalysis(camera);
  const hasCameraAnalysis = !!cameraAnalysis;
  const simData = useSimulation(isConnected, hasCameraAnalysis);
  const activeData = isConnected ? wsData : (hasCameraAnalysis ? { ...cameraAnalysis, demo_mode: false, _earHistory: [], _marHistory: [], _riskHistory: [] } : simData);
  const [alertHistory, setAlertHistory] = useAlertHistory(activeData);
  const [showAlerts, setShowAlerts] = useState(false);
  const [uptime, setUptime] = useState(0);
  useEffect(() => { const t = setInterval(() => setUptime(p => p + 1), 1000); return () => clearInterval(t); }, []);
  const fmt = s => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const modeLabel = isConnected ? 'LIVE' : (hasCameraAnalysis ? 'CAMERA AI' : 'SIMULATION');
  const modeColor = isConnected ? '#22c55e' : (hasCameraAnalysis ? '#6366f1' : '#eab308');
  const riskScore = activeData?.risk?.score || 0;
  const riskLevel = activeData?.risk?.level || 'safe';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ─── Premium Status Bar ─── */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '10px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
      }}>
        {/* Left: mode indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Mode pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 30, background: `${modeColor}10`, border: `1px solid ${modeColor}25` }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: modeColor, boxShadow: `0 0 8px ${modeColor}`, animation: 'glow-pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 700, color: modeColor, letterSpacing: 1.5 }}>{modeLabel}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={13} color="#6366f1" />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{fmt(uptime)}</span>
          </div>

          {/* Risk quick view */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: riskLevel === 'safe' ? 'rgba(34,197,94,0.08)' : riskLevel === 'warning' ? 'rgba(234,179,8,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${riskLevel === 'safe' ? 'rgba(34,197,94,0.2)' : riskLevel === 'warning' ? 'rgba(234,179,8,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <Activity size={12} color={riskLevel === 'safe' ? '#22c55e' : riskLevel === 'warning' ? '#eab308' : '#ef4444'} />
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', color: riskLevel === 'safe' ? '#22c55e' : riskLevel === 'warning' ? '#eab308' : '#ef4444' }}>
              RISK {riskScore.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Right: controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Alert history button */}
          <button onClick={() => setShowAlerts(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 12,
              background: alertHistory.length > 0 ? 'rgba(239,68,68,0.08)' : 'var(--bg-card)', border: `1px solid ${alertHistory.length > 0 ? 'rgba(239,68,68,0.2)' : 'var(--border-color)'}`,
              color: alertHistory.length > 0 ? '#ef4444' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s',
            }}>
            <BellRing size={14} />
            Alerts {alertHistory.length > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: 6, padding: '1px 5px', fontSize: 10, fontWeight: 700 }}>{alertHistory.length}</span>}
          </button>

          {/* Camera button */}
          {camera.active ? (
            <button onClick={camera.stop}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
              <CameraOff size={14} /> Stop Camera
            </button>
          ) : (
            <button onClick={camera.start}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-sans)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
              <Camera size={14} /> Start Camera
            </button>
          )}

          {/* Connection dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className={`glow-dot ${isConnected || hasCameraAnalysis ? 'green' : 'red'}`} />
            <span style={{ fontSize: 11, fontWeight: 600, color: isConnected || hasCameraAnalysis ? '#22c55e' : '#eab308' }}>{modeLabel}</span>
          </div>
        </div>
      </div>

      {/* ─── Alert History Panel ─── */}
      {showAlerts && (
        <div style={{ margin: '12px 24px 0', animation: 'fadeUp 0.3s ease' }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BellRing size={14} color="#ef4444" /> Alert History
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>This session</span>
              </h3>
              <button onClick={() => setAlertHistory([])} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Clear all</button>
            </div>
            {alertHistory.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>✅ No alerts this session — driving safely!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                {alertHistory.map(a => {
                  const c = ALERT_COLORS[a.level] || ALERT_COLORS.warning;
                  return (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', borderRadius: 12, background: c.bg, border: `1px solid ${c.border}` }}>
                      <span style={{ fontSize: 16 }}>{c.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: c.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{a.level} — Score {a.score?.toFixed(0)}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{a.action}</div>
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{a.time}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Main Dashboard ─── */}
      <main style={{ maxWidth: 1800, margin: '0 auto', padding: '16px 24px 24px' }}>
        <Dashboard wsData={activeData} isConnected={isConnected || hasCameraAnalysis} position={position} camera={camera} />
      </main>

      <ChatbotPanel currentData={activeData} />
    </div>
  );
}
