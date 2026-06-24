'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, ChevronRight } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Screen, Stagger, Item, Btn, Field, Banner, StepBar } from '@/components/ui';
import { signUpStore } from '@/lib/signUpStore';

export default function ProfileStep() {
  const router = useRouter();
  const [firstName, setFirstName] = useState(signUpStore.firstName);
  const [lastName, setLastName] = useState(signUpStore.lastName);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!signUpStore.emailVerified) router.replace('/sign-up/email');
  }, [router]);

  const lenOk = password.length >= 8;
  const numOk = /\d/.test(password);
  const matchOk = confirm.length > 0 && password === confirm;
  const canContinue = firstName.trim().length > 0 && lenOk && numOk && matchOk;

  const handleContinue = () => {
    if (!canContinue) return;
    signUpStore.firstName = firstName.trim();
    signUpStore.lastName = lastName.trim();
    signUpStore.username = (firstName.trim().toLowerCase() + (lastName.trim()[0] ?? '')).replace(/[^a-z0-9_]/g, '');
    signUpStore.password = password;
    router.push('/sign-up/interests');
  };

  return (
    <Screen>
      <Stagger style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Item style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <BackButton href="/sign-up/verify" />
          <div style={{ flex: 1, marginLeft: 14 }}><StepBar step={3} total={4} /></div>
        </Item>

        <Item>
          <h1 className="font-display text-balance" style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.1 }}>
            Create your profile
          </h1>
        </Item>
        <Item>
          <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.5, marginTop: 10, marginBottom: 26 }}>
            Tell us your name and set a password to secure your account.
          </p>
        </Item>

        <Item style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <Field label="First name" value={firstName} onChange={setFirstName} placeholder="Jake" />
          <Field label="Last name" value={lastName} onChange={setLastName} placeholder="Rivera" />
        </Item>

        <Item style={{ marginBottom: 12 }}>
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Min. 8 characters"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            right={
              <button onClick={() => setShow((v) => !v)} aria-label="Toggle password" style={{ color: 'var(--text-3)', display: 'flex' }}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </Item>

        <Item style={{ marginBottom: 14 }}>
          <Field
            label="Confirm password"
            value={confirm}
            onChange={setConfirm}
            placeholder="Re-enter password"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            right={confirm.length > 0 ? (
              <Check size={18} color={matchOk ? 'var(--accent)' : 'var(--text-4)'} />
            ) : null}
          />
        </Item>

        <Item style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Req ok={lenOk} label="8+ characters" />
          <Req ok={numOk} label="1 number" />
          <Req ok={matchOk} label="Passwords match" />
        </Item>

        <div style={{ flex: 1, minHeight: 24 }} />

        <Item>
          <Btn onClick={handleContinue} disabled={!canContinue}>
            Continue <ChevronRight size={18} />
          </Btn>
        </Item>
      </Stagger>
    </Screen>
  );
}

function Req({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: ok ? 'var(--accent)' : 'var(--text-3)' }}>
      <span style={{ width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: ok ? 'var(--accent-soft)' : 'var(--surface-2)' }}>
        <Check size={10} color={ok ? 'var(--accent)' : 'var(--text-4)'} />
      </span>
      {label}
    </span>
  );
}