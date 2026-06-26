'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { supabase } from '@/lib/supabase';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!session) router.replace('/');
        else setReady(true);
      })
      .catch(() => router.replace('/'));
  }, [router]);

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', background: 'var(--bg)' }}>
        <span style={{ display: 'inline-block', width: 22, height: 22, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="app-frame">
      <div className="aurora" />
      <main style={{ position: 'relative', zIndex: 1, paddingBottom: 88, minHeight: '100dvh' }}>{children}</main>
      <Nav />
    </div>
  );
}
