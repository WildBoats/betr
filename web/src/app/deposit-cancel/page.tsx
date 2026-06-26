'use client';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function DepositCancelPage() {
  return (
    <main className="app-frame">
      <div className="aurora" />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>
        <div className="avatar" style={{ width: 72, height: 72, marginBottom: 22, color: 'var(--danger)', borderColor: 'rgba(255,107,107,0.4)' }}>
          <X size={32} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>Deposit cancelled</h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 28, maxWidth: 280 }}>
          No funds were charged. You can try again whenever you&apos;re ready.
        </p>
        <Link href="/home/wallet" className="btn btn-surface" style={{ width: 'auto', padding: '0 32px', textDecoration: 'none' }}>
          Back to wallet
        </Link>
      </div>
    </main>
  );
}
