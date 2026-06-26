'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Lock, Globe, Check, X, Trophy } from 'lucide-react';
import { Btn, Banner } from '@/components/ui';
import {
  Challenge, Participant, Profile,
  daysLeft, effectiveStatus,
  getChallengeById, getChallengeParticipants, joinChallenge, getMyProfile,
} from '@/lib/api';

function StatusPill({ status }: { status: string }) {
  const cls = status === 'voting' ? 'status-voting' : (status === 'pending' || status === 'cancelled') ? 'status-soon' : 'status-live';
  const label = status === 'voting' ? 'Voting' : status === 'pending' ? 'Soon' : status === 'completed' ? 'Done' : status === 'cancelled' ? 'Cancelled' : 'Live';
  return <span className={`status-pill ${cls}`}><span className="dot" />{label}</span>;
}

export default function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [me, setMe] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [err, setErr] = useState('');

 useEffect(() => {
    Promise.all([getChallengeById(id), getChallengeParticipants(id), getMyProfile()])
      .then(([c, p, m]) => { setChallenge(c); setParticipants(p); setMe(m); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const status = challenge ? effectiveStatus(challenge) : '';
  const myParticipant = me ? participants.find(p => p.user_id === me.id) : undefined;
  const amParticipant = !!myParticipant;
  const amCreator = me && challenge ? me.id === challenge.creator_id : false;

  const handleJoin = async () => {
    setJoining(true);
    setErr('');
    try {
      await joinChallenge(id);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Could not join');
      setJoining(false);
      return;
    }
    try {
           const [c, p] = await Promise.all([getChallengeById(id), getChallengeParticipants(id)]);
      setChallenge(c);
      setParticipants(p);
    } catch { /* join succeeded; refresh failed */ }
    setJoining(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '70px 0' }}><span style={{ display: 'inline-block', width: 22, height: 22, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /></div>;
  }

  if (!challenge) {
    return (
      <div style={{ padding: '24px 22px' }}>
        <p style={{ color: 'var(--text-3)', textAlign: 'center' }}>Challenge not found.</p>
        <Link href="/home/challenges" style={{ display: 'block', textAlign: 'center', color: 'var(--accent)', marginTop: 14, fontWeight: 700 }}>Back to challenges</Link>
      </div>
    );
  }

  const left = daysLeft(challenge.ends_at);

  return (
    <div style={{ padding: '20px 22px 16px' }}>
      <div className="page-head">
        <button onClick={() => router.back()} className="icon-btn"><ArrowLeft size={18} /></button>
        <h1 className="page-title" style={{ flex: 1, fontSize: 20 }}>Challenge</h1>
        {amCreator && challenge.type === 'private' && (status === 'pending' || status === 'live') && (
          <Link href={`/home/challenges/${id}/invite`} style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Invite</Link>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <StatusPill status={status} />
          <span className="meta-chip">{challenge.type === 'private' ? <Lock size={11} /> : <Globe size={11} />}{challenge.type === 'private' ? 'Private' : 'Public'}</span>
        </div>
        <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 16, lineHeight: 1.4 }}>{challenge.goal}</p>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['$' + challenge.pot.toFixed(0), 'Pot'], ['$' + challenge.bet_amount.toFixed(0), 'Bet'], [left + 'd', 'Left'], [String(challenge.participant_count), 'Players']].map(([v, l]) => (
            <div key={l} className="stat-box"><span className="stat-val">{v}</span><span className="stat-lbl">{l}</span></div>
          ))}
        </div>
      </div>

      <span className="section-tag">Participants</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
        {participants.length === 0 ? (
          <p style={{ color: 'var(--text-3)', fontSize: 13, padding: '12px 0' }}>No participants yet.</p>
        ) : (
          participants.map((p, i) => (
            <div key={p.user_id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', width: 18 }}>#{i + 1}</span>
              <div className={`avatar ${p.user_id === me?.id ? 'avatar-accent' : ''}`} style={{ width: 32, height: 32, fontSize: 10 }}>{p.profiles.initials}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>{p.profiles.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.profiles.username}</p>
              </div>
              {p.user_id === me?.id && <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 800 }}>YOU</span>}
              {p.status === 'won' && <span style={{ fontSize: 11, color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Check size={13} /> Won</span>}
              {p.status === 'eliminated' && <span style={{ fontSize: 11, color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><X size={13} /> Out</span>}
            </div>
          ))
        )}
      </div>

      <Banner msg={err} />

      {status === 'voting' && amParticipant && (
        <Link href={`/vote?challenge=${id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px', fontSize: 14, fontWeight: 800, color: 'var(--amber)', background: 'rgba(245,177,76,0.1)', border: '1px solid rgba(245,177,76,0.4)', borderRadius: 16, marginBottom: 10 }}>
          Vote on participants <ArrowRight size={16} />
        </Link>
      )}

      {status === 'completed' && myParticipant?.status === 'won' && (
        <Link href={`/home/profile/payout?challenge=${id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px', fontSize: 14, fontWeight: 800, color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid var(--accent)', borderRadius: 16, marginBottom: 10 }}>
          <Trophy size={16} /> Collect your winnings
        </Link>
      )}

      {!amParticipant && !amCreator && (status === 'pending' || status === 'live') && (
        <Btn onClick={handleJoin} loading={joining}>
          Join for ${challenge.bet_amount.toFixed(0)} <ArrowRight size={18} />
        </Btn>
      )}

      {amCreator && challenge.type === 'private' && (status === 'pending' || status === 'live') && (
        <Btn variant="surface" onClick={() => router.push(`/home/challenges/${id}/invite`)}>
          Share invite link <ArrowRight size={18} />
        </Btn>
      )}
    </div>
  );
}
