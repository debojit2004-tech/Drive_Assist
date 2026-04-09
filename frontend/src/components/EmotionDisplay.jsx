import React from 'react';
import { Smile } from 'lucide-react';

const EMOTION_MAP = {
  angry:    { emoji: '😠', color: '#ef4444', label: 'Angry' },
  disgust:  { emoji: '🤢', color: '#a855f7', label: 'Disgust' },
  fear:     { emoji: '😨', color: '#f97316', label: 'Fear' },
  happy:    { emoji: '😊', color: '#22c55e', label: 'Happy' },
  sad:      { emoji: '😢', color: '#3b82f6', label: 'Sad' },
  surprise: { emoji: '😲', color: '#eab308', label: 'Surprise' },
  neutral:  { emoji: '😐', color: '#94a3b8', label: 'Neutral' },
};

export default function EmotionDisplay({ emotion = 'neutral', confidence = 0, allEmotions = {} }) {
  const emo = EMOTION_MAP[emotion] || EMOTION_MAP.neutral;

  const sorted = Object.entries(allEmotions || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="card">
      <div className="card-header">
        <h3><Smile size={16} /> Emotion</h3>
        <span className="badge" style={{ background: `${emo.color}15`, color: emo.color, border: `1px solid ${emo.color}25` }}>
          {emo.emoji} {emo.label}
        </span>
      </div>
      <div className="card-body">
        {/* Primary emotion */}
        <div className="flex items-center gap-4 mb-4 p-3 rounded-xl"
             style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <span className="text-3xl anim-float">{emo.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold" style={{ color: emo.color }}>{emo.label}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="progress-track" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: `${confidence}%`, background: emo.color }} />
              </div>
              <span className="text-xs font-bold mono" style={{ color: emo.color }}>
                {confidence.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        {sorted.length > 0 && (
          <div className="space-y-2">
            {sorted.map(([name, value]) => {
              const e = EMOTION_MAP[name] || EMOTION_MAP.neutral;
              return (
                <div key={name} className="flex items-center gap-2.5">
                  <span className="text-xs w-4 text-center">{e.emoji}</span>
                  <span className="text-[10px] w-14 truncate" style={{ color: 'var(--text-muted)' }}>{e.label}</span>
                  <div className="progress-track" style={{ flex: 1, height: '4px' }}>
                    <div className="progress-fill" style={{ width: `${Math.min(100, value)}%`, background: e.color, opacity: 0.6, height: '4px' }} />
                  </div>
                  <span className="text-[10px] mono w-10 text-right" style={{ color: 'var(--text-muted)' }}>
                    {value.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
