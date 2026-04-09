import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="card" style={{ padding: '8px 12px', borderRadius: '10px', minWidth: '80px', background: 'var(--bg-card-solid)' }}>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.name}:</span>
          <span className="text-[11px] font-bold mono" style={{ color: p.color }}>
            {typeof p.value === 'number' ? p.value.toFixed(3) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const CHARTS = [
  { key: 'EAR', label: '👁️ EYE ASPECT RATIO', color: '#6366f1', domain: [0, 0.4], dataKey: 'earHistory' },
  { key: 'MAR', label: '👄 MOUTH ASPECT RATIO', color: '#8b5cf6', domain: [0, 0.8], dataKey: 'marHistory' },
  { key: 'Risk', label: '📊 RISK SCORE', color: '#f97316', domain: [0, 100], dataKey: 'riskHistory' },
];

export default function AnalyticsCharts({ earHistory = [], marHistory = [], riskHistory = [] }) {
  const maxPts = 80;
  const datasets = {
    earHistory: earHistory.slice(-maxPts).map((v, i) => ({ i, EAR: v })),
    marHistory: marHistory.slice(-maxPts).map((v, i) => ({ i, MAR: v })),
    riskHistory: riskHistory.slice(-maxPts).map((v, i) => ({ i, Risk: v })),
  };

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <h3><BarChart3 size={16} /> Analytics</h3>
        <span className="text-[10px] mono" style={{ color: 'var(--text-muted)' }}>
          {earHistory.length} pts
        </span>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {CHARTS.map(chart => {
            const data = datasets[chart.dataKey];
            return (
              <div key={chart.key}>
                <p className="text-[10px] font-semibold tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                  {chart.label}
                </p>
                <div style={{ height: '120px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                      <defs>
                        <linearGradient id={`grad-${chart.key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chart.color} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={chart.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <YAxis domain={chart.domain} tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }} width={30} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey={chart.key}
                        stroke={chart.color}
                        fill={`url(#grad-${chart.key})`}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {data.length > 0 && (
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] mono" style={{ color: 'var(--text-muted)' }}>
                      Latest: <span style={{ color: chart.color }}>{data[data.length - 1]?.[chart.key]?.toFixed(chart.key === 'Risk' ? 1 : 3)}</span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
