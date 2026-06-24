'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ChevronRight, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { signUpStore } from '@/lib/signUpStore';

type Phase = 'splash' | 'welcome';

export default function Landing() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('splash');
  const [moreOpen, setMoreOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/home');
    }).catch(() => {});
    const t = setTimeout(() => setPhase('welcome'), 2100);
    return () => clearTimeout(t);
  }, [router]);

  const goEmail = () => {
    signUpStore.email = '';
    signUpStore.emailVerified = false;
    router.push('/sign-up/email');
  };

  return (
    <main className="app-frame" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="aurora" />

      <AnimatePresence mode="wait">
        {phase === 'splash' ? (
          <motion.div
            key="splash"
            exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-display glow-text"
              style={{ fontSize: 68, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}
            >
              Bett<span style={{ color: 'var(--accent)' }}>rr</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 70 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{ height: 2, background: 'var(--accent)', borderRadius: 2, margin: '22px 0 16px' }}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="eyebrow"
            >
              Bet on yourself
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100dvh', padding: '0 22px 28px' }}
          >
            {/* Hero */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 40 }}
            >
              <Reveal>
                <div className="font-display glow-text" style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1.5 }}>
                  Bett<span style={{ color: 'var(--accent)' }}>rr</span>
                </div>
              </Reveal>
              <Reveal>
                <h1 className="font-display text-balance" style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1.8, lineHeight: 1.05, marginTop: 18 }}>
                  Put skin in<br />the game.
                </h1>
              </Reveal>
              <Reveal>
                <p className="text-balance" style={{ color: 'var(--text-2)', fontSize: 16, lineHeight: 1.55, marginTop: 16, maxWidth: 320 }}>
                  Join real-life challenges, back yourself with real money, and win your share of the pot.
                </p>
              </Reveal>
            </motion.div>

            {/* Auth actions */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.35 } } }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <Reveal>
                <ProviderButton onClick={() => router.push('/home')} icon={<GoogleIcon />} label="Continue with Google" />
              </Reveal>
              <Reveal>
                <motion.button whileTap={{ scale: 0.97 }} onClick={goEmail} className="btn btn-accent">
                  <Mail size={19} /> Continue with email
                </motion.button>
              </Reveal>

              <AnimatePresence initial={false}>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 12 }}
                  >
                    <div style={{ height: 12 }} />
                    <ProviderButton onClick={() => router.push('/home')} icon={<AppleIcon />} label="Continue with Apple" />
                    <ProviderButton onClick={() => router.push('/home')} icon={<FacebookIcon />} label="Continue with Facebook" />
                  </motion.div>
                )}
              </AnimatePresence>

              <Reveal>
                <button
                  onClick={() => setMoreOpen((v) => !v)}
                  style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)', padding: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' }}
                >
                  {moreOpen ? 'Fewer options' : 'More options'}
                  <motion.span animate={{ rotate: moreOpen ? 45 : 0 }} style={{ display: 'inline-flex' }}><Plus size={14} /></motion.span>
                </button>
              </Reveal>

              <Reveal>
                <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', marginTop: 4 }}>
                  Already have an account?{' '}
                  <a href="/sign-in" style={{ color: 'var(--accent)', fontWeight: 700 }}>Sign in</a>
                </p>
              </Reveal>

              <Reveal>
                <button
                  onClick={() => setCodeOpen(true)}
                  style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', textAlign: 'center', width: '100%', padding: '10px 0', textDecoration: 'underline', textUnderlineOffset: 3 }}
                >
                  Have a game code? Enter it
                </button>
              </Reveal>

              <Reveal>
                <p style={{ fontSize: 11, color: 'var(--text-4)', textAlign: 'center', lineHeight: 1.5, marginTop: 2 }}>
                  By continuing you agree to our Terms of Service &amp; Privacy Policy
                </p>
              </Reveal>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game code sheet */}
      <AnimatePresence>
        {codeOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCodeOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 440, zIndex: 41, background: 'var(--bg-elev)', borderTopLeftRadius: 26, borderTopRightRadius: 26, border: '1px solid var(--hairline)', padding: '20px 22px 32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>Enter game code</h3>
                <button onClick={() => setCodeOpen(false)} aria-label="Close" style={{ color: 'var(--text-3)' }}><X size={22} /></button>
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 16 }}>Got invited to a challenge? Drop the code to jump straight in.</p>
              <div className="field" style={{ marginBottom: 14 }}>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. PUSH50"
                  style={{ flex: 1, background: 'transparent', padding: '16px', color: 'var(--text)', fontSize: 18, fontWeight: 700, letterSpacing: 3, textAlign: 'center' }}
                />
              </div>
              <motion.button whileTap={{ scale: 0.97 }} disabled={!code.trim()} onClick={goEmail} className="btn btn-accent">
                Find challenge <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }}>
      {children}
    </motion.div>
  );
}

function ProviderButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} className="btn btn-surface">
      {icon} {label}
    </motion.button>
  );
}

function GoogleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="var(--text)" aria-hidden="true">
      <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.15-.46 7.81 1.3 10.37.86 1.25 1.88 2.66 3.22 2.61 1.29-.05 1.78-.83 3.34-.83 1.55 0 2 .83 3.36.81 1.39-.03 2.27-1.28 3.12-2.54.98-1.46 1.39-2.87 1.41-2.94-.03-.01-2.71-1.04-2.74-4.13zM14.6 4.5c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12a12 12 0 1 0-13.88 11.86v-8.39H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87V12h3.33l-.53 3.47h-2.8v8.39A12 12 0 0 0 24 12z" />
    </svg>
  );
}