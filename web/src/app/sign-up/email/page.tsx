'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, Mail } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Screen, Stagger, Item, Btn, Field, Banner, StepBar } from '@/components/ui';
import { signUpStore } from '@/lib/signUpStore';

export default function EmailStep() {
  const router = useRouter();
  const [email, setEmail] = useState(signUpStore.email);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleContinue = async () => {
    if (!valid) return;
    setLoading(true);
    setMsg('');
    signUpStore.email = email.trim();
    // Demo flow: skip real OTP send and move to verification screen.
    setTimeout(() => {
      setLoading(false);
      router.push('/sign-up/verify');
    }, 700);
  };

  return (
    <Screen>
      <Stagger style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Item style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <BackButton href="/" />
          <div style={{ flex: 1, marginLeft: 14 }}><StepBar step={1} total={4} /></div>
        </Item>

        <Item>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--accent-soft)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: 20 }}>
            <Mail size={24} />
          </div>
        </Item>

        <Item>
          <h1 className="font-display text-balance" style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.1 }}>
            What&apos;s your email?
          </h1>
        </Item>
        <Item>
          <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.5, marginTop: 10, marginBottom: 28 }}>
            We&apos;ll send you a 6-digit code to confirm it&apos;s really you.
          </p>
        </Item>

        <Item>
          <Field
            label="Email address"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            type="email"
            inputMode="email"
            autoComplete="email"
            onKeyDown={(e) => e.key === 'Enter' && valid && !loading && handleContinue()}
          />
        </Item>

        <Item style={{ marginTop: 10 }}><Banner msg={msg} /></Item>

        <div style={{ flex: 1 }} />

        <Item>
          <Btn onClick={handleContinue} disabled={!valid} loading={loading}>
            Send code <ChevronRight size={18} />
          </Btn>
        </Item>
        <Item>
          <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', marginTop: 16 }}>
            Already have an account?{' '}
            <a href="/sign-in" style={{ color: 'var(--accent)', fontWeight: 700 }}>Sign in</a>
          </p>
        </Item>
      </Stagger>
    </Screen>
  );
}