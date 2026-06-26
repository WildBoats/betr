'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

export default function DepositSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace('/home/wallet'), 4000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="app-frame">
      <div className="aurora" />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>
        <div className="avatar avatar-accent" style={{ width: 72, height: 72, marginBottom: 22 }}>
          <Check size={32} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)', marginBottom: 10 }} className="glow-text">Deposit successful</h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 28, maxWidth: 280 }}>
          Your funds will appear in your wallet within a few minutes.
        </p>
        <Link href="/home/wallet" className="btn btn-accent" style={{ width: 'auto', padding: '0 32px', textDecoration: 'none' }}>
          Go to wallet <ArrowRight size={18} />
        </Link>
        <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 18 }}>Redirecting automatically...</p>
      </div>
    </main>
  );
}
