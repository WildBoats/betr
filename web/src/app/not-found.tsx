import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="app-frame">
      <div className="aurora" />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
        <p style={{ fontSize: 56, fontWeight: 900, color: 'var(--accent)', lineHeight: 1, marginBottom: 14 }} className="glow-text">404</p>
        <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Page not found</p>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 32 }}>This page doesn&apos;t exist or was moved.</p>
        <Link href="/" className="btn btn-accent" style={{ width: 'auto', padding: '0 32px', textDecoration: 'none' }}>
          Go home
        </Link>
      </div>
    </main>
  );
}
