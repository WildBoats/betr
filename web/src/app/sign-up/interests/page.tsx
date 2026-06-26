'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Dumbbell, ChefHat, BookOpen, Brain, Wallet, Music,
  Camera, Leaf, Palette, Code, Footprints, Moon, Check, ChevronRight,
} from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Screen, Item, Btn, Banner, StepBar } from '@/components/ui';
import { signUpStore } from '@/lib/signUpStore';
import { supabase } from '@/lib/supabase';

const INTERESTS = [
  { id: 'fitness', label: 'Fitness', Icon: Dumbbell },
  { id: 'cooking', label: 'Cooking', Icon: ChefHat },
  { id: 'reading', label: 'Reading', Icon: BookOpen },
  { id: 'mindfulness', label: 'Mindfulness', Icon: Brain },
  { id: 'finance', label: 'Finance', Icon: Wallet },
  { id: 'music', label: 'Music', Icon: Music },
  { id: 'photography', label: 'Photography', Icon: Camera },
  { id: 'nutrition', label: 'Nutrition', Icon: Leaf },
  { id: 'art', label: 'Art', Icon: Palette },
  { id: 'coding', label: 'Coding', Icon: Code },
  { id: 'running', label: 'Running', Icon: Footprints },
  { id: 'sleep', label: 'Sleep', Icon: Moon },
];

export default function InterestsStep() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(signUpStore.interests);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!signUpStore.emailVerified || !signUpStore.firstName) router.replace('/sign-up/email');
  }, [router]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const canCreate = selected.length >= 1;

  const handleCreate = async () => {
    if (!canCreate) return;
    setLoading(true);
    setMsg('');
    signUpStore.interests = selected;

    const { firstName, lastName, username, email, password } = signUpStore;
    const displayName = lastName ? `${firstName} ${lastName}` : firstName;
    const initials = ((firstName[0] ?? '') + (lastName[0] ?? firstName[1] ?? '')).toUpperCase();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: displayName, username, initials, interests: selected } },
    });

    signUpStore.password = '';

    if (error) {
      // Demo-friendly fallback: still let the user into the app if Supabase isn't wired up.
      setLoading(false);
      router.replace('/home');
      return;
    }

    if (!data.session) {
      setLoading(false);
      setOk(true);
      setMsg(`Almost there — confirm via the link sent to ${email}.`);
      return;
    }

    router.replace('/home');
  };

  return (
    <Screen>
      <Item style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <BackButton href="/sign-up/profile" />
        <div style={{ flex: 1, marginLeft: 14 }}><StepBar step={4} total={4} /></div>
      </Item>

      <motion.h1
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="font-display text-balance" style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.1 }}
      >
        What are you into?
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
        style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.5, marginTop: 10, marginBottom: 22 }}
      >
        Pick a few so we can fill your feed with challenges you&apos;ll actually want to join.
      </motion.p>

      <motion.div
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035, delayChildren: 0.1 } } }}
        className="no-scrollbar"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, overflowY: 'auto', paddingBottom: 8 }}
      >
        {INTERESTS.map(({ id, label, Icon }) => {
          const active = selected.includes(id);
          return (
            <motion.button
              key={id}
              onClick={() => toggle(id)}
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '16px 14px',
                borderRadius: 16, textAlign: 'left',
                background: active ? 'var(--accent-soft)' : 'var(--surface)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--hairline)'}`,
                transition: 'background 0.16s ease, border-color 0.16s ease',
              }}
            >
              <span style={{ display: 'flex', color: active ? 'var(--accent)' : 'var(--text-2)' }}>
                <Icon size={22} />
              </span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: active ? 'var(--text)' : 'var(--text-2)' }}>{label}</span>
              {active && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Check size={13} color="var(--accent-fg)" strokeWidth={3} />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      <Item style={{ marginTop: 12 }}><Banner msg={msg} ok={ok} /></Item>

      <div style={{ paddingTop: 14 }}>
        <Btn onClick={handleCreate} disabled={!canCreate} loading={loading}>
          {selected.length > 0 ? `Create account · ${selected.length} selected` : 'Pick at least one'}
          {canCreate && <ChevronRight size={18} />}
        </Btn>
      </div>
    </Screen>
  );
}
