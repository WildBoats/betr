'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { Btn, Banner } from '@/components/ui';
import { Challenge, Participant, Profile, getChallengeById, getChallengeParticipants, getMyProfile, getMyVotes, submitVotes } from '@/lib/api';

function Spinner() {
  return <span style={{ display: 'inline-block', width: 22, height: 22, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />;
}

function VoteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const challengeId = searchParams.get('challenge') ?? '';

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [me, setMe] = useState<Profile | null>(null);
  const [votes, setVotes] = useState<Record<string, 'passing' | 'failing'>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!challengeId) { router.replace('/home/challenges'); return; }
    Promise.all([
      getChallengeById(challengeId),
      getChallengeParticipants(challengeId),
      getMyProfile(),
      getMyVotes(challengeId),
    ]).then(([c, p, m, existingVotes]) => {
      setChallenge(c);
      setParticipants(p);
      setMe(m);
      setVotes(Object.fromEntries(
        Object.entries(existingVotes).map(([id, passed]) => [id, passed ? 'passing' : 'failing'])
      ) as Record<string, 'passing' | 'failing'>);
      if (Object.keys(existingVotes).length > 0) setSubmitted(true);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [challengeId, router]);

  const others = participants.filter(p => p.user_id !== me?.id);
  const allVoted = others.length > 0 && others.every(p => votes[p.user_id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setErr('');
    try {
      await submitVotes(challengeId, votes);
      setSubmitted(true);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Could not submit votes');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><Spinner /></div>;
  }

  return (
    <>
      <div className="page-head">
        <button onClick={() => router.back()} className="icon-btn"><ArrowLeft size={18} /></button>
        <h1 className="page-title">Cast votes</h1>
      </div>

      {challenge && (
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="status-pill status-voting" style={{ marginBottom: 8 }}><span className="dot" />Voting open</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 }}>{challenge.goal}</p>
        </div>
      )}

      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16, lineHeight: 1.5 }}>
        Vote on whether each participant completed the challenge. Winners are decided by majority vote.
      </p>

      {submitted && (
        <div style={{ background: 'var(--accent-soft)', borderRadius: 14, padding: 14, border: '1px solid var(--accent)', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Check size={15} /> Votes submitted. You can update them below.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {others.map(p => {
          const vote = votes[p.user_id];
          return (
            <div key={p.user_id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div className="avatar" style={{ width: 34, height: 34, fontSize: 11 }}>{p.profiles.initials}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)' }}>{p.profiles.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.profiles.username}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setVotes(v => ({ ...v, [p.user_id]: 'passing' }))}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: vote === 'passing' ? 'var(--accent-soft)' : 'var(--bg-elev)',
                    border: `1.5px solid ${vote === 'passing' ? 'var(--accent)' : 'var(--hairline)'}`,
                    color: vote === 'passing' ? 'var(--accent)' : 'var(--text-3)',
                    fontSize: 13, fontWeight: 700,
                  }}
                >
                  <Check size={15} /> Completed
                </button>
                <button
                  onClick={() => setVotes(v => ({ ...v, [p.user_id]: 'failing' }))}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: vote === 'failing' ? 'rgba(255,107,107,0.1)' : 'var(--bg-elev)',
                    border: `1.5px solid ${vote === 'failing' ? 'var(--danger)' : 'var(--hairline)'}`,
                    color: vote === 'failing' ? 'var(--danger)' : 'var(--text-3)',
                    fontSize: 13, fontWeight: 700,
                  }}
                >
                  <X size={15} /> Did not
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Banner msg={err} />

      <Btn onClick={handleSubmit} disabled={!allVoted} loading={submitting}>
        {submitted ? 'Update votes' : 'Submit votes'} <ArrowRight size={18} />
      </Btn>

      {!allVoted && (
        <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 10 }}>Vote on all participants to submit.</p>
      )}
    </>
  );
}

export default function VotePage() {
  return (
    <main className="app-frame">
      <div className="aurora" />
      <div style={{ position: 'relative', zIndex: 1, padding: '20px 22px 40px', minHeight: '100dvh' }}>
        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><Spinner /></div>}>
          <VoteContent />
        </Suspense>
      </div>
    </main>
  );
}
