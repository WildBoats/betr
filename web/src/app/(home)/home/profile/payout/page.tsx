'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Trophy } from 'lucide-react';
import { Btn } from '@/components/ui';
import { Challenge, getChallengeById, processPayout } from '@/lib/api';

function Spinner() {
  return <span style={{ display: 'inline-block', width: 22, height: 22, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />;
}

function PayoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const challengeId = searchParams.get('challenge') ?? '';

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!challengeId) { router.replace('/home/challenges'); return; }
    processPayout(challengeId).catch(() => {});
    getChallengeById(challengeId).then(c => setChallenge(c)).catch(() => {}).finally(() => setLoading(false));
  }, [challengeId, router]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '70px 0' }}><Spinner /></div>;
  }

  const creatorFee = challenge ? (challenge.pot * challenge.creator_fee_percent) / 100 : 0;
  const netPot = challenge ? challenge.pot - creatorFee : 0;

  return (
    <>
      <div className="page-head">
        <button onClick={() => router.back()} className="icon-btn"><ArrowLeft size={18} /></button>
        <h1 className="page-title">Payout</h1>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '32px 16px', marginBottom: 16 }}>
        <div className="avatar avatar-accent" style={{ width: 68, height: 68, margin: '0 auto 16px' }}>
          <Trophy size={28} />
        </div>
        <p className="section-tag" style={{ marginBottom: 8 }}>Challenge complete</p>
        <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)', marginBottom: 8 }} className="glow-text">You won!</p>
        {challenge && <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.4 }}>{challenge.goal}</p>}
      </div>

      {challenge && (
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="section-tag">Breakdown</p>
          {[
            ['Total pot', `$${challenge.pot.toFixed(2)}`],
            ...(creatorFee > 0 ? [['Creator fee (' + challenge.creator_fee_percent + '%)', `−$${creatorFee.toFixed(2)}`]] : []),
            ['Net pot', `$${netPot.toFixed(2)}`],
          ].map(([label, value], i, arr) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: i === arr.length - 1 ? 'var(--accent)' : 'var(--text-2)' }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 10 }}>
        <Btn onClick={() => router.push('/home/wallet')}>Withdraw to bank <ArrowRight size={18} /></Btn>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Btn variant="surface" onClick={() => router.push('/home/wallet')}>Keep in wallet</Btn>
      </div>

      <Link href="/home/challenges" style={{ display: 'block', textAlign: 'center', fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>
        Start a new challenge
      </Link>
    </>
  );
}

export default function PayoutPage() {
  return (
    <div style={{ padding: '20px 22px 16px' }}>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '70px 0' }}><Spinner /></div>}>
        <PayoutContent />
      </Suspense>
    </div>
  );
}
