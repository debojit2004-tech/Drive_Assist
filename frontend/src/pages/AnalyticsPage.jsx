import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend,
} from 'recharts';
import {
  BarChart3, Activity, Clock, TrendingUp, AlertTriangle,
  Eye, Smile, Car, Shield, Zap, TrendingDown, ArrowUp,
  ArrowDown, Minus, Calendar, Download
} from 'lucide-react';

/* ─── Simulated data ─── */
const genSessions = () => {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    out.push({
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      avgRisk: 12 + Math.random() * 38,
      maxRisk: 28 + Math.random() * 55,
      duration: 25 + Math.random() * 130,
      yawns: Math.floor(Math.random() * 16),
      drowsyEvents: Math.floor(Math.random() * 6),
      ear: 0.27 + Math.random() * 0.08,
      alertness: 65 + Math.random() * 30,
    });
  }
  return out;
};

const EMOTIONS = [
  { name: 'Neutral', value: 45, color: '#94a3b8' },
  { name: 'Happy',   value: 25, color: '#22c55e' },
  { name: 'Sad',     value: 12, color: '#3b82f6' },
  { name: 'Angry',   value:  8, color: '#ef4444' },
  { name: 'Surprise',value:  6, color: '#eab308' },
  { name: 'Fear',    value:  4, color: '#f97316' },
];

const RADAR_DATA = [
  { metric: 'Alertness',  score: 82 },
  { metric: 'EAR Score',  score: 76 },
  { metric: 'Emotion',    score: 90 },
  { metric: 'Focus',      score: 68 },
  { metric: 'Consistency',score: 85 },
  { metric: 'Safety',     score: 79 },
];

/* ─── Custom tooltip ─── */
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card-solid)', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--border-color)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
      {label && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ color: 'var(--text-muted)' }}>{p.name}:</span>
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: p.color }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── KPI Card ─── */
function KpiCard({ label, value, sub, icon: Icon, color, trend, trendVal }) {
  return (
    <div className="card" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 14, background: `${color}12`, border: `1px solid ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 8, background: trend === 'up' ? 'rgba(34,197,94,0.08)' : trend === 'down' ? 'rgba(239,68,68,0.08)' : 'rgba(148,163,184,0.08)' }}>
            {trend === 'up' ? <ArrowUp size={11} color="#22c55e" /> : trend === 'down' ? <ArrowDown size={11} color="#ef4444" /> : <Minus size={11} color="#94a3b8" />}
            <span style={{ fontSize: 10, fontWeight: 700, color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#94a3b8' }}>{trendVal}</span>
          </div>
        )}
      </div>
      <p style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800, color, lineHeight: 1, marginBottom: 6 }}>{value}</p>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

/* ─── Section header ─── */
function SectionHeader({ icon: Icon, title, subtitle, color = 'var(--accent-1)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{ width: 36, height: 36, borderRadius: 12, background: `${color}12`, border: `1px solid ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={color} />
      </div>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [sessions] = useState(genSessions);
  const [activeTab, setActiveTab] = useState('overview');

  const totalDriving = sessions.reduce((a, s) => a + s.duration, 0);
  const avgRisk = sessions.reduce((a, s) => a + s.avgRisk, 0) / sessions.length;
  const totalYawns = sessions.reduce((a, s) => a + s.yawns, 0);
  const totalDrowsy = sessions.reduce((a, s) => a + s.drowsyEvents, 0);
  const avgAlertr = sessions.reduce((a, s) => a + s.alertness, 0) / sessions.length;

  const TABS = ['overview', 'sessions', 'emotions'];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>

      {/* ─── Page Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, marginBottom: 12 }}>
            <BarChart3 size={12} color="#6366f1" />
            <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Safety Analytics</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            Drive <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Analytics</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>7-day safety insights and performance metrics</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', padding: 4, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12 }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  padding: '7px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'capitalize', fontFamily: 'var(--font-sans)',
                  background: activeTab === tab ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                  color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }} className="stagger">
        <KpiCard label="Driving Time" value={`${(totalDriving / 60).toFixed(1)}h`} sub="7-day total" icon={Clock} color="#6366f1" trend="up" trendVal="+12%" />
        <KpiCard label="Avg Risk" value={avgRisk.toFixed(1)} sub={avgRisk < 30 ? 'Safe range' : 'Watch out'} icon={Activity} color={avgRisk < 30 ? '#22c55e' : '#eab308'} trend={avgRisk < 30 ? 'down' : 'up'} trendVal="vs last wk" />
        <KpiCard label="Alertness" value={`${avgAlertr.toFixed(0)}%`} sub="Average score" icon={Zap} color="#3b82f6" trend="stable" trendVal="↔ stable" />
        <KpiCard label="Total Yawns" value={totalYawns} sub={`${(totalYawns / 7).toFixed(1)} per day`} icon={Eye} color="#8b5cf6" />
        <KpiCard label="Drowsy Events" value={totalDrowsy} sub={`${(totalDrowsy / 7).toFixed(1)} per day`} icon={AlertTriangle} color={totalDrowsy > 10 ? '#ef4444' : '#f97316'} />
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {activeTab === 'overview' && (
        <>
          {/* Main charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {/* Risk trend */}
            <div className="card" style={{ padding: 24 }}>
              <SectionHeader icon={TrendingUp} title="Risk Score Trend" subtitle="7-day avg and peak risk" />
              <div style={{ height: 230 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sessions} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="gAvg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gMax" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="avgRisk" name="Avg Risk" stroke="#6366f1" strokeWidth={2.5} fill="url(#gAvg)" dot={{ r: 4, fill: '#6366f1' }} />
                    <Area type="monotone" dataKey="maxRisk" name="Peak Risk" stroke="#f97316" strokeWidth={2} fill="url(#gMax)" dot={{ r: 3, fill: '#f97316' }} strokeDasharray="5 3" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Alertness radar */}
            <div className="card" style={{ padding: 24 }}>
              <SectionHeader icon={Shield} title="Safety Performance" subtitle="Multi-dimension radar score" color="#22c55e" />
              <div style={{ height: 230 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke="var(--border-color)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            {/* Alertness + duration bar */}
            <div className="card" style={{ padding: 24 }}>
              <SectionHeader icon={Activity} title="Daily Alertness & Session Duration" subtitle="Alertness % vs drive time" color="#3b82f6" />
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessions} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Bar yAxisId="left" dataKey="alertness" name="Alertness %" fill="#3b82f6" radius={[6, 6, 0, 0]} opacity={0.9} />
                    <Bar yAxisId="right" dataKey="yawns" name="Yawns" fill="#8b5cf6" radius={[6, 6, 0, 0]} opacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Emotion Pie */}
            <div className="card" style={{ padding: 24 }}>
              <SectionHeader icon={Smile} title="Emotion Distribution" subtitle="Session average" color="#f97316" />
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={EMOTIONS} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                      {EMOTIONS.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {EMOTIONS.map(e => (
                  <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: e.color }} />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{e.name} {e.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── SESSIONS TAB ─── */}
      {activeTab === 'sessions' && (
        <div className="card" style={{ padding: 24 }}>
          <SectionHeader icon={Calendar} title="Session Log" subtitle="All sessions last 7 days" color="#6366f1" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
              <thead>
                <tr>
                  {['Day', 'Date', 'Duration', 'Avg Risk', 'Max Risk', 'Alertness', 'Yawns', 'Drowsy Events'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => {
                  const rColor = s.avgRisk < 30 ? '#22c55e' : s.avgRisk < 60 ? '#eab308' : '#ef4444';
                  return (
                    <tr key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 12 }}>
                      <td style={{ padding: '12px 14px', borderRadius: '12px 0 0 12px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{s.day}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{s.date}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{s.duration.toFixed(0)} min</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: rColor }}>{s.avgRisk.toFixed(1)}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: s.maxRisk > 60 ? '#ef4444' : '#f97316' }}>{s.maxRisk.toFixed(1)}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--bg-card)', overflow: 'hidden', maxWidth: 60 }}>
                            <div style={{ height: '100%', width: `${s.alertness}%`, background: '#3b82f6', borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600 }}>{s.alertness.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#8b5cf6' }}>{s.yawns}</td>
                      <td style={{ padding: '12px 14px', borderRadius: '0 12px 12px 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: s.drowsyEvents > 2 ? '#ef4444' : 'var(--text-muted)' }}>
                        {s.drowsyEvents}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── EMOTIONS TAB ─── */}
      {activeTab === 'emotions' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <SectionHeader icon={Smile} title="Emotion Breakdown" subtitle="7-day average distribution" color="#f97316" />
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={EMOTIONS} cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={4} dataKey="value" label={({ name, value }) => `${value}%`} labelLine={{ stroke: 'var(--border-color)' }}>
                    {EMOTIONS.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <SectionHeader icon={Activity} title="Emotion Risk Impact" subtitle="How emotions affect driving safety" color="#ef4444" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
              {[
                { name: 'Fear', risk: 90, color: '#ef4444', note: 'Highest risk' },
                { name: 'Angry', risk: 80, color: '#f97316', note: 'Very high risk' },
                { name: 'Disgust', risk: 50, color: '#eab308', note: 'Moderate risk' },
                { name: 'Sad', risk: 40, color: '#3b82f6', note: 'Moderate risk' },
                { name: 'Surprise', risk: 30, color: '#8b5cf6', note: 'Minor risk' },
                { name: 'Neutral', risk: 10, color: '#94a3b8', note: 'Ideal state' },
                { name: 'Happy', risk: 5, color: '#22c55e', note: 'Safest state' },
              ].map(e => (
                <div key={e.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{e.name}</span>
                    <span style={{ fontSize: 11, color: e.color, fontWeight: 600 }}>{e.note}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${e.risk}%`, background: e.color, borderRadius: 3, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
