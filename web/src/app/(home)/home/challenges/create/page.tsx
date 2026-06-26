'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Lock, Globe } from 'lucide-react';
import { Btn, Banner } from '@/components/ui';
import { createChallenge } from '@/lib/api';

export default function CreateChallengePage() {
  const router = useRouter();
  const [goal, setGoal] = useState('');
  const [type, setType] = useState<'public' | 'private'>('public');
  const [betAmount, setBetAmount] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [startsInDays, setStartsInDays] = useState('1');
  const [creatorFeePercent, setCreatorFeePercent] = useState('10');
  const [creatorParticipates, setCreatorParticipates] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canCreate = goal.trim().length > 3 && Number(betAmount) >= 5;

  const handleCreate = async () => {
    if (!canCreate) return;
    setLoading(true);
    setError('');
    try {
      const startsAt = new Date(Date.now() + Number(startsInDays) * 86400000);
      const id = await createChallenge({
        goal: goal.trim(),
        type,
        betAmount: Number(betAmount),
        durationDays: Number(durationDays),
        startsAt,
        creatorFeePercent: type === 'public' ? Number(creatorFeePercent) : 0,
        creatorParticipates,
      });
      router.replace(`/home/challenges/${id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not create challenge');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px 22px 16px' }}>
      <div className="page-head">
        <Link href="/home/challenges" className="icon-btn"><ArrowLeft size={18} /></Link>
        <h1 className="page-title">New challenge</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <label style={{ display: 'block' }}>
          <span className="section-tag">Goal</span>
          <div className="field">
            <input
              style={{ flex: 1, background: 'transparent', padding: '14px 16px', fontSize: 15, color: 'var(--text)', width: '100%' }}
              placeholder="e.g. Go to the gym 20 times"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              maxLength={100}
            />
          </div>
        </label>

        <div>
          <span className="section-tag">Type</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['public', 'private'] as const).map(t => (
              <button key={t} onClick={() => setType(t)} className={type === t ? 'chip chip-active' : 'chip'} style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
                {t === 'public' ? <Globe size={13} /> : <Lock size={13} />}
                {t === 'public' ? 'Public' : 'Private'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="section-tag">Bet amount</span>
          <div className="field">
            <span style={{ paddingLeft: 16, fontSize: 16, fontWeight: 700, color: 'var(--text-3)' }}>$</span>
            <input
              style={{ flex: 1, background: 'transparent', padding: '14px 8px', fontSize: 15, color: 'var(--text)' }}
              placeholder="Minimum $5"
              value={betAmount}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9.]/g, '');
                const d = v.indexOf('.');
                setBetAmount(d === -1 ? v : v.slice(0, d + 1) + v.slice(d + 1).replace(/\./g, ''));
              }}
              inputMode="decimal"
              type="text"
            />
          </div>
        </div>

        <div>
          <span className="section-tag">Duration (days)</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {['7', '14', '30', '60'].map(d => (
              <button key={d} onClick={() => setDurationDays(d)} className={durationDays === d ? 'chip chip-active' : 'chip'} style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>{d}d</button>
            ))}
          </div>
        </div>

        <div>
          <span className="section-tag">Starts in</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {['1', '3', '7'].map(d => (
              <button key={d} onClick={() => setStartsInDays(d)} className={startsInDays === d ? 'chip chip-active' : 'chip'} style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
                {d === '1' ? 'Tomorrow' : `${d} days`}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>I&apos;m participating</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Your bet is also locked in</p>
          </div>
          <button
            onClick={() => setCreatorParticipates(v => !v)}
            style={{ width: 46, height: 26, borderRadius: 13, background: creatorParticipates ? 'var(--accent)' : 'var(--surface-2)', transition: 'background .15s', position: 'relative', flexShrink: 0 }}
          >
            <div style={{ width: 20, height: 20, borderRadius: 10, background: creatorParticipates ? '#04140a' : 'var(--text-3)', position: 'absolute', top: 3, left: creatorParticipates ? 23 : 3, transition: 'left .15s' }} />
          </button>
        </div>

        {type === 'public' && (
          <div>
            <span className="section-tag">Creator fee</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {['0', '5', '10', '15'].map(f => (
                <button key={f} onClick={() => setCreatorFeePercent(f)} className={creatorFeePercent === f ? 'chip chip-active' : 'chip'} style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>{f}%</button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>Taken from the pot before winners are paid out.</p>
          </div>
        )}

        <Banner msg={error} />

        <Btn onClick={handleCreate} disabled={!canCreate} loading={loading}>
          Create challenge <ArrowRight size={18} />
        </Btn>
      </div>
    </div>
  );
}
