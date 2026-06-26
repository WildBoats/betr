'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { applyTheme, DEFAULT_ACCENT, DEFAULT_MODE, STORAGE_KEY, type AccentKey, type Mode } from '@/lib/theme';

interface ThemeCtx {
  mode: Mode;
  accent: AccentKey;
  setMode: (m: Mode) => void;
  setAccent: (a: AccentKey) => void;
  toggleMode: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(DEFAULT_MODE);
  const [accent, setAccentState] = useState<AccentKey>(DEFAULT_ACCENT);

  // Hydrate from storage (the inline script already painted the right palette).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const t = JSON.parse(raw);
        if (t.mode === 'light' || t.mode === 'dark') setModeState(t.mode);
        if (t.accent) setAccentState(t.accent);
      }
    } catch {}
  }, []);

  const persist = (m: Mode, a: AccentKey) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: m, accent: a })); } catch {}
  };

  const setMode = (m: Mode) => { setModeState(m); applyTheme(m, accent); persist(m, accent); };
  const setAccent = (a: AccentKey) => { setAccentState(a); applyTheme(mode, a); persist(mode, a); };
  const toggleMode = () => setMode(mode === 'dark' ? 'light' : 'dark');

  return (
    <Ctx.Provider value={{ mode, accent, setMode, setAccent, toggleMode }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
