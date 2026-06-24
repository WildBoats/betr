'use client';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

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