'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Screen, Stagger, Item, Btn, Field, Banner } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) return;
    setLoading(true);
    setMsg('');
    setOk(false);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) { setMsg(error.message); return; }
    router.replace('/home');
  };

  const handleForgot = async () => {
    if (!email.trim()) { setMsg('Enter your email first'); setOk(false); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setOk(!error);
    setMsg(error ? error.message : `Reset link sent to ${email.trim()}`);
  };

  return (
    <Screen>
      <Stagger style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Item style={{ marginBottom: 28 }}>
          <BackButton href="/" />
        </Item>

        <Item>
          <div className="font-display glow-text" style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1.5, marginBottom: 18 }}>
            Bett<span style={{ color: 'var(--accent)' }}>rr</span>
          </div>
        </Item>
        <Item>
          <h1 className="font-display text-balance" style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.1 }}>
            Welcome back
          </h1>
        </Item>
        <Item>
          <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.5, marginTop: 10, marginBottom: 28 }}>
            Sign in to pick up your challenges and check your pots.
          </p>
        </Item>

        <Item style={{ marginBottom: 12 }}>
          <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" inputMode="email" autoComplete="email" />
        </Item>
        <Item style={{ marginBottom: 12 }}>
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSignIn()}
            right={
              <button onClick={() => setShow((v) => !v)} aria-label="Toggle password" style={{ color: 'var(--text-3)', display: 'flex' }}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </Item>

        <Item style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
          <button onClick={handleForgot} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)' }}>
            Forgot password?
          </button>
        </Item>

        <Item><Banner msg={msg} ok={ok} /></Item>

        <div style={{ flex: 1, minHeight: 16 }} />

        <Item>
          <Btn onClick={handleSignIn} loading={loading} disabled={!email || !password}>
            Sign in <ChevronRight size={18} />
          </Btn>
        </Item>
        <Item>
          <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', marginTop: 16 }}>
            New to Bettrr?{' '}
            <a href="/" style={{ color: 'var(--accent)', fontWeight: 700 }}>Get started</a>
          </p>
        </Item>
      </Stagger>
    </Screen>
  );
}