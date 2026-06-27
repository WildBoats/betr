'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

/* ---------- Skeleton primitives (shimmer placeholders) ---------- */
export function Skeleton({ w, h = 12, r = 8, style }: { w?: number | string; h?: number | string; r?: number; style?: CSSProperties }) {
  return <span className="skel" style={{ display: 'block', width: w ?? '100%', height: h, borderRadius: r, ...style }} />;
}

/** Placeholder that mirrors the challenge card layout used across the app. */
export function SkeletonCard() {
  return (
    <div className="card" style={{ display: 'block' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Skeleton w={58} h={20} r={999} />
        <Skeleton w={64} h={20} r={999} />
      </div>
      <Skeleton w="80%" h={15} style={{ marginBottom: 8 }} />
      <Skeleton w="55%" h={15} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2, 3].map(i => <Skeleton key={i} h={48} r={12} />)}
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

/* ---------- Unified empty state ---------- */
export function EmptyState({ icon, title, subtitle, action }: { icon?: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="card"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8, padding: '32px 24px' }}
    >
      {icon && (
        <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-soft)', color: 'var(--accent)', marginBottom: 2 }}>
          {icon}
        </div>
      )}
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5, maxWidth: 260 }}>{subtitle}</p>}
      {action && <div style={{ marginTop: 6 }}>{action}</div>}
    </motion.div>
  );
}

/* ---------- Circular progress ring (SVG, themed) ---------- */
export function ProgressRing({ value, size = 46, stroke = 4, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const clamped = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--hairline-strong)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - clamped) }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

/* ---------- Page shell with ambient aurora ---------- */
export function Screen({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return (
    <main className="app-frame" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="aurora" />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 22px 32px',
          minHeight: '100dvh',
          justifyContent: center ? 'center' : 'flex-start',
        }}
      >
        {children}
      </div>
    </main>
  );
}

/* ---------- Staggered fade/slide-up container ---------- */
export function Stagger({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function Item({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Animated primary / surface buttons ---------- */
interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'accent' | 'surface';
  type?: 'button' | 'submit';
}

export function Btn({ children, onClick, disabled, loading, variant = 'accent', type = 'button' }: BtnProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`btn ${variant === 'accent' ? 'btn-accent' : 'btn-surface'}`}
    >
      {loading ? (
        <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      ) : (
        children
      )}
    </motion.button>
  );
}

/* ---------- Animated text field ---------- */
export function Field({
  label, value, onChange, placeholder, type = 'text', right, onKeyDown, autoComplete, inputMode,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  right?: ReactNode;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'numeric';
}) {
  return (
    <label style={{ display: 'block', width: '100%' }}>
      {label && <div className="eyebrow" style={{ marginBottom: 8, fontSize: 10 }}>{label}</div>}
      <div className="field" style={{ overflow: 'hidden' }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          onKeyDown={onKeyDown}
          autoComplete={autoComplete}
          inputMode={inputMode}
          style={{ flex: 1, background: 'transparent', padding: '16px 16px', color: 'var(--text)', fontSize: 16, fontWeight: 500, width: '100%' }}
        />
        {right && <div style={{ paddingRight: 14, flexShrink: 0 }}>{right}</div>}
      </div>
    </label>
  );
}

/* ---------- Step progress bar ---------- */
export function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, width: '100%' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="progress-track" style={{ flex: 1 }}>
          <motion.div
            className="progress-fill"
            initial={false}
            animate={{ width: i < step ? '100%' : '0%' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: '100%' }}
          />
        </div>
      ))}
    </div>
  );
}

/* ---------- Message banner ---------- */
export function Banner({ msg, ok }: { msg: string; ok?: boolean }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            overflow: 'hidden',
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.4,
            color: ok ? 'var(--accent)' : 'var(--danger)',
            textAlign: 'center',
          }}
        >
          <div style={{ padding: '4px 0' }}>{msg}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
