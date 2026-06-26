/* ---------------------------------------------------------------------------
 * Theme system — two independent dimensions:
 *   mode   : 'dark' | 'light'        (base neutrals)
 *   accent : one of ACCENTS keys     (brand hue)
 * A full set of CSS variables is computed from (mode, accent) and written onto
 * <html>. Every screen reads those vars, so flipping either dimension reskins
 * the whole app live. Choices persist to localStorage.
 * ------------------------------------------------------------------------- */

export type Mode = 'dark' | 'light';
export type AccentKey = 'matrix' | 'tidal' | 'nebula' | 'ember' | 'coral';

export const MODES: Mode[] = ['dark', 'light'];

/* Base hue for each accent + the readable foreground used on top of it. */
export const ACCENTS: Record<AccentKey, { label: string; base: string; press: string; fg: string }> = {
  matrix: { label: 'Matrix', base: '#2be873', press: '#22c462', fg: '#04140a' },
  tidal:  { label: 'Tidal',  base: '#36a8f5', press: '#1f8fda', fg: '#041421' },
  nebula: { label: 'Nebula', base: '#a98bff', press: '#8f6df2', fg: '#120a2c' },
  ember:  { label: 'Ember',  base: '#ff8a3d', press: '#f5751f', fg: '#1c0d02' },
  coral:  { label: 'Coral',  base: '#ff7080', press: '#f4515f', fg: '#220408' },
};

export const ACCENT_KEYS = Object.keys(ACCENTS) as AccentKey[];

/* Neutral surfaces + text per mode. */
const NEUTRALS: Record<Mode, Record<string, string>> = {
  dark: {
    '--bg': '#060807',
    '--bg-elev': '#0d100f',
    '--surface': '#121615',
    '--surface-2': '#181d1b',
    '--nav-bg': 'rgba(8,11,10,0.82)',
    '--skeleton': 'rgba(255,255,255,0.06)',
    '--skeleton-sheen': 'rgba(255,255,255,0.11)',
    '--hairline': 'rgba(255,255,255,0.07)',
    '--hairline-strong': 'rgba(255,255,255,0.12)',
    '--text': '#f3f6f4',
    '--text-2': '#aab2ae',
    '--text-3': '#6c736f',
    '--text-4': '#444b48',
    '--danger': '#ff6b6b',
    '--amber': '#f5b14c',
    '--scheme': 'dark',
  },
  light: {
    '--bg': '#f5f7f6',
    '--bg-elev': '#ffffff',
    '--surface': '#ffffff',
    '--surface-2': '#eef1ef',
    '--nav-bg': 'rgba(255,255,255,0.82)',
    '--skeleton': 'rgba(12,18,16,0.06)',
    '--skeleton-sheen': 'rgba(12,18,16,0.11)',
    '--hairline': 'rgba(12,18,16,0.09)',
    '--hairline-strong': 'rgba(12,18,16,0.16)',
    '--text': '#0c1210',
    '--text-2': '#4a544f',
    '--text-3': '#7e8883',
    '--text-4': '#aab2ae',
    '--danger': '#e5484d',
    '--amber': '#c97a13',
    '--scheme': 'light',
  },
};

export const DEFAULT_MODE: Mode = 'dark';
export const DEFAULT_ACCENT: AccentKey = 'matrix';
export const STORAGE_KEY = 'bettrr-theme';

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* Pure: returns every CSS var for a (mode, accent) pair. */
export function buildVars(mode: Mode, accent: AccentKey): Record<string, string> {
  const a = ACCENTS[accent] ?? ACCENTS[DEFAULT_ACCENT];
  return {
    ...NEUTRALS[mode],
    '--accent': a.base,
    '--accent-press': a.press,
    '--accent-fg': a.fg,
    '--accent-soft': hexToRgba(a.base, mode === 'light' ? 0.14 : 0.12),
    '--accent-glow': hexToRgba(a.base, mode === 'light' ? 0.22 : 0.32),
  };
}

export function applyTheme(mode: Mode, accent: AccentKey) {
  if (typeof document === 'undefined') return;
  const vars = buildVars(mode, accent);
  const root = document.documentElement;
  for (const [k, v] of Object.entries(vars)) {
    if (k === '--scheme') root.style.colorScheme = v;
    else root.style.setProperty(k, v);
  }
  root.dataset.mode = mode;
  root.dataset.accent = accent;
}

/* Inline, render-blocking script — applies the saved theme before first paint
 * so there is never a flash of the wrong palette. */
export function themeInitScript(): string {
  return `(function(){try{
    var N=${JSON.stringify(NEUTRALS)},A=${JSON.stringify(ACCENTS)};
    var raw=localStorage.getItem('${STORAGE_KEY}');var t=raw?JSON.parse(raw):{};
    var m=t.mode==='light'||t.mode==='dark'?t.mode:'${DEFAULT_MODE}';
    var k=A[t.accent]?t.accent:'${DEFAULT_ACCENT}';var a=A[k];
    function rgba(hex,al){var h=hex.replace('#','');return 'rgba('+parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16)+','+al+')';}
    var v=Object.assign({},N[m],{'--accent':a.base,'--accent-press':a.press,'--accent-fg':a.fg,'--accent-soft':rgba(a.base,m==='light'?0.14:0.12),'--accent-glow':rgba(a.base,m==='light'?0.22:0.32)});
    var r=document.documentElement;
    for(var key in v){if(key==='--scheme'){r.style.colorScheme=v[key];}else{r.style.setProperty(key,v[key]);}}
    r.dataset.mode=m;r.dataset.accent=k;
  }catch(e){}})();`;
}
