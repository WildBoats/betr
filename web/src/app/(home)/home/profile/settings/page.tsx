'use client';
import { Moon, Sun, Check } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useTheme } from '@/components/ThemeProvider';
import { ACCENTS, ACCENT_KEYS, type Mode } from '@/lib/theme';

export default function SettingsPage() {
  const { mode, accent, setMode, setAccent } = useTheme();

  const modes: { key: Mode; label: string; Icon: typeof Moon }[] = [
    { key: 'dark', label: 'Dark', Icon: Moon },
    { key: 'light', label: 'Light', Icon: Sun },
  ];

  return (
    <div style={{ padding: '20px 22px 16px' }}>
      <div className="page-head">
        <BackButton href="/home/profile" />
        <h1 className="page-title">Settings</h1>
      </div>

      {/* Appearance */}
      <span className="section-tag">Appearance</span>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Mode</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {modes.map(({ key, label, Icon }) => {
            const active = mode === key;
            return (
              <button
                key={key}
                onClick={() => setMode(key)}
                aria-pressed={active}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  height: 48,
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  background: active ? 'var(--accent-soft)' : 'var(--bg-elev)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--hairline)'}`,
                  color: active ? 'var(--accent)' : 'var(--text-2)',
                  transition: 'all .16s ease',
                }}
              >
                <Icon size={17} /> {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Accent</p>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>Recolors the whole app instantly.</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          {ACCENT_KEYS.map((key) => {
            const a = ACCENTS[key];
            const active = accent === key;
            return (
              <button
                key={key}
                onClick={() => setAccent(key)}
                aria-label={a.label}
                aria-pressed={active}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flex: 1 }}
              >
                <span
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: a.base,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: a.fg,
                    boxShadow: active ? `0 0 0 2px var(--bg), 0 0 0 4px ${a.base}` : 'none',
                    transition: 'box-shadow .16s ease',
                  }}
                >
                  {active && <Check size={20} strokeWidth={3} />}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: active ? 'var(--text)' : 'var(--text-3)' }}>{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live preview */}
      <span className="section-tag">Preview</span>
      <div className="card" style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span className="status-pill status-live"><span className="dot" />Live</span>
          <span className="meta-chip">Public</span>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 14, lineHeight: 1.4 }}>
          100 push-ups every day for 30 days
        </p>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[['$240', 'Pot'], ['$20', 'Your bet'], ['12d', 'Left'], ['8', 'Players']].map(([v, l]) => (
            <div key={l} className="stat-box">
              <span className="stat-val">{v}</span>
              <span className="stat-lbl">{l}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-accent" style={{ height: 48 }}>Join challenge</button>
      </div>
    </div>
  );
}
