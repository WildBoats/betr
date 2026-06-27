'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/**
 * OAuth return target. Providers redirect here after the user authorizes.
 * - PKCE flow: exchange the `?code=` for a session.
 * - Implicit flow: detectSessionInUrl (set in lib/supabase) auto-parses the hash.
 * Either way we then route to /home, or back to the landing page on failure.
 */
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      router.replace(ok ? '/home' : '/?auth=failed');
    };

    (async () => {
      try {
        if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
          await supabase.auth.exchangeCodeForSession(window.location.href);
        }
        const { data: { session } } = await supabase.auth.getSession();
        finish(!!session);
      } catch {
        finish(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) finish(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  return (
    <main className="app-frame" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
      <span style={{ width: 24, height: 24, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </main>
  );
}
