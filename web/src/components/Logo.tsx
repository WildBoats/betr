const sizes = { sm: 22, md: 30, lg: 46, xl: 64 };

export default function Logo({ size = 'md', glow = false }: { size?: keyof typeof sizes; glow?: boolean }) {
  const fs = sizes[size];
  return (
    <span
      className={`font-display ${glow ? 'glow-text' : ''}`}
      style={{ fontSize: fs, fontWeight: 800, letterSpacing: -1.5, color: 'var(--text)', lineHeight: 1.05 }}
    >
      Bett<span style={{ color: 'var(--accent)' }}>rr</span>
    </span>
  );
}