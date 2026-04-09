import React from 'react';
import { Sun, Moon, Zap } from 'lucide-react';

const META = {
  dark:  { Icon: Moon, label: 'Dark' },
  light: { Icon: Sun,  label: 'Light' },
  neon:  { Icon: Zap,  label: 'Neon' },
};

export default function ThemeSwitcher({ theme, setTheme, themes }) {
  return (
    <div className="flex items-center rounded-xl p-1"
         style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
      {themes.map((t) => {
        const { Icon, label } = META[t];
        const active = theme === t;
        return (
          <button key={t} onClick={() => setTheme(t)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer"
            style={{
              background: active ? 'var(--gradient-accent)' : 'transparent',
              color: active ? '#fff' : 'var(--text-muted)',
              border: 'none',
              transition: 'all 0.3s ease',
              letterSpacing: '0.3px',
            }}>
            <Icon size={12} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
