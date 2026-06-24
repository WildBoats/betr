'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Screen, Stagger, Item, Btn, Banner, StepBar } from '@/components/ui';
import { signUpStore } from '@/lib/signUpStore';

const LEN = 6;

export default function VerifyStep() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(''));
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [seconds, setSeconds] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!signUpStore.email) router.replace('/sign-up/email');
    refs.current[0]?.focus();
  }, [router]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const code = digits.join('');
  const complete = code.length === LEN;

  const setAt = (i: number, v: string) => {
    const clean = v.replace(/\D/g, '');
    setMsg('');
    if (clean.length > 1) {
      // pasted
      const arr = clean.slice(0, LEN).split('');
      const next = Array(LEN).fill('').map((_, idx) => arr[idx] ?? '');
      setDigits(next);
      refs.current[Math.min(arr.length, LEN - 1)]?.focus();
      return;
    }
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handleVerify = () => {
    if (!complete) return;
    setLoading(true);
    setMsg('');
    setTimeout(() => {
      setLoading(false);
      signUpStore.emailVerified = true;
      router.push('/sign-up/profile');
    }, 800);
  };

  return (
    <Screen>
      <Stagger style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Item style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <BackButton href="/sign-up/email" />
          <div style={{ flex: 1, marginLeft: 14 }}><StepBar step={2} total={4} /></div>
        </Item>

        <Item>
          <h1 className="font-display text-balance" style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.1 }}>
            Check your inbox
          </h1>
        </Item>
        <Item>
          <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.5, marginTop: 10, marginBottom: 30 }}>
            Enter the 6-digit code we sent to{' '}
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{signUpStore.email || 'your email'}</span>.
          </p>
        </Item>

        <Item>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
            {digits.map((d, i) => (
              <motion.input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                value={d}
                onChange={(e) => setAt(i, e.target.value)}
                onKeyDown={(e) => onKey(i, e)}
                inputMode="numeric"
                maxLength={LEN}
                className={`otp-cell ${d ? 'otp-cell-filled' : ''}`}
                animate={d ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>
        </Item>

        <Item style={{ marginTop: 16 }}><Banner msg={msg} /></Item>

        <Item style={{ marginTop: 18 }}>
          {seconds > 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>
              Resend code in <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{seconds}s</span>
            </p>
          ) : (
            <button onClick={() => { setSeconds(30); setMsg('Code resent.'); }} style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', width: '100%', textAlign: 'center' }}>
              Resend code
            </button>
          )}
        </Item>

        <div style={{ flex: 1 }} />

        <Item>
          <Btn onClick={handleVerify} disabled={!complete} loading={loading}>
            Verify <ChevronRight size={18} />
          </Btn>
        </Item>
      </Stagger>
    </Screen>
  );
}